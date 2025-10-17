import { NextRequest, NextResponse } from "next/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"
import { nanoid } from "nanoid"

import { generateEmbedding } from "@/lib/embeddings"
import { createFact } from "@/lib/facts"
import { initializeDatabase } from "@/lib/init-db"
import { SYSTEM_PROMPT, createUserPrompt } from "@/lib/prompts"
import { getRandomQueryText } from "@/lib/query-texts"
import {
  findArticlesByTopics,
  findArticlesByTopicsFuzzy,
} from "@/lib/topic-search"
import { findSimilarArticle } from "@/lib/vector-search"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

// Initialize the Google Generative AI provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()

    // Parse request body for selected topics
    let selectedTopics: string[] = []
    let matchedTopics: string[] = []

    try {
      const body = await request.json()
      selectedTopics = body.selectedTopics || []
    } catch (error) {
      // If no body or invalid JSON, continue with empty topics (fallback to random)
      console.log("No selected topics provided, using random query")
    }

    let article: any = null

    // Try topic-based search first if topics are provided
    if (selectedTopics.length > 0) {
      console.log(
        `🎯 Searching for articles with topics: ${selectedTopics.join(", ")}`
      )

      // Tier 1: Exact topic matching
      const topicArticles = await findArticlesByTopics(selectedTopics, {
        matchType: "any",
        limit: 5,
        timeWindow: 96,
      })

      if (topicArticles.length > 0) {
        article = topicArticles[0] // Use the most relevant article
        matchedTopics = selectedTopics.filter(
          (topic) =>
            article.title.toLowerCase().includes(topic.toLowerCase()) ||
            article.content.toLowerCase().includes(topic.toLowerCase())
        )
        console.log(
          `✅ Found article matching topics: ${matchedTopics.join(", ")}`
        )
      } else {
        // Tier 2: Fuzzy matching fallback
        console.log("❌ No exact matches found, trying fuzzy matching...")

        const fuzzyArticles = await findArticlesByTopicsFuzzy(selectedTopics, {
          matchType: "any",
          limit: 5,
          timeWindow: 96,
        })

        if (fuzzyArticles.length > 0) {
          article = fuzzyArticles[0] // Use the most relevant fuzzy match
          matchedTopics = selectedTopics.filter(
            (topic) =>
              article.title.toLowerCase().includes(topic.toLowerCase()) ||
              article.content.toLowerCase().includes(topic.toLowerCase())
          )
          console.log(
            `✅ Found article with fuzzy matching: ${matchedTopics.join(", ")}`
          )
        } else {
          console.log("❌ No fuzzy matches found, falling back to random query")
        }
      }
    }

    // Fallback to random query if no topics or no matches
    if (!article) {
      const queryText = getRandomQueryText()
      console.log(`🔍 Fallback Query Text: "${queryText}"`)

      const queryEmbedding = await generateEmbedding(queryText)
      console.log(`📊 Query Embedding: ${queryEmbedding.length} dimensions`)

      // Find the most similar article
      article = await findSimilarArticle(queryEmbedding)
    }

    if (!article) {
      console.log("❌ No articles found in database")
      return NextResponse.json(
        {
          success: false,
          error:
            "No news articles available. Please run the news ingestion cron job first.",
        },
        { status: 404 }
      )
    }

    console.log(`📰 Article Found:`, {
      id: article.id,
      title: article.title,
      source: article.source,
      url: article.url,
      published_at: article.published_at,
    })

    // Create the prompt for generating a fun fact
    const systemPrompt = SYSTEM_PROMPT
    const userPrompt = createUserPrompt(article.title, article.content)

    console.log(`🤖 System Prompt: "${systemPrompt}"`)
    console.log(`💬 User Prompt: "${userPrompt}"`)

    // Generate the streaming response using Gemini
    console.log(`🚀 Starting AI generation with Gemini...`)
    const result = await streamText({
      model: google("models/gemini-2.0-flash-lite"),
      system: systemPrompt,
      prompt: userPrompt,
    })

    console.log(`✅ AI generation completed, creating streaming response...`)
    console.log(`📝 Expected JSON format: {"funFact": "..."}`)

    // Create response with metadata
    const response = result.toTextStreamResponse()

    // Add custom headers with article metadata (sanitize for HTTP headers)
    response.headers.set(
      "X-Article-Source",
      article.source.replace(/[^\x00-\x7F]/g, "")
    )
    response.headers.set("X-Article-URL", article.url)
    response.headers.set(
      "X-Article-Title",
      article.title.replace(/[^\x00-\x7F]/g, "")
    )
    response.headers.set(
      "X-Article-Date",
      article.published_at || article.created_at
    )

    // Add matched topics header if topics were used
    if (matchedTopics.length > 0) {
      response.headers.set("X-Matched-Topics", matchedTopics.join(", "))
    }

    // Add cache control headers to prevent caching issues
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0"
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")
    response.headers.set("CDN-Cache-Control", "no-store")
    response.headers.set("Vercel-CDN-Cache-Control", "no-store")
    response.headers.set("Cloudflare-CDN-Cache-Control", "no-store")

    // Add timestamp to prevent caching
    response.headers.set("X-Timestamp", Date.now().toString())

    return response
  } catch (error) {
    console.error("Error generating real-time fact:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate real-time fact",
      },
      { status: 500 }
    )
  }
}

// Allow GET for testing purposes
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()

    const queryText = getRandomQueryText()
    console.log(`🔍 GET - Query Text: "${queryText}"`)

    const queryEmbedding = await generateEmbedding(queryText)
    console.log(`📊 GET - Query Embedding: ${queryEmbedding.length} dimensions`)

    const article = await findSimilarArticle(queryEmbedding)

    if (!article) {
      console.log("❌ GET - No articles found in database")
      return NextResponse.json(
        {
          success: false,
          error: "No news articles available",
        },
        { status: 404 }
      )
    }

    console.log(`📰 GET - Article Found:`, {
      id: article.id,
      title: article.title,
      source: article.source,
      url: article.url,
      published_at: article.published_at,
    })

    return NextResponse.json({
      success: true,
      data: {
        article: {
          id: article.id,
          title: article.title,
          source: article.source,
          url: article.url,
          published_at: article.published_at,
        },
        queryText,
        message: "Use POST to generate streaming fact",
      },
    })
  } catch (error) {
    console.error("Error in GET /api/facts/real-time:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

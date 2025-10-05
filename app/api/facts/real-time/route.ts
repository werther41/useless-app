import { NextRequest, NextResponse } from "next/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"

import { generateEmbedding } from "@/lib/embeddings"
import { initializeDatabase } from "@/lib/init-db"
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

    // Generate query embedding for finding relevant news
    const queryText = "interesting and unusual recent event"
    const queryEmbedding = await generateEmbedding(queryText)

    // Find the most similar article
    const article = await findSimilarArticle(queryEmbedding)

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No news articles available. Please run the news ingestion cron job first.",
        },
        { status: 404 }
      )
    }

    // Create the prompt for generating a fun fact
    const systemPrompt = `You are an assistant that creates short, quirky, and 'useless' fun facts from news articles. The fact should be surprising and tangentially related to the main point of the article. Do not state the obvious. Output only the fact itself.`

    const userPrompt = `Here is the article: "${article.title}\n\n${article.content}". Please generate a fun fact.`

    // Generate the streaming response using Gemini
    const result = await streamText({
      model: google("models/gemini-2.0-flash-lite"),
      system: systemPrompt,
      prompt: userPrompt,
    })

    // Create response with metadata
    const response = result.toTextStreamResponse()

    // Add custom headers with article metadata
    response.headers.set("X-Article-Source", article.source)
    response.headers.set("X-Article-URL", article.url)
    response.headers.set("X-Article-Title", article.title)

    // Add cache control headers matching existing patterns
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

    const queryText = "interesting and unusual recent event"
    const queryEmbedding = await generateEmbedding(queryText)
    const article = await findSimilarArticle(queryEmbedding)

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: "No news articles available",
        },
        { status: 404 }
      )
    }

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

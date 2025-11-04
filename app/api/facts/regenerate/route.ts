import { NextRequest, NextResponse } from "next/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"

import { db } from "@/lib/db"
import { initializeDatabase } from "@/lib/init-db"
import {
  buildSystemPrompt,
  createUserPrompt,
  TonePreset,
} from "@/lib/prompts"

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

    // Parse request body
    let articleId: string | null = null
    let tone: TonePreset | null = null

    try {
      const body = await request.json()
      articleId = body.articleId || null
      tone = body.tone || null

      if (!articleId) {
        return NextResponse.json(
          {
            success: false,
            error: "articleId is required",
          },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      )
    }

    // Fetch the article by ID
    const result = await db.execute(
      `SELECT * FROM news_articles WHERE id = ?`,
      [articleId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Article not found",
        },
        { status: 404 }
      )
    }

    const article = result.rows[0]

    console.log(`📰 Regenerating fact for article: ${articleId}`)
    console.log(`🎭 Tone: ${tone || "default"}`)

    // Create the prompt for generating a new fact with different angle
    const systemPrompt = buildSystemPrompt(tone)
    const userPrompt = createUserPrompt(
      article.title as string,
      article.content as string,
      undefined, // No matched topics for regenerate
      true // isRegenerate = true
    )

    console.log(`🤖 System Prompt: "${systemPrompt.substring(0, 100)}..."`)
    console.log(`💬 User Prompt: "${userPrompt.substring(0, 100)}..."`)

    // Generate the streaming response using Gemini
    console.log(`🚀 Starting AI generation with Gemini...`)
    const aiResult = await streamText({
      model: google("models/gemini-2.0-flash-lite"),
      system: systemPrompt,
      prompt: userPrompt,
    })

    console.log(`✅ AI generation completed, creating streaming response...`)
    console.log(
      `📝 Expected JSON format: {"funFact": "...", "whyInteresting": "...", "sourceSnippet": "..."}`
    )

    // Create response with metadata
    const response = aiResult.toTextStreamResponse()

    // Add custom headers with article metadata (sanitize for HTTP headers)
    response.headers.set(
      "X-Article-Source",
      (article.source as string).replace(/[^\x00-\x7F]/g, "")
    )
    response.headers.set("X-Article-URL", article.url as string)
    response.headers.set(
      "X-Article-Title",
      (article.title as string).replace(/[^\x00-\x7F]/g, "")
    )
    response.headers.set(
      "X-Article-Date",
      (article.published_at as string) || (article.created_at as string)
    )
    response.headers.set("X-Article-ID", article.id as string)

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
    console.error("Error regenerating fact:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to regenerate fact",
      },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"

import { createFact } from "@/lib/facts"
import { initializeDatabase } from "@/lib/init-db"
import { factSchema } from "@/lib/validation"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()

    const body = await request.json()
    const {
      text,
      source,
      source_url,
      why_interesting,
      source_snippet,
      tone,
      article_id,
    } = body

    // Validate the input
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Fact text is required",
        },
        { status: 400 }
      )
    }

    // Generate unique ID and save to database
    const factId = nanoid()
    const savedFact = await createFact({
      id: factId,
      text: text.trim(),
      source: source || null,
      source_url: source_url || null,
      fact_type: "realtime",
      why_interesting: why_interesting || null,
      source_snippet: source_snippet || null,
      tone: tone || null,
      article_id: article_id || null,
    })

    console.log(`💾 Saved real-time fact to database: ${factId}`)

    return NextResponse.json({
      success: true,
      data: {
        id: factId,
        text: savedFact.text,
        source: savedFact.source,
        source_url: savedFact.source_url,
        fact_type: savedFact.fact_type,
        why_interesting: savedFact.why_interesting,
        source_snippet: savedFact.source_snippet,
        tone: savedFact.tone,
        article_id: savedFact.article_id,
        created_at: savedFact.created_at,
        updated_at: savedFact.updated_at,
      },
    })
  } catch (error) {
    console.error("Error saving real-time fact:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save fact",
      },
      { status: 500 }
    )
  }
}

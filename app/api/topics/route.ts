import { NextRequest, NextResponse } from "next/server"

import { getTrendingTopics } from "@/lib/topic-extraction"

// Cache for 15 minutes
export const revalidate = 900

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const timeWindow = parseInt(searchParams.get("timeWindow") || "48")
    const limit = parseInt(searchParams.get("limit") || "10")
    const entityType = searchParams.get("entityType") || undefined

    // Validate parameters
    if (timeWindow < 1 || timeWindow > 168) {
      // 1 hour to 1 week
      return NextResponse.json(
        { error: "timeWindow must be between 1 and 168 hours" },
        { status: 400 }
      )
    }

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "limit must be between 1 and 50" },
        { status: 400 }
      )
    }

    // Get trending topics
    const topics = await getTrendingTopics({
      timeWindow,
      limit,
      entityType,
    })

    // Transform to API response format
    const response = {
      topics: topics.map((topic) => ({
        id: topic.id,
        text: topic.topic_text,
        type: topic.entity_type,
        occurrenceCount: topic.occurrence_count,
        avgTfidfScore: topic.avg_tfidf_score,
        lastSeenAt: topic.last_seen_at,
        combinedScore: topic.occurrence_count * topic.avg_tfidf_score,
      })),
      metadata: {
        timeWindow,
        limit,
        entityType,
        totalTopics: topics.length,
        generatedAt: new Date().toISOString(),
      },
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        "CDN-Cache-Control": "public, s-maxage=900",
        "Vercel-CDN-Cache-Control": "public, s-maxage=900",
      },
    })
  } catch (error) {
    console.error("Error in GET /api/topics:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve trending topics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Optional: POST endpoint for topic suggestions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, limit = 10 } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "query is required and must be a string" },
        { status: 400 }
      )
    }

    if (query.length < 2) {
      return NextResponse.json(
        { error: "query must be at least 2 characters long" },
        { status: 400 }
      )
    }

    // Import the suggestion function
    const { getTopicSuggestions } = await import("@/lib/topic-search")

    const suggestions = await getTopicSuggestions(query, limit)

    return NextResponse.json({
      suggestions: suggestions.map((s) => ({
        text: s.text,
        type: s.type,
        count: s.count,
      })),
      query,
      total: suggestions.length,
    })
  } catch (error) {
    console.error("Error in POST /api/topics:", error)
    return NextResponse.json(
      {
        error: "Failed to get topic suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

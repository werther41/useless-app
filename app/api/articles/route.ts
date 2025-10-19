import { NextRequest, NextResponse } from "next/server"

import { getArticlesByTopics } from "@/lib/articles"

// Cache for 5 minutes
export const revalidate = 300
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Parse query parameters
    const topicsParam = searchParams.get("topics")
    const timeFilter = searchParams.get("timeFilter") || "7d"
    const topicTypesParam = searchParams.get("topicTypes")
    const sortBy = searchParams.get("sortBy") || "score"

    // Validate required parameters
    if (!topicsParam) {
      return NextResponse.json(
        { error: "topics parameter is required" },
        { status: 400 }
      )
    }

    // Parse topics array
    const topics = topicsParam
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    if (topics.length === 0) {
      return NextResponse.json(
        { error: "At least one topic is required" },
        { status: 400 }
      )
    }

    // Parse topic types array
    const topicTypes = topicTypesParam
      ? topicTypesParam
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    // Validate timeFilter
    const validTimeFilters = ["24h", "7d", "30d", "all"]
    if (!validTimeFilters.includes(timeFilter)) {
      return NextResponse.json(
        { error: "timeFilter must be one of: 24h, 7d, 30d, all" },
        { status: 400 }
      )
    }

    // Validate sortBy
    const validSortBy = ["time", "score"]
    if (!validSortBy.includes(sortBy)) {
      return NextResponse.json(
        { error: "sortBy must be one of: time, score" },
        { status: 400 }
      )
    }

    // Convert timeFilter to hours
    let timeWindow: number | null = null
    switch (timeFilter) {
      case "24h":
        timeWindow = 24
        break
      case "7d":
        timeWindow = 168
        break
      case "30d":
        timeWindow = 720
        break
      case "all":
        timeWindow = null
        break
    }

    // Get articles
    const articles = await getArticlesByTopics(topics, {
      timeWindow,
      topicTypes,
      limit: 50,
    })

    // Sort results
    let sortedArticles = [...articles]
    if (sortBy === "time") {
      sortedArticles.sort(
        (a, b) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
      )
    } else {
      // Already sorted by relevance score from the query
      sortedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore)
    }

    // Prepare response
    const response = {
      articles: sortedArticles,
      metadata: {
        totalResults: sortedArticles.length,
        timeFilter,
        searchType: "topic" as const,
        topics,
        topicTypes,
        sortBy,
        generatedAt: new Date().toISOString(),
      },
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, s-maxage=300",
        "Vercel-CDN-Cache-Control": "public, s-maxage=300",
      },
    })
  } catch (error) {
    console.error("Error in GET /api/articles:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve articles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

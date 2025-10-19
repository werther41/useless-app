import { NextRequest, NextResponse } from "next/server"

import { searchArticlesByText } from "@/lib/articles"

// Cache for 5 minutes
export const revalidate = 300
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Parse query parameters
    const query = searchParams.get("q")
    const timeFilter = searchParams.get("timeFilter") || "7d"

    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        { error: "q (query) parameter is required" },
        { status: 400 }
      )
    }

    // Validate query length
    if (query.length < 3) {
      return NextResponse.json(
        { error: "Query must be at least 3 characters long" },
        { status: 400 }
      )
    }

    // Validate timeFilter
    const validTimeFilters = ["24h", "7d", "30d", "all"]
    if (!validTimeFilters.includes(timeFilter)) {
      return NextResponse.json(
        { error: "timeFilter must be one of: 24h, 7d, 30d, all" },
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

    // Search articles
    const articles = await searchArticlesByText(query, {
      timeWindow,
      limit: 20,
    })

    // Prepare response
    const response = {
      articles,
      metadata: {
        totalResults: articles.length,
        timeFilter,
        searchType: "text" as const,
        query,
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
    console.error("Error in GET /api/articles/search:", error)
    return NextResponse.json(
      {
        error: "Failed to search articles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

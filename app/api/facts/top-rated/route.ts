import { NextRequest, NextResponse } from "next/server"

import { getTopRatedFacts } from "@/lib/facts"
import { initializeDatabase } from "@/lib/init-db"

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50) // Max 50 items

    // Get user IP for rating tracking
    const userIp =
      request.ip ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const facts = await getTopRatedFacts(limit, userIp)

    const response = NextResponse.json({
      success: true,
      data: facts,
      meta: {
        limit,
        count: facts.length,
      },
    })

    // Add cache control headers to prevent caching
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")

    return response
  } catch (error) {
    console.error("Error fetching top rated facts:", error)
    return NextResponse.json(
      { error: "Failed to fetch top rated facts" },
      { status: 500 }
    )
  }
}

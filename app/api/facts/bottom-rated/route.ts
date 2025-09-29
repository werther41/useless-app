import { NextRequest, NextResponse } from "next/server"
import { getBottomRatedFacts } from "@/lib/facts"
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

    const facts = await getBottomRatedFacts(limit, userIp)

    return NextResponse.json({
      success: true,
      data: facts,
      meta: {
        limit,
        count: facts.length,
      },
    })
  } catch (error) {
    console.error("Error fetching bottom rated facts:", error)
    return NextResponse.json(
      { error: "Failed to fetch bottom rated facts" },
      { status: 500 }
    )
  }
}
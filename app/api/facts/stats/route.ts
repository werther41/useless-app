import { NextRequest, NextResponse } from "next/server"

import { getFactStatistics } from "@/lib/facts"
import { initializeDatabase } from "@/lib/init-db"

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()

    const stats = await getFactStatistics()

    const response = NextResponse.json({
      success: true,
      data: stats,
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
    console.error("Error fetching fact statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch fact statistics" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"

import { getRandomFact } from "@/lib/facts"
import { initializeDatabase } from "@/lib/init-db"

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()

    // Get user IP for rating tracking
    const userIp =
      request.ip ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const fact = await getRandomFact(userIp)

    if (!fact) {
      return NextResponse.json({ error: "No facts available" }, { status: 404 })
    }

    const response = NextResponse.json({
      success: true,
      data: fact,
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
    console.error("Error fetching random fact:", error)
    return NextResponse.json(
      { error: "Failed to fetch random fact" },
      { status: 500 }
    )
  }
}

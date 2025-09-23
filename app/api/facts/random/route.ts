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

    return NextResponse.json({
      success: true,
      data: fact,
    })
  } catch (error) {
    console.error("Error fetching random fact:", error)
    return NextResponse.json(
      { error: "Failed to fetch random fact" },
      { status: 500 }
    )
  }
}

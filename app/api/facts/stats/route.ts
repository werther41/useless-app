import { NextRequest, NextResponse } from "next/server"
import { getFactStatistics } from "@/lib/facts"
import { initializeDatabase } from "@/lib/init-db"

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()

    const stats = await getFactStatistics()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching fact statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch fact statistics" },
      { status: 500 }
    )
  }
}
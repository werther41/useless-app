import { NextRequest, NextResponse } from "next/server"

import { getFactById } from "@/lib/facts"
import { initializeDatabase } from "@/lib/init-db"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize database if needed
    await initializeDatabase()

    const userIp =
      request.ip ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const fact = await getFactById(params.id, userIp)

    if (!fact) {
      return NextResponse.json(
        {
          success: false,
          error: "Fact not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: fact,
    })
  } catch (error) {
    console.error("Error fetching fact:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch fact",
      },
      { status: 500 }
    )
  }
}

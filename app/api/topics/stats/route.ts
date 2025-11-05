import { NextResponse } from "next/server"

import { getTopicStats } from "@/lib/topic-extraction"

// Cache for 5 minutes
export const revalidate = 300

export async function GET() {
  try {
    const stats = await getTopicStats()

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, s-maxage=300",
        "Vercel-CDN-Cache-Control": "public, s-maxage=300",
      },
    })
  } catch (error) {
    console.error("Error in GET /api/topics/stats:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve topic stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

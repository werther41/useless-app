import { NextRequest, NextResponse } from "next/server"

import { getAllFacts, getTopRatedFacts } from "@/lib/facts"
import { paginationSchema } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
    })

    const userIp =
      request.ip ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const type = searchParams.get("type")

    let facts
    if (type === "top-rated") {
      facts = await getTopRatedFacts(limit, userIp)
    } else {
      facts = await getAllFacts(page, limit, userIp)
    }

    return NextResponse.json({
      success: true,
      data: facts,
      pagination: {
        page,
        limit,
        total: facts.length,
      },
    })
  } catch (error) {
    console.error("Error fetching facts:", error)
    return NextResponse.json(
      { error: "Failed to fetch facts" },
      { status: 500 }
    )
  }
}

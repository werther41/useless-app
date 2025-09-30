import { NextRequest, NextResponse } from "next/server"

import { getAllFacts, getTopRatedFacts } from "@/lib/facts"
import { paginationSchema } from "@/lib/validation"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

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

    const response = NextResponse.json({
      success: true,
      data: facts,
      pagination: {
        page,
        limit,
        total: facts.length,
      },
    })

    // Add aggressive cache control headers to prevent all caching
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0"
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")
    response.headers.set("CDN-Cache-Control", "no-store")
    response.headers.set("Vercel-CDN-Cache-Control", "no-store")
    response.headers.set("Cloudflare-CDN-Cache-Control", "no-store")

    return response
  } catch (error) {
    console.error("Error fetching facts:", error)
    return NextResponse.json(
      { error: "Failed to fetch facts" },
      { status: 500 }
    )
  }
}

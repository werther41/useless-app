import { NextRequest, NextResponse } from "next/server"

import { getFactStatistics } from "@/lib/facts"
import { initializeDatabase } from "@/lib/init-db"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()

    const stats = await getFactStatistics()

    const response = NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
      nonce: Math.random().toString(36).substring(7),
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
    console.error("Error fetching fact statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch fact statistics" },
      { status: 500 }
    )
  }
}

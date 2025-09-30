import { NextRequest, NextResponse } from "next/server"

import { getRandomFact } from "@/lib/facts"
import { initializeDatabase } from "@/lib/init-db"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

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
    console.error("Error fetching random fact:", error)
    return NextResponse.json(
      { error: "Failed to fetch random fact" },
      { status: 500 }
    )
  }
}

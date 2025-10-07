import { NextRequest, NextResponse } from "next/server"

import { initializeDatabase } from "@/lib/init-db"
import { fetchAndStoreNews, getNewsArticleCount } from "@/lib/news-ingestion"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Verify authorization header
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error("CRON_SECRET environment variable not set")
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Invalid authorization header for cron job")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize database if needed
    await initializeDatabase()

    console.log("Starting news retrieval cron job...")
    const startTime = Date.now()

    // Fetch and store news
    const results = await fetchAndStoreNews()
    const totalArticles = await getNewsArticleCount()

    const duration = Date.now() - startTime

    const response = {
      success: true,
      message: "News retrieval completed",
      results: {
        articlesAdded: results.success,
        articlesSkipped: results.skipped,
        errors: results.errors,
        totalArticlesInDatabase: totalArticles,
        duration: `${duration}ms`,
      },
      details: results.details,
      timestamp: new Date().toISOString(),
    }

    console.log("News retrieval completed:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in news retrieval cron job:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Allow GET for testing purposes (remove in production)
export async function GET(request: NextRequest) {
  try {
    const isVercelCron = !!request.headers.get("x-vercel-cron")
    await initializeDatabase()

    console.log(
      "Starting news retrieval cron job (GET)",
      isVercelCron ? "[vercel-cron]" : "[no-cron-header]"
    )
    const startTime = Date.now()

    const results = await fetchAndStoreNews()
    const totalArticles = await getNewsArticleCount()

    const duration = Date.now() - startTime

    const response = {
      success: true,
      message: "News retrieval completed (GET)",
      results: {
        articlesAdded: results.success,
        articlesSkipped: results.skipped,
        errors: results.errors,
        totalArticlesInDatabase: totalArticles,
        duration: `${duration}ms`,
      },
      details: results.details,
      timestamp: new Date().toISOString(),
    }

    console.log("News retrieval completed (GET):", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in news retrieval cron job (GET):", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

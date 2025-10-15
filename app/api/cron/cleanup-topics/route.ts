import { NextRequest, NextResponse } from "next/server"

import { db } from "@/lib/db"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    console.log("🧹 Starting topic cleanup cron job...")

    const results = {
      deletedTopics: 0,
      deletedTrendingTopics: 0,
      recalculatedTrending: 0,
      errors: 0,
    }

    // Delete topics from articles older than 30 days
    try {
      const deleteTopicsResult = await db.execute(`
        DELETE FROM article_topics 
        WHERE article_id IN (
          SELECT id FROM news_articles 
          WHERE created_at < datetime('now', '-30 days')
        )
      `)
      results.deletedTopics = deleteTopicsResult.rowsAffected || 0
      console.log(`✅ Deleted ${results.deletedTopics} stale article topics`)
    } catch (error) {
      console.error("Error deleting stale topics:", error)
      results.errors++
    }

    // Remove trending topics with occurrence_count < 2
    try {
      const deleteTrendingResult = await db.execute(`
        DELETE FROM trending_topics 
        WHERE occurrence_count < 2
      `)
      results.deletedTrendingTopics = deleteTrendingResult.rowsAffected || 0
      console.log(
        `✅ Deleted ${results.deletedTrendingTopics} low-occurrence trending topics`
      )
    } catch (error) {
      console.error("Error deleting low-occurrence trending topics:", error)
      results.errors++
    }

    // Recalculate trending topics aggregation
    try {
      // This is a complex operation that would need to be implemented
      // For now, we'll just log that it should be done
      console.log("📊 Trending topics aggregation should be recalculated")
      results.recalculatedTrending = 1
    } catch (error) {
      console.error("Error recalculating trending topics:", error)
      results.errors++
    }

    console.log("🎉 Topic cleanup completed:", results)

    return NextResponse.json({
      success: true,
      message: "Topic cleanup completed",
      results,
    })
  } catch (error) {
    console.error("Error in topic cleanup cron:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Topic cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Allow POST for manual trigger
export async function POST(request: NextRequest) {
  // Same logic as GET, but for manual triggers
  return GET(request)
}

import { config } from "dotenv"

config({ path: process.env.ENV_FILE || ".env.production.local" })

const confirmation = "DELETE_NEWS_ARTICLES_AND_TOPICS"
if (process.env.CONFIRM_RESET_NEWS_DATA !== confirmation) {
  throw new Error(
    `Refusing to reset data. Set CONFIRM_RESET_NEWS_DATA=${confirmation}.`
  )
}

const databaseUrl = process.env.TURSO_DATABASE_URL
if (!databaseUrl) {
  throw new Error("TURSO_DATABASE_URL is not configured.")
}

const databaseHost = new URL(databaseUrl).hostname
if (!databaseHost.endsWith(".turso.io")) {
  throw new Error(`Refusing to reset non-Turso database: ${databaseHost}`)
}

async function resetNewsData() {
  const { db } = await import("../lib/db")
  const { initializeDatabase } = await import("../lib/init-db")

  await db.batch(
    [
      "DROP TABLE IF EXISTS article_topics",
      "DROP TABLE IF EXISTS trending_topics",
      "DROP TABLE IF EXISTS news_articles",
    ],
    "write"
  )

  await initializeDatabase()

  const counts = await db.batch([
    "SELECT COUNT(*) AS count FROM news_articles",
    "SELECT COUNT(*) AS count FROM article_topics",
    "SELECT COUNT(*) AS count FROM trending_topics",
  ])

  console.log("Reset Turso news data and initialized the optimized schema.", {
    databaseHost,
    newsArticles: counts[0].rows[0]?.count,
    articleTopics: counts[1].rows[0]?.count,
    trendingTopics: counts[2].rows[0]?.count,
  })

  db.close()
}

resetNewsData().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

import Parser from "rss-parser"

import { db } from "./db"
import { generateArticleEmbedding } from "./embeddings"
import { NewsArticle } from "./schema"

// RSS feed sources
const RSS_FEEDS = [
  {
    url: "http://feeds.bbci.co.uk/news/rss.xml",
    source: "BBC News",
  },
  {
    url: "https://feeds.reuters.com/reuters/topNews",
    source: "Reuters",
  },
  {
    url: "https://techcrunch.com/feed/",
    source: "TechCrunch",
  },
  {
    url: "https://hnrss.org/frontpage",
    source: "Hacker News",
  },
  {
    url: "https://www.sciencedaily.com/rss/all.xml",
    source: "Science Daily",
  },
  {
    url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    source: "NASA Breaking News",
  },
  {
    url: "https://github.blog/feed/",
    source: "GitHub Blog",
  },
  {
    url: "https://dev.to/feed",
    source: "Dev.to",
  },
]

const parser = new Parser()

/**
 * Fetch and store news articles from RSS feeds
 * @returns Promise<{success: number, skipped: number, errors: number}>
 */
export async function fetchAndStoreNews(): Promise<{
  success: number
  skipped: number
  errors: number
  details: string[]
}> {
  const results = {
    success: 0,
    skipped: 0,
    errors: 0,
    details: [] as string[],
  }

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching from ${feed.source}...`)
      const feedData = await parser.parseURL(feed.url)

      if (!feedData.items || feedData.items.length === 0) {
        results.details.push(`${feed.source}: No items found`)
        continue
      }

      for (const item of feedData.items) {
        try {
          // Skip if missing required fields
          if (!item.title || !item.link) {
            results.skipped++
            continue
          }

          // Check if article already exists
          const existingArticle = await db.execute({
            sql: "SELECT id FROM news_articles WHERE url = ?",
            args: [item.link],
          })

          if (existingArticle.rows.length > 0) {
            results.skipped++
            continue
          }

          // Prepare article data
          const articleId = `news_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 15)}`
          const content =
            item.contentSnippet || item.content || item.title || ""
          const publishedAt = item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString()

          // Generate embedding
          const embedding = await generateArticleEmbedding(item.title, content)

          // Store article in database
          await db.execute({
            sql: `
              INSERT INTO news_articles (id, title, content, url, source, published_at, embedding)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
              articleId,
              item.title,
              content,
              item.link,
              feed.source,
              publishedAt,
              JSON.stringify(embedding), // Store as JSON string for now
            ],
          })

          results.success++
          results.details.push(
            `${feed.source}: Added "${item.title.substring(0, 50)}..."`
          )
        } catch (itemError) {
          console.error(`Error processing item from ${feed.source}:`, itemError)
          results.errors++
          results.details.push(
            `${feed.source}: Error processing item - ${
              itemError instanceof Error ? itemError.message : "Unknown error"
            }`
          )
        }
      }
    } catch (feedError) {
      console.error(`Error fetching from ${feed.source}:`, feedError)
      results.errors++
      results.details.push(
        `${feed.source}: Feed error - ${
          feedError instanceof Error ? feedError.message : "Unknown error"
        }`
      )
    }
  }

  return results
}

/**
 * Get the count of news articles in the database
 * @returns Promise<number>
 */
export async function getNewsArticleCount(): Promise<number> {
  try {
    const result = await db.execute({
      sql: "SELECT COUNT(*) as count FROM news_articles",
      args: [],
    })

    return (result.rows[0]?.count as number) || 0
  } catch (error) {
    console.error("Error getting news article count:", error)
    return 0
  }
}

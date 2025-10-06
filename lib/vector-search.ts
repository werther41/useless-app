import { db } from "./db"
import { NewsArticle } from "./schema"

/**
 * Find a similar article to a given query embedding from recent news (last 7 days)
 * Uses hybrid approach: similarity + recency weighting with randomness for variety
 * @param queryEmbedding - The embedding vector to search for
 * @returns Promise<NewsArticle | null> - A similar recent article or null if none found
 */
export async function findSimilarArticle(
  queryEmbedding: number[]
): Promise<NewsArticle | null> {
  try {
    // Convert embedding array to JSON string for SQL query
    const embeddingJson = JSON.stringify(queryEmbedding)

    // Get top 10 most similar articles from last 7 days and randomly pick one for variety
    const result = await db.execute({
      sql: `
        SELECT id, title, content, url, source, published_at, created_at, embedding
        FROM news_articles 
        WHERE embedding IS NOT NULL 
          AND published_at >= datetime('now', '-7 days')
        ORDER BY 
          vector_distance_cos(embedding, ?) ASC,
          published_at DESC
        LIMIT 10
      `,
      args: [embeddingJson],
    })

    if (result.rows.length === 0) {
      return null
    }

    // Randomly select from the top 10 most similar recent articles for variety
    const randomIndex = Math.floor(Math.random() * result.rows.length)
    const row = result.rows[randomIndex]

    return {
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      url: row.url as string,
      source: row.source as string,
      published_at: row.published_at as string,
      created_at: row.created_at as string,
      embedding: JSON.parse(row.embedding as string) as number[],
    }
  } catch (error) {
    console.error("Error finding similar article:", error)
    return null
  }
}

/**
 * Find multiple similar articles to a given query embedding from recent news (last 7 days)
 * @param queryEmbedding - The embedding vector to search for
 * @param limit - Maximum number of articles to return (default: 5)
 * @returns Promise<NewsArticle[]> - Array of similar recent articles
 */
export async function findSimilarArticles(
  queryEmbedding: number[],
  limit: number = 5
): Promise<NewsArticle[]> {
  try {
    const embeddingJson = JSON.stringify(queryEmbedding)

    const result = await db.execute({
      sql: `
        SELECT id, title, content, url, source, published_at, created_at, embedding
        FROM news_articles 
        WHERE embedding IS NOT NULL 
          AND published_at >= datetime('now', '-7 days')
        ORDER BY 
          vector_distance_cos(embedding, ?) ASC,
          published_at DESC
        LIMIT ?
      `,
      args: [embeddingJson, limit],
    })

    return result.rows.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      url: row.url as string,
      source: row.source as string,
      published_at: row.published_at as string,
      created_at: row.created_at as string,
      embedding: JSON.parse(row.embedding as string) as number[],
    }))
  } catch (error) {
    console.error("Error finding similar articles:", error)
    return []
  }
}

/**
 * Get a random article from recent news (last 7 days)
 * @returns Promise<NewsArticle | null> - A random recent article or null if none found
 */
export async function getRandomArticle(): Promise<NewsArticle | null> {
  try {
    const result = await db.execute({
      sql: `
        SELECT id, title, content, url, source, published_at, created_at, embedding
        FROM news_articles 
        WHERE embedding IS NOT NULL 
          AND published_at >= datetime('now', '-7 days')
        ORDER BY RANDOM()
        LIMIT 1
      `,
      args: [],
    })

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      url: row.url as string,
      source: row.source as string,
      published_at: row.published_at as string,
      created_at: row.created_at as string,
      embedding: JSON.parse(row.embedding as string) as number[],
    }
  } catch (error) {
    console.error("Error getting random article:", error)
    return null
  }
}

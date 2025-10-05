import { db } from "./db"
import { NewsArticle } from "./schema"

/**
 * Find the most similar article to a given query embedding
 * @param queryEmbedding - The embedding vector to search for
 * @returns Promise<NewsArticle | null> - The most similar article or null if none found
 */
export async function findSimilarArticle(
  queryEmbedding: number[]
): Promise<NewsArticle | null> {
  try {
    // Convert embedding array to JSON string for SQL query
    const embeddingJson = JSON.stringify(queryEmbedding)

    // Use Turso's vector distance function to find the most similar article
    const result = await db.execute({
      sql: `
        SELECT id, title, content, url, source, published_at, created_at, embedding
        FROM news_articles 
        WHERE embedding IS NOT NULL
        ORDER BY vector_distance_cos(embedding, ?) ASC
        LIMIT 1
      `,
      args: [embeddingJson],
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
    console.error("Error finding similar article:", error)
    return null
  }
}

/**
 * Find multiple similar articles to a given query embedding
 * @param queryEmbedding - The embedding vector to search for
 * @param limit - Maximum number of articles to return (default: 5)
 * @returns Promise<NewsArticle[]> - Array of similar articles
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
        ORDER BY vector_distance_cos(embedding, ?) ASC
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
 * Get a random article from the database
 * @returns Promise<NewsArticle | null> - A random article or null if none found
 */
export async function getRandomArticle(): Promise<NewsArticle | null> {
  try {
    const result = await db.execute({
      sql: `
        SELECT id, title, content, url, source, published_at, created_at, embedding
        FROM news_articles 
        WHERE embedding IS NOT NULL
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

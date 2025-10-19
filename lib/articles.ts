import { db } from "./db"
import { generateEmbedding } from "./embeddings"
import { NewsArticle } from "./schema"

export interface ArticleWithRelevance extends NewsArticle {
  snippet: string
  relevanceScore: number
  matchedTopics: string[]
}

export interface ArticleSearchResult {
  articles: ArticleWithRelevance[]
  metadata: {
    totalResults: number
    timeFilter: string
    searchType: "topic" | "text"
    query?: string
    topics?: string[]
  }
}

/**
 * Get articles by selected topics with intelligent matching
 * Tries ALL match first, falls back to ANY if < 3 results
 */
export async function getArticlesByTopics(
  topics: string[],
  options: {
    timeWindow?: number | null // hours, null = all time
    topicTypes?: string[]
    limit?: number
  } = {}
): Promise<ArticleWithRelevance[]> {
  const { timeWindow = null, topicTypes = [], limit = 20 } = options

  if (topics.length === 0) {
    return []
  }

  try {
    // Normalize topic texts for matching
    const normalizedTopics = topics.map((text) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "")
        .trim()
    )

    // Build time filter clause
    const timeFilter = timeWindow
      ? `AND na.created_at > datetime('now', '-${timeWindow} hours')`
      : ""

    // Build topic type filter clause
    const topicTypeFilter =
      topicTypes.length > 0
        ? `AND at.entity_type IN (${topicTypes.map(() => "?").join(", ")})`
        : ""

    // Try ALL match first
    let query = `
      SELECT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at,
             GROUP_CONCAT(DISTINCT at.entity_text) as matched_topics,
             COUNT(DISTINCT at.entity_text) as topic_matches,
             AVG(at.tfidf_score) as avg_tfidf_score,
             MAX(at.tfidf_score) as max_tfidf_score
      FROM news_articles na
      INNER JOIN article_topics at ON na.id = at.article_id
      WHERE LOWER(REPLACE(REPLACE(at.entity_text, ' ', ''), '-', '')) IN (${normalizedTopics
        .map(() => "?")
        .join(", ")})
      ${timeFilter}
      ${topicTypeFilter}
      GROUP BY na.id
      HAVING topic_matches = ?
      ORDER BY topic_matches DESC, avg_tfidf_score DESC, na.published_at DESC
      LIMIT ?
    `

    let params = [
      ...normalizedTopics,
      ...topicTypes,
      normalizedTopics.length,
      limit,
    ]

    let result = await db.execute(query, params)

    // If we got < 3 results, fall back to ANY match
    if (result.rows.length < 3) {
      query = `
          SELECT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at,
                 GROUP_CONCAT(DISTINCT at.entity_text) as matched_topics,
                 COUNT(DISTINCT at.entity_text) as topic_matches,
                 AVG(at.tfidf_score) as avg_tfidf_score,
                 MAX(at.tfidf_score) as max_tfidf_score
          FROM news_articles na
          INNER JOIN article_topics at ON na.id = at.article_id
          WHERE LOWER(REPLACE(REPLACE(at.entity_text, ' ', ''), '-', '')) IN (${normalizedTopics
            .map(() => "?")
            .join(", ")})
          ${timeFilter}
          ${topicTypeFilter}
          GROUP BY na.id
          ORDER BY topic_matches DESC, max_tfidf_score DESC, na.published_at DESC
          LIMIT ?
        `

      params = [...normalizedTopics, ...topicTypes, limit]
      result = await db.execute(query, params)
    }

    return result.rows.map((row) => {
      const article: NewsArticle = {
        id: row.id as string,
        title: row.title as string,
        content: row.content as string,
        url: row.url as string,
        source: row.source as string,
        published_at: row.published_at as string,
        created_at: row.created_at as string,
        embedding: [], // Not needed in API responses
      }

      const matchedTopics = (row.matched_topics as string)?.split(",") || []
      const topicMatches = row.topic_matches as number
      const avgTfidfScore = row.avg_tfidf_score as number
      const maxTfidfScore = row.max_tfidf_score as number

      // Calculate relevance score: (topic_matches / total_topics) * avg_tfidf_score * recency_factor
      const topicMatchRatio = topicMatches / topics.length
      const recencyFactor = timeWindow ? 1.0 : 0.8 // Slight penalty for older articles
      const relevanceScore =
        topicMatchRatio * (avgTfidfScore || maxTfidfScore) * recencyFactor

      return {
        ...article,
        snippet:
          article.content.substring(0, 600) +
          (article.content.length > 600 ? "..." : ""),
        relevanceScore,
        matchedTopics,
      }
    })
  } catch (error) {
    console.error("Error finding articles by topics:", error)
    return []
  }
}

/**
 * Search articles by free-text query using vector embeddings
 */
export async function searchArticlesByText(
  query: string,
  options: {
    timeWindow?: number | null // hours, null = all time
    limit?: number
  } = {}
): Promise<ArticleWithRelevance[]> {
  const { timeWindow = null, limit = 20 } = options

  if (!query || query.length < 3) {
    return []
  }

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Build time filter clause
    const timeFilter = timeWindow
      ? `AND na.created_at > datetime('now', '-${timeWindow} hours')`
      : ""

    // Search using vector similarity
    const embeddingJson = JSON.stringify(queryEmbedding)

    const query_sql = `
      SELECT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at,
             GROUP_CONCAT(DISTINCT at.entity_text) as matched_topics,
             COUNT(DISTINCT at.entity_text) as topic_matches,
             AVG(at.tfidf_score) as avg_tfidf_score
      FROM news_articles na
      LEFT JOIN article_topics at ON na.id = at.article_id
      WHERE na.embedding IS NOT NULL
      ${timeFilter}
      GROUP BY na.id
      ORDER BY vector_distance_cos(na.embedding, ?) ASC
      LIMIT ?
    `

    const result = await db.execute(query_sql, [embeddingJson, limit])

    return result.rows.map((row) => {
      const article: NewsArticle = {
        id: row.id as string,
        title: row.title as string,
        content: row.content as string,
        url: row.url as string,
        source: row.source as string,
        published_at: row.published_at as string,
        created_at: row.created_at as string,
        embedding: [], // Not needed in API responses
      }

      const matchedTopics =
        (row.matched_topics as string)?.split(",").filter(Boolean) || []
      const topicMatches = row.topic_matches as number
      const avgTfidfScore = row.avg_tfidf_score as number

      // For text search, relevance is based on vector similarity (inverse of distance)
      // We'll use a placeholder score since we don't have the actual distance
      const relevanceScore =
        1.0 - (result.rows.indexOf(row) / result.rows.length) * 0.5

      return {
        ...article,
        snippet:
          article.content.substring(0, 350) +
          (article.content.length > 350 ? "..." : ""),
        relevanceScore,
        matchedTopics,
      }
    })
  } catch (error) {
    console.error("Error searching articles by text:", error)
    return []
  }
}

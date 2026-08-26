import { db } from "./db"
import { executeWithRetry } from "./db-utils"
import { generateEmbedding } from "./embeddings"
import { normalizeTopicInputs } from "./entity-normalize"
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
 * Ranks all matching articles in one query, preferring more topic matches.
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
    const normalizedTopics = normalizeTopicInputs(topics)
    if (normalizedTopics.length === 0) return []

    // Build time filter clause
    const timeFilter = timeWindow
      ? "AND na.published_at > datetime('now', ?)"
      : ""

    // Build topic type filter clause
    const topicTypeFilter =
      topicTypes.length > 0
        ? `AND at.entity_type IN (${topicTypes.map(() => "?").join(", ")})`
        : ""

    const query = `
      WITH ranked_articles AS (
        SELECT
          at.article_id,
          GROUP_CONCAT(DISTINCT at.entity_text) AS matched_topics,
          COUNT(DISTINCT at.entity_text_normalized) AS topic_matches,
          AVG(at.tfidf_score) AS avg_tfidf_score,
          MAX(at.tfidf_score) AS max_tfidf_score,
          na.published_at
        FROM article_topics at
        INNER JOIN news_articles na ON na.id = at.article_id
        WHERE at.entity_text_normalized IN (${normalizedTopics
          .map(() => "?")
          .join(", ")})
        ${timeFilter}
        ${topicTypeFilter}
        GROUP BY at.article_id
        ORDER BY topic_matches DESC, max_tfidf_score DESC, na.published_at DESC
        LIMIT ?
      )
      SELECT
        na.id, na.title, na.content, na.url, na.source,
        na.published_at, na.created_at,
        ranked_articles.matched_topics,
        ranked_articles.topic_matches,
        ranked_articles.avg_tfidf_score,
        ranked_articles.max_tfidf_score
      FROM ranked_articles
      INNER JOIN news_articles na ON na.id = ranked_articles.article_id
      ORDER BY ranked_articles.topic_matches DESC,
               ranked_articles.max_tfidf_score DESC,
               ranked_articles.published_at DESC
    `

    const params = [
      ...normalizedTopics,
      ...(timeWindow ? [`-${timeWindow} hours`] : []),
      ...topicTypes,
      limit,
    ]

    const result = await executeWithRetry(query, params)

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
      const topicMatchRatio = topicMatches / normalizedTopics.length
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
 * Get recent articles sorted by publication date
 */
export async function getRecentArticles(
  options: {
    timeWindow?: number | null // hours, null = all time
    limit?: number
  } = {}
): Promise<ArticleWithRelevance[]> {
  const { timeWindow = null, limit = 50 } = options

  try {
    // Build time filter clause
    const timeFilter = timeWindow
      ? "WHERE published_at > datetime('now', ?)"
      : ""

    const query = `
      WITH recent_articles AS (
        SELECT id, title, content, url, source, published_at, created_at
        FROM news_articles
        ${timeFilter}
        ORDER BY published_at DESC
        LIMIT ?
      )
      SELECT
             recent_articles.id, recent_articles.title, recent_articles.content,
             recent_articles.url, recent_articles.source,
             recent_articles.published_at, recent_articles.created_at,
             GROUP_CONCAT(DISTINCT at.entity_text) as matched_topics
      FROM recent_articles
      LEFT JOIN article_topics at ON recent_articles.id = at.article_id
      GROUP BY recent_articles.id
      ORDER BY recent_articles.published_at DESC
    `

    const result = await executeWithRetry(query, [
      ...(timeWindow ? [`-${timeWindow} hours`] : []),
      limit,
    ])

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

      return {
        ...article,
        snippet:
          article.content.substring(0, 600) +
          (article.content.length > 600 ? "..." : ""),
        relevanceScore: 1.0, // All recent articles get the same score
        matchedTopics,
      }
    })
  } catch (error) {
    console.error("Error getting recent articles:", error)
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

    const embeddingJson = JSON.stringify(queryEmbedding)
    const candidateLimit = Math.max(limit * 5, 100)

    const nearestQuery = timeWindow
      ? `
          SELECT
            id AS article_id,
            vector_distance_cos(embedding, vector32(?)) AS distance
          FROM news_articles
          WHERE embedding IS NOT NULL
            AND published_at > datetime('now', ?)
          ORDER BY distance ASC
          LIMIT ?
        `
      : `
          SELECT
            na.id AS article_id,
            vector_distance_cos(na.embedding, vector32(?)) AS distance
          FROM vector_top_k(
            'idx_news_articles_embedding',
            vector32(?),
            ?
          ) AS nearest
          INNER JOIN news_articles na ON na.rowid = nearest.id
          ORDER BY distance ASC
          LIMIT ?
        `

    const querySql = `
      WITH nearest_articles AS (
        ${nearestQuery}
      )
      SELECT
        na.id, na.title, na.content, na.url, na.source,
        na.published_at, na.created_at,
        nearest_articles.distance,
        GROUP_CONCAT(DISTINCT at.entity_text) AS matched_topics
      FROM nearest_articles
      INNER JOIN news_articles na ON na.id = nearest_articles.article_id
      LEFT JOIN article_topics at ON na.id = at.article_id
      GROUP BY na.id
      ORDER BY nearest_articles.distance ASC
      LIMIT ?
    `

    const params = timeWindow
      ? [embeddingJson, `-${timeWindow} hours`, candidateLimit, limit]
      : [embeddingJson, embeddingJson, candidateLimit, candidateLimit, limit]

    const result = await executeWithRetry(querySql, params)

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
      const distance = Number(row.distance)
      const relevanceScore = Math.max(0, Math.min(1, 1 - distance / 2))

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

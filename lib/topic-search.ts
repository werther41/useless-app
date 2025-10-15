import { db } from "./db"
import { NewsArticle } from "./schema"

export interface TopicSearchOptions {
  matchType?: "any" | "all" // OR vs AND logic
  limit?: number
  timeWindow?: number // hours
}

/**
 * Find articles matching selected topics
 */
export async function findArticlesByTopics(
  topicTexts: string[],
  options: TopicSearchOptions = {}
): Promise<NewsArticle[]> {
  const { matchType = "any", limit = 5, timeWindow = 48 } = options

  if (topicTexts.length === 0) {
    return []
  }

  try {
    // Normalize topic texts for matching
    const normalizedTopics = topicTexts.map((text) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim()
    )

    // Build query based on match type
    let query: string
    let params: any[]

    if (matchType === "all") {
      // AND logic: article must match ALL topics
      query = `
        SELECT DISTINCT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at, na.embedding
        FROM news_articles na
        INNER JOIN article_topics at ON na.id = at.article_id
        WHERE na.created_at > datetime('now', '-${timeWindow} hours')
        AND LOWER(REPLACE(REPLACE(at.entity_text, ' ', ''), '-', '')) IN (${normalizedTopics
          .map(() => "?")
          .join(", ")})
        GROUP BY na.id
        HAVING COUNT(DISTINCT at.entity_text) = ?
        ORDER BY na.published_at DESC, at.tfidf_score DESC
        LIMIT ?
      `
      params = [...normalizedTopics, normalizedTopics.length, limit]
    } else {
      // OR logic: article matches ANY topic (default)
      query = `
        SELECT DISTINCT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at, na.embedding,
               MAX(at.tfidf_score) as max_tfidf_score
        FROM news_articles na
        INNER JOIN article_topics at ON na.id = at.article_id
        WHERE na.created_at > datetime('now', '-${timeWindow} hours')
        AND LOWER(REPLACE(REPLACE(at.entity_text, ' ', ''), '-', '')) IN (${normalizedTopics
          .map(() => "?")
          .join(", ")})
        GROUP BY na.id
        ORDER BY max_tfidf_score DESC, na.published_at DESC
        LIMIT ?
      `
      params = [...normalizedTopics, limit]
    }

    const result = await db.execute(query, params)

    return result.rows.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      url: row.url as string,
      source: row.source as string,
      published_at: row.published_at as string,
      created_at: row.created_at as string,
      embedding: JSON.parse(row.embedding as string), // Parse JSON string back to array
    }))
  } catch (error) {
    console.error("Error finding articles by topics:", error)
    return []
  }
}

/**
 * Find articles by topic with fuzzy matching
 */
export async function findArticlesByTopicsFuzzy(
  topicTexts: string[],
  options: TopicSearchOptions = {}
): Promise<NewsArticle[]> {
  const { matchType = "any", limit = 5, timeWindow = 48 } = options

  if (topicTexts.length === 0) {
    return []
  }

  try {
    // Create LIKE patterns for fuzzy matching
    const likePatterns = topicTexts.map((text) => `%${text.toLowerCase()}%`)

    let query: string
    let params: any[]

    if (matchType === "all") {
      // AND logic with fuzzy matching
      query = `
        SELECT DISTINCT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at, na.embedding
        FROM news_articles na
        INNER JOIN article_topics at ON na.id = at.article_id
        WHERE na.created_at > datetime('now', '-${timeWindow} hours')
        AND (${likePatterns
          .map(() => "LOWER(at.entity_text) LIKE ?")
          .join(" AND ")})
        GROUP BY na.id
        HAVING COUNT(DISTINCT at.entity_text) >= ?
        ORDER BY na.published_at DESC, at.tfidf_score DESC
        LIMIT ?
      `
      params = [...likePatterns, Math.min(likePatterns.length, 2), limit]
    } else {
      // OR logic with fuzzy matching
      query = `
        SELECT DISTINCT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at, na.embedding,
               MAX(at.tfidf_score) as max_tfidf_score
        FROM news_articles na
        INNER JOIN article_topics at ON na.id = at.article_id
        WHERE na.created_at > datetime('now', '-${timeWindow} hours')
        AND (${likePatterns
          .map(() => "LOWER(at.entity_text) LIKE ?")
          .join(" OR ")})
        GROUP BY na.id
        ORDER BY max_tfidf_score DESC, na.published_at DESC
        LIMIT ?
      `
      params = [...likePatterns, limit]
    }

    const result = await db.execute(query, params)

    return result.rows.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      url: row.url as string,
      source: row.source as string,
      published_at: row.published_at as string,
      created_at: row.created_at as string,
      embedding: JSON.parse(row.embedding as string),
    }))
  } catch (error) {
    console.error("Error finding articles by topics (fuzzy):", error)
    return []
  }
}

/**
 * Get topic suggestions based on partial input
 */
export async function getTopicSuggestions(
  partialText: string,
  limit: number = 10
): Promise<Array<{ text: string; type: string; count: number }>> {
  if (!partialText || partialText.length < 2) {
    return []
  }

  try {
    const query = `
      SELECT topic_text, entity_type, occurrence_count
      FROM trending_topics
      WHERE LOWER(topic_text) LIKE ?
      ORDER BY (occurrence_count * avg_tfidf_score) DESC
      LIMIT ?
    `

    const result = await db.execute(query, [
      `%${partialText.toLowerCase()}%`,
      limit,
    ])

    return result.rows.map((row) => ({
      text: row.topic_text as string,
      type: row.entity_type as string,
      count: row.occurrence_count as number,
    }))
  } catch (error) {
    console.error("Error getting topic suggestions:", error)
    return []
  }
}

/**
 * Get articles by topic with relevance scoring
 */
export async function findArticlesByTopicsWithRelevance(
  topicTexts: string[],
  options: TopicSearchOptions = {}
): Promise<
  Array<NewsArticle & { relevanceScore: number; matchedTopics: string[] }>
> {
  const { matchType = "any", limit = 5, timeWindow = 48 } = options

  if (topicTexts.length === 0) {
    return []
  }

  try {
    const normalizedTopics = topicTexts.map((text) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim()
    )

    // Get articles with topic matches and calculate relevance
    const query = `
      SELECT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at, na.embedding,
             GROUP_CONCAT(DISTINCT at.entity_text) as matched_topics,
             COUNT(DISTINCT at.entity_text) as topic_matches,
             AVG(at.tfidf_score) as avg_tfidf_score
      FROM news_articles na
      INNER JOIN article_topics at ON na.id = at.article_id
      WHERE na.created_at > datetime('now', '-${timeWindow} hours')
      AND LOWER(REPLACE(REPLACE(at.entity_text, ' ', ''), '-', '')) IN (${normalizedTopics
        .map(() => "?")
        .join(", ")})
      GROUP BY na.id
      ${matchType === "all" ? "HAVING topic_matches = ?" : ""}
      ORDER BY topic_matches DESC, avg_tfidf_score DESC, na.published_at DESC
      LIMIT ?
    `

    const params =
      matchType === "all"
        ? [...normalizedTopics, normalizedTopics.length, limit]
        : [...normalizedTopics, limit]

    const result = await db.execute(query, params)

    return result.rows.map((row) => {
      const article: NewsArticle = {
        id: row.id as string,
        title: row.title as string,
        content: row.content as string,
        url: row.url as string,
        source: row.source as string,
        published_at: row.published_at as string,
        created_at: row.created_at as string,
        embedding: JSON.parse(row.embedding as string),
      }

      const matchedTopics = ((row.matched_topics as string) || "")
        .split(",")
        .filter(Boolean)
      const topicMatches = row.topic_matches as number
      const avgTfidfScore = row.avg_tfidf_score as number

      // Calculate relevance score (0-1)
      const relevanceScore = Math.min(
        (topicMatches / normalizedTopics.length) * 0.7 + avgTfidfScore * 0.3,
        1.0
      )

      return {
        ...article,
        relevanceScore,
        matchedTopics,
      }
    })
  } catch (error) {
    console.error("Error finding articles with relevance:", error)
    return []
  }
}

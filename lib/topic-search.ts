import { db } from "./db"
import { executeWithRetry } from "./db-utils"
import { normalizeEntityText, normalizeTopicInputs } from "./entity-normalize"
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
  const { matchType = "any", limit = 5, timeWindow = 96 } = options

  if (topicTexts.length === 0) {
    return []
  }

  try {
    const normalizedTopics = normalizeTopicInputs(topicTexts)
    if (normalizedTopics.length === 0) return []

    // Build query based on match type
    let query: string
    let params: any[]

    if (matchType === "all") {
      // AND logic: article must match ALL topics
      query = `
        SELECT na.id, na.title, na.content, na.url, na.source,
               na.published_at, na.created_at,
               MAX(at.tfidf_score) AS max_tfidf_score
        FROM news_articles na
        INNER JOIN article_topics at ON na.id = at.article_id
        WHERE na.created_at > datetime('now', '-${timeWindow} hours')
        AND at.entity_text_normalized IN (${normalizedTopics
          .map(() => "?")
          .join(", ")})
        GROUP BY na.id
        HAVING COUNT(DISTINCT at.entity_text_normalized) = ?
        ORDER BY max_tfidf_score DESC, na.published_at DESC
        LIMIT ?
      `
      params = [...normalizedTopics, normalizedTopics.length, limit]
    } else {
      // OR logic: article matches ANY topic (default)
      query = `
        SELECT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at,
               MAX(at.tfidf_score) as max_tfidf_score
        FROM news_articles na
        INNER JOIN article_topics at ON na.id = at.article_id
        WHERE na.created_at > datetime('now', '-${timeWindow} hours')
        AND at.entity_text_normalized IN (${normalizedTopics
          .map(() => "?")
          .join(", ")})
        GROUP BY na.id
        ORDER BY max_tfidf_score DESC, na.published_at DESC
        LIMIT ?
      `
      params = [...normalizedTopics, limit]
    }

    const result = await executeWithRetry(query, params)

    return result.rows.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      url: row.url as string,
      source: row.source as string,
      published_at: row.published_at as string,
      created_at: row.created_at as string,
      embedding: [],
    }))
  } catch (error) {
    console.error("Error finding articles by topics:", error)
    return []
  }
}

/**
 * Find articles by topic with intelligent fuzzy matching
 */
export async function findArticlesByTopicsFuzzy(
  topicTexts: string[],
  options: TopicSearchOptions = {}
): Promise<NewsArticle[]> {
  const { matchType = "any", limit = 5, timeWindow = 96 } = options

  if (topicTexts.length === 0) {
    return []
  }

  try {
    const normalizedTopics = normalizeTopicInputs(topicTexts)
    if (normalizedTopics.length === 0) return []

    const prefixPatterns = normalizedTopics.map(
      () => "at.entity_text_normalized GLOB ?"
    )
    const params: any[] = normalizedTopics.map((topic) => `${topic}*`)

    let query: string

    if (matchType === "all") {
      query = `
        SELECT na.id, na.title, na.content, na.url, na.source,
               na.published_at, na.created_at,
               MAX(at.tfidf_score) AS max_tfidf_score
        FROM news_articles na
        INNER JOIN article_topics at ON na.id = at.article_id
        WHERE na.created_at > datetime('now', '-${timeWindow} hours')
        AND (${prefixPatterns.join(" OR ")})
        GROUP BY na.id
        HAVING COUNT(DISTINCT at.entity_text_normalized) >= ?
        ORDER BY max_tfidf_score DESC, na.published_at DESC
        LIMIT ?
      `
      params.push(normalizedTopics.length, limit)
    } else {
      query = `
        SELECT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at,
               MAX(at.tfidf_score) as max_tfidf_score
        FROM news_articles na
        INNER JOIN article_topics at ON na.id = at.article_id
        WHERE na.created_at > datetime('now', '-${timeWindow} hours')
        AND (${prefixPatterns.join(" OR ")})
        GROUP BY na.id
        ORDER BY max_tfidf_score DESC, na.published_at DESC
        LIMIT ?
      `
      params.push(limit)
    }

    const result = await executeWithRetry(query, params)

    return result.rows.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      url: row.url as string,
      source: row.source as string,
      published_at: row.published_at as string,
      created_at: row.created_at as string,
      embedding: [],
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
    const normalizedPrefix = normalizeEntityText(partialText)
    if (!normalizedPrefix) return []

    const query = `
      SELECT topic_text, entity_type, occurrence_count
      FROM trending_topics
      WHERE topic_text >= ? AND topic_text < ?
      ORDER BY ranking_score DESC
      LIMIT ?
    `

    const result = await db.execute(query, [
      normalizedPrefix,
      `${normalizedPrefix}\uffff`,
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
 * Get diverse topics with category balancing
 */
export async function getDiverseTopics(options?: {
  timeWindow?: number
  limit?: number
  entityType?: string
  topicTypes?: string[]
}): Promise<
  Array<{
    id: string
    text: string
    type: string
    occurrenceCount: number
    avgTfidfScore: number
    lastSeenAt: string
    combinedScore: number
  }>
> {
  const { timeWindow = 96, limit = 20, entityType, topicTypes } = options || {}

  try {
    let query = `
      SELECT id, topic_text, entity_type, occurrence_count, avg_tfidf_score,
             ranking_score, last_seen_at, created_at
      FROM trending_topics
      WHERE last_seen_at > datetime('now', '-${timeWindow} hours')
    `
    const params: any[] = []

    if (entityType) {
      query += " AND entity_type = ?"
      params.push(entityType)
    }

    if (topicTypes && topicTypes.length > 0) {
      const placeholders = topicTypes.map(() => "?").join(",")
      query += ` AND entity_type IN (${placeholders})`
      params.push(...topicTypes)
    }

    query += `
      ORDER BY ranking_score DESC
      LIMIT ?
    `
    params.push(limit * 2) // Get more to filter for diversity

    const result = await executeWithRetry(query, params)
    const allTopics = result.rows.map((row) => {
      const occurrenceCount = (row.occurrence_count as number) || 0
      const avgTfidfScore = (row.avg_tfidf_score as number) || 0
      return {
        id: row.id as string,
        text: row.topic_text as string,
        type: row.entity_type as string,
        occurrenceCount,
        avgTfidfScore,
        lastSeenAt: row.last_seen_at as string,
        combinedScore: (row.ranking_score as number) || 0,
      }
    })

    // Apply diversity filtering
    return selectDiverseTopics(allTopics, limit)
  } catch (error) {
    console.error("Error getting diverse topics:", error)
    return []
  }
}

/**
 * Select diverse topics by balancing entity types and avoiding similar topics
 */
function selectDiverseTopics(
  topics: Array<{
    id: string
    text: string
    type: string
    occurrenceCount: number
    avgTfidfScore: number
    lastSeenAt: string
    combinedScore: number
  }>,
  limit: number
): Array<{
  id: string
  text: string
  type: string
  occurrenceCount: number
  avgTfidfScore: number
  lastSeenAt: string
  combinedScore: number
}> {
  const selected: typeof topics = []
  const typeCounts: Record<string, number> = {}
  const maxPerType = Math.ceil(limit / 5) // Max 5 different types, distribute evenly

  for (const topic of topics) {
    if (selected.length >= limit) break

    // Check if we already have enough of this entity type
    const currentTypeCount = typeCounts[topic.type] || 0
    if (currentTypeCount >= maxPerType) continue

    // Check for similarity with already selected topics
    const isSimilar = selected.some((selectedTopic) =>
      isTopicSimilar(topic.text, selectedTopic.text)
    )

    if (!isSimilar) {
      selected.push(topic)
      typeCounts[topic.type] = (typeCounts[topic.type] || 0) + 1
    }
  }

  return selected
}

/**
 * Check if two topics are similar (simple similarity check)
 */
function isTopicSimilar(topic1: string, topic2: string): boolean {
  const t1 = topic1.toLowerCase().trim()
  const t2 = topic2.toLowerCase().trim()

  // Exact match
  if (t1 === t2) return true

  // One contains the other
  if (t1.includes(t2) || t2.includes(t1)) return true

  // Check for common words (if both have multiple words)
  const words1 = t1.split(/\s+/)
  const words2 = t2.split(/\s+/)

  if (words1.length > 1 && words2.length > 1) {
    const commonWords = words1.filter((word) => words2.includes(word))
    const similarity =
      commonWords.length / Math.min(words1.length, words2.length)
    return similarity > 0.5 // 50% word overlap
  }

  return false
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
  const { matchType = "any", limit = 5, timeWindow = 96 } = options

  if (topicTexts.length === 0) {
    return []
  }

  try {
    const normalizedTopics = normalizeTopicInputs(topicTexts)
    if (normalizedTopics.length === 0) return []

    // Get articles with topic matches and calculate relevance
    const query = `
      SELECT na.id, na.title, na.content, na.url, na.source, na.published_at, na.created_at,
             GROUP_CONCAT(DISTINCT at.entity_text) as matched_topics,
             COUNT(DISTINCT at.entity_text_normalized) as topic_matches,
             AVG(at.tfidf_score) as avg_tfidf_score
      FROM news_articles na
      INNER JOIN article_topics at ON na.id = at.article_id
      WHERE na.created_at > datetime('now', '-${timeWindow} hours')
      AND at.entity_text_normalized IN (${normalizedTopics
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
        embedding: [],
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

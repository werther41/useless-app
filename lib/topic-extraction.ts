import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

import { db } from "./db"
import { ArticleTopic, ExtractedEntity, TrendingTopic } from "./schema"

// Initialize Gemini
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
})

// Entity types for NER
const ENTITY_TYPES = [
  "TECH",
  "ORG",
  "PERSON",
  "LOCATION",
  "CONCEPT",
  "EVENT",
  "OTHER",
] as const

// Schema for Gemini NER response
const EntitySchema = z.object({
  text: z.string(),
  type: z.enum(ENTITY_TYPES),
  confidence: z.number().min(0).max(1),
})

const NERResponseSchema = z.object({
  entities: z.array(EntitySchema),
})

/**
 * Extract entities from an article using Gemini NER
 */
export async function extractEntitiesFromArticle(
  title: string,
  content: string
): Promise<ExtractedEntity[]> {
  try {
    const prompt = `Extract named entities from this news article. Return a JSON array of entities.

Article Title: ${title}
Content: ${content.substring(0, 2000)} // Limit content length

For each entity, provide:
- text: The entity text
- type: One of ${ENTITY_TYPES.join(", ")}
- confidence: 0.0-1.0

Focus on extracting meaningful entities that could be trending topics.`

    const result = await generateObject({
      model: google("models/gemini-2.0-flash-lite"),
      prompt,
      schema: NERResponseSchema,
    })

    // Filter entities by confidence and validate
    const validEntities = result.object.entities
      .filter((entity) => entity.confidence > 0.3)
      .map((entity) => ({
        text: entity.text,
        type: entity.type,
        confidence: entity.confidence,
      }))

    console.log(`📊 Extracted ${validEntities.length} entities from article`)
    return validEntities
  } catch (error) {
    console.error("Error extracting entities:", error)
    return []
  }
}

/**
 * Normalize entity text for deduplication
 */
export function normalizeEntityText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
}

/**
 * Store topics for an article
 */
export async function storeArticleTopics(
  articleId: string,
  entities: ExtractedEntity[]
): Promise<void> {
  if (entities.length === 0) return

  try {
    // Prepare topic records
    const topicRecords = entities.map((entity, index) => ({
      id: `topic_${articleId}_${index}_${Date.now()}`,
      article_id: articleId,
      entity_text: entity.text,
      entity_type: entity.type,
      tfidf_score: entity.tfidfScore || 0.0,
      ner_confidence: entity.confidence,
    }))

    // Insert topics in batch
    const insertSql = `
      INSERT INTO article_topics (id, article_id, entity_text, entity_type, tfidf_score, ner_confidence)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    for (const record of topicRecords) {
      await db.execute(insertSql, [
        record.id,
        record.article_id,
        record.entity_text,
        record.entity_type,
        record.tfidf_score,
        record.ner_confidence,
      ])
    }

    console.log(
      `✅ Stored ${topicRecords.length} topics for article ${articleId}`
    )
  } catch (error) {
    console.error(`Error storing topics for article ${articleId}:`, error)
    throw error
  }
}

/**
 * Update trending topics aggregation
 */
export async function updateTrendingTopics(
  entities: ExtractedEntity[]
): Promise<void> {
  try {
    for (const entity of entities) {
      const normalizedText = normalizeEntityText(entity.text)
      const tfidfScore = entity.tfidfScore || 0.0

      // Check if topic already exists
      const existingResult = await db.execute(
        "SELECT id, occurrence_count, avg_tfidf_score FROM trending_topics WHERE topic_text = ?",
        [normalizedText]
      )

      if (existingResult.rows.length > 0) {
        // Update existing topic
        const existing = existingResult.rows[0] as any
        const newCount = existing.occurrence_count + 1
        const newAvgScore =
          (existing.avg_tfidf_score * existing.occurrence_count + tfidfScore) /
          newCount

        await db.execute(
          "UPDATE trending_topics SET occurrence_count = ?, avg_tfidf_score = ?, last_seen_at = CURRENT_TIMESTAMP WHERE id = ?",
          [newCount, newAvgScore, existing.id]
        )
      } else {
        // Insert new topic
        const topicId = `trending_${Date.now()}_${Math.abs(
          normalizedText.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
        )}`
        await db.execute(
          "INSERT INTO trending_topics (id, topic_text, entity_type, occurrence_count, avg_tfidf_score) VALUES (?, ?, ?, ?, ?)",
          [topicId, normalizedText, entity.type, 1, tfidfScore]
        )
      }
    }

    console.log(`✅ Updated trending topics for ${entities.length} entities`)
  } catch (error) {
    console.error("Error updating trending topics:", error)
    throw error
  }
}

/**
 * Extract and store topics for an article (convenience function)
 */
export async function extractAndStoreTopics(
  articleId: string,
  title: string,
  content: string
): Promise<void> {
  try {
    const entities = await extractEntitiesFromArticle(title, content)
    if (entities.length > 0) {
      await storeArticleTopics(articleId, entities)
      await updateTrendingTopics(entities)
    }
  } catch (error) {
    console.error(`Topic extraction failed for ${articleId}:`, error)
    // Don't throw - this is fire-and-forget
  }
}

/**
 * Get trending topics with optional filters
 */
export async function getTrendingTopics(options?: {
  timeWindow?: number // hours
  limit?: number
  entityType?: string
}): Promise<TrendingTopic[]> {
  const { timeWindow = 48, limit = 10, entityType } = options || {}

  try {
    let query = `
      SELECT id, topic_text, entity_type, occurrence_count, avg_tfidf_score, last_seen_at, created_at
      FROM trending_topics
      WHERE last_seen_at > datetime('now', '-${timeWindow} hours')
    `
    const params: any[] = []

    if (entityType) {
      query += " AND entity_type = ?"
      params.push(entityType)
    }

    query += `
      ORDER BY (occurrence_count * avg_tfidf_score) DESC
      LIMIT ?
    `
    params.push(limit)

    const result = await db.execute(query, params)

    return result.rows.map((row) => ({
      id: row.id as string,
      topic_text: row.topic_text as string,
      entity_type: row.entity_type as string,
      occurrence_count: row.occurrence_count as number,
      avg_tfidf_score: row.avg_tfidf_score as number,
      article_ids: "", // Not needed for this query
      last_seen_at: row.last_seen_at as string,
      created_at: row.created_at as string,
    }))
  } catch (error) {
    console.error("Error getting trending topics:", error)
    return []
  }
}

/**
 * Get topic extraction statistics
 */
export async function getTopicStats(): Promise<{
  totalArticles: number
  articlesWithTopics: number
  totalTopics: number
  trendingTopics: number
  coveragePercentage: number
}> {
  try {
    // Total articles
    const articlesResult = await db.execute(
      "SELECT COUNT(*) as count FROM news_articles"
    )
    const totalArticles = (articlesResult.rows[0]?.count as number) || 0

    // Articles with topics
    const topicsResult = await db.execute(
      "SELECT COUNT(DISTINCT article_id) as count FROM article_topics"
    )
    const articlesWithTopics = (topicsResult.rows[0]?.count as number) || 0

    // Total topics
    const totalTopicsResult = await db.execute(
      "SELECT COUNT(*) as count FROM article_topics"
    )
    const totalTopics = (totalTopicsResult.rows[0]?.count as number) || 0

    // Trending topics
    const trendingResult = await db.execute(
      "SELECT COUNT(*) as count FROM trending_topics"
    )
    const trendingTopics = (trendingResult.rows[0]?.count as number) || 0

    const coveragePercentage =
      totalArticles > 0 ? (articlesWithTopics / totalArticles) * 100 : 0

    return {
      totalArticles,
      articlesWithTopics,
      totalTopics,
      trendingTopics,
      coveragePercentage,
    }
  } catch (error) {
    console.error("Error getting topic stats:", error)
    return {
      totalArticles: 0,
      articlesWithTopics: 0,
      totalTopics: 0,
      trendingTopics: 0,
      coveragePercentage: 0,
    }
  }
}

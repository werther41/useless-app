import { db } from "./db"
import { Fact, FactRating, FactWithRating } from "./schema"

// Create a new fact
export async function createFact(
  fact: Omit<Fact, "created_at" | "updated_at">
) {
  const now = new Date().toISOString()

  await db.execute({
    sql: `
      INSERT INTO facts (id, text, source, source_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      fact.id,
      fact.text,
      fact.source || null,
      fact.source_url || null,
      now,
      now,
    ],
  })

  return { ...fact, created_at: now, updated_at: now }
}

// Get a random fact with rating information
export async function getRandomFact(
  userIp?: string
): Promise<FactWithRating | null> {
  const result = await db.execute(
    `
    SELECT 
      f.*,
      COALESCE(SUM(fr.rating), 0) as total_rating,
      COUNT(fr.id) as rating_count,
      (
        SELECT fr2.rating 
        FROM fact_ratings fr2 
        WHERE fr2.fact_id = f.id AND fr2.user_ip = ?
        LIMIT 1
      ) as user_rating
    FROM facts f
    LEFT JOIN fact_ratings fr ON f.id = fr.fact_id
    GROUP BY f.id
    ORDER BY RANDOM()
    LIMIT 1
  `,
    [userIp || null]
  )

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  return {
    id: row.id as string,
    text: row.text as string,
    source: row.source as string | null,
    source_url: row.source_url as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    total_rating: row.total_rating as number,
    rating_count: row.rating_count as number,
    user_rating: row.user_rating as number | null,
  }
}

// Get a specific fact by ID
export async function getFactById(
  id: string,
  userIp?: string
): Promise<FactWithRating | null> {
  const result = await db.execute(
    `
    SELECT 
      f.*,
      COALESCE(SUM(fr.rating), 0) as total_rating,
      COUNT(fr.id) as rating_count,
      (
        SELECT fr2.rating 
        FROM fact_ratings fr2 
        WHERE fr2.fact_id = f.id AND fr2.user_ip = ?
        LIMIT 1
      ) as user_rating
    FROM facts f
    LEFT JOIN fact_ratings fr ON f.id = fr.fact_id
    WHERE f.id = ?
    GROUP BY f.id
  `,
    [userIp || null, id]
  )

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  return {
    id: row.id as string,
    text: row.text as string,
    source: row.source as string | null,
    source_url: row.source_url as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    total_rating: row.total_rating as number,
    rating_count: row.rating_count as number,
    user_rating: row.user_rating as number | null,
  }
}

// Rate a fact
export async function rateFact(
  factId: string,
  rating: number,
  userIp?: string
): Promise<FactRating> {
  // Validate rating
  if (rating !== -1 && rating !== 1) {
    throw new Error("Rating must be -1 (too useless) or 1 (useful uselessness)")
  }

  // Check if user already rated this fact
  const existingRating = await db.execute(
    `
    SELECT id FROM fact_ratings 
    WHERE fact_id = ? AND user_ip = ?
  `,
    [factId, userIp || null]
  )

  if (existingRating.rows.length > 0) {
    // Update existing rating
    await db.execute(
      `
      UPDATE fact_ratings 
      SET rating = ?
      WHERE fact_id = ? AND user_ip = ?
    `,
      [rating, factId, userIp || null]
    )
  } else {
    // Create new rating
    await db.execute(
      `
      INSERT INTO fact_ratings (fact_id, rating, user_ip)
      VALUES (?, ?, ?)
    `,
      [factId, rating, userIp || null]
    )
  }

  // Get the updated rating record
  const result = await db.execute(
    `
    SELECT * FROM fact_ratings 
    WHERE fact_id = ? AND user_ip = ?
    ORDER BY created_at DESC
    LIMIT 1
  `,
    [factId, userIp || null]
  )

  const row = result.rows[0]
  return {
    id: row.id as number,
    fact_id: row.fact_id as string,
    rating: row.rating as number,
    user_ip: row.user_ip as string | null,
    created_at: row.created_at as string,
  }
}

// Get all facts with pagination
export async function getAllFacts(
  page = 1,
  limit = 10,
  userIp?: string
): Promise<FactWithRating[]> {
  const offset = (page - 1) * limit

  const result = await db.execute(
    `
    SELECT 
      f.*,
      COALESCE(SUM(fr.rating), 0) as total_rating,
      COUNT(fr.id) as rating_count,
      (
        SELECT fr2.rating 
        FROM fact_ratings fr2 
        WHERE fr2.fact_id = f.id AND fr2.user_ip = ?
        LIMIT 1
      ) as user_rating
    FROM facts f
    LEFT JOIN fact_ratings fr ON f.id = fr.fact_id
    GROUP BY f.id
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `,
    [userIp || null, limit, offset]
  )

  return result.rows.map((row) => ({
    id: row.id as string,
    text: row.text as string,
    source: row.source as string | null,
    source_url: row.source_url as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    total_rating: row.total_rating as number,
    rating_count: row.rating_count as number,
    user_rating: row.user_rating as number | null,
  }))
}

// Get top rated facts
export async function getTopRatedFacts(
  limit = 10,
  userIp?: string
): Promise<FactWithRating[]> {
  const result = await db.execute(
    `
    SELECT 
      f.*,
      COALESCE(SUM(fr.rating), 0) as total_rating,
      COUNT(fr.id) as rating_count,
      (
        SELECT fr2.rating 
        FROM fact_ratings fr2 
        WHERE fr2.fact_id = f.id AND fr2.user_ip = ?
        LIMIT 1
      ) as user_rating
    FROM facts f
    LEFT JOIN fact_ratings fr ON f.id = fr.fact_id
    GROUP BY f.id
    HAVING rating_count > 0
    ORDER BY total_rating DESC, rating_count DESC
    LIMIT ?
  `,
    [userIp || null, limit]
  )

  return result.rows.map((row) => ({
    id: row.id as string,
    text: row.text as string,
    source: row.source as string | null,
    source_url: row.source_url as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    total_rating: row.total_rating as number,
    rating_count: row.rating_count as number,
    user_rating: row.user_rating as number | null,
  }))
}

// Database schema definitions
export interface Fact {
  id: string
  text: string
  source?: string | null
  source_url?: string | null
  created_at: string
  updated_at: string
}

export interface FactRating {
  id: string
  fact_id: string
  rating: number // -1 (too useless) or 1 (useful uselessness)
  user_ip?: string | null // For basic tracking (optional)
  created_at: string
}

export interface FactWithRating extends Fact {
  total_rating: number
  rating_count: number
  user_rating?: number | null // Current user's rating if any
}

export interface FactStatistics {
  total_facts: number
  total_ratings: number
  average_rating: number
  positive_ratings: number
  negative_ratings: number
  most_rated_fact: {
    id: string
    text: string
    rating_count: number
  } | null
  recent_activity: {
    ratings_last_24h: number
    ratings_last_7d: number
  }
}

export interface NewsArticle {
  id: string
  title: string
  content: string
  url: string
  source: string
  published_at: string
  created_at: string
  embedding: number[] // Array of float32 values for vector embedding
}

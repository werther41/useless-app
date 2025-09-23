// Database schema definitions
export interface Fact {
  id: string
  text: string
  source?: string
  source_url?: string
  created_at: string
  updated_at: string
}

export interface FactRating {
  id: string
  fact_id: string
  rating: number // -1 (too useless) or 1 (useful uselessness)
  user_ip?: string // For basic tracking (optional)
  created_at: string
}

export interface FactWithRating extends Fact {
  total_rating: number
  rating_count: number
  user_rating?: number // Current user's rating if any
}

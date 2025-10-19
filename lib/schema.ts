// Database schema definitions
export interface Fact {
  id: string
  text: string
  source?: string | null
  source_url?: string | null
  fact_type?: "static" | "realtime"
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

export interface ArticleTopic {
  id: string
  article_id: string
  entity_text: string
  entity_type: string
  tfidf_score: number
  ner_confidence: number
  created_at: string
}

export interface TrendingTopic {
  id: string
  topic_text: string
  entity_type: string
  occurrence_count: number
  avg_tfidf_score: number
  article_ids: string
  last_seen_at: string
  created_at: string
}

export interface ExtractedEntity {
  text: string
  type: string
  confidence: number
  tfidfScore?: number
}

export interface TopicWithMetadata extends TrendingTopic {
  related_articles: Array<{ id: string; title: string }>
}

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

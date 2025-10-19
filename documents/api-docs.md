# Useless Facts API Documentation

## Overview

The Useless Facts API provides endpoints for managing and retrieving useless facts with user rating functionality. Built with Next.js API routes and powered by Turso (libSQL) database.

## Base URL

Most API endpoints are prefixed with `/api/facts`. Real-time news endpoints use `/api/facts/real-time` and cron jobs use `/api/cron/retrieve-news`.

## Authentication

Currently, no authentication is required. User tracking is done via IP address for rating purposes.

## Endpoints

### 1. Get Random Fact

**GET** `/api/facts/random`

Returns a random fact with rating information.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "fact-123",
    "text": "Bananas are berries, but strawberries aren't.",
    "source": "Botanical Facts",
    "source_url": "https://example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "total_rating": 5,
    "rating_count": 10,
    "user_rating": 1
  }
}
```

**Error Response:**

```json
{
  "error": "No facts available"
}
```

### 2. Get Specific Fact

**GET** `/api/facts/{id}`

Returns a specific fact by ID with rating information.

**Parameters:**

- `id` (string): The fact ID

**Response:** Same format as random fact endpoint.

**Error Response:**

```json
{
  "error": "Fact not found"
}
```

### 3. Rate a Fact

**POST** `/api/facts/{id}/rate`

Submit a rating for a fact.

**Parameters:**

- `id` (string): The fact ID

**Request Body:**

```json
{
  "rating": 1
}
```

**Rating Values:**

- `1`: "Useful Uselessness" (thumbs up)
- `-1`: "Too Useless" (thumbs down)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "fact_id": "fact-123",
    "rating": 1,
    "user_ip": "192.168.1.1",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Rating submitted successfully"
}
```

**Error Response:**

```json
{
  "error": "Rating must be -1 (too useless) or 1 (useful uselessness)"
}
```

### 4. Get All Facts

**GET** `/api/facts`

Get paginated list of all facts.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `type` (string, optional): "top-rated" for top rated facts

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "fact-1",
      "text": "Bananas are berries, but strawberries aren't.",
      "source": "Botanical Facts",
      "source_url": "https://example.com",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "total_rating": 5,
      "rating_count": 10,
      "user_rating": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### 5. Import Facts (Admin)

**POST** `/api/facts/import`

Bulk import facts into the database. Used by the admin interface.

**Request Body:**

```json
{
  "facts": [
    {
      "id": "fact-6",
      "text": "The human brain contains approximately 86 billion neurons.",
      "source": "Neuroscience Facts",
      "source_url": "https://example.com"
    }
  ],
  "skipDuplicates": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Import completed",
  "results": {
    "imported": 1,
    "skipped": 0,
    "errors": 0,
    "errors_list": []
  }
}
```

### 6. Get Fun Fact Statistics

**GET** `/api/facts/stats`

Returns comprehensive statistics about the fun fact system.

**Response:**

```json
{
  "success": true,
  "data": {
    "total_facts": 150,
    "total_ratings": 1250,
    "average_rating": 0.15,
    "positive_ratings": 700,
    "negative_ratings": 550,
    "most_rated_fact": {
      "id": "fact-42",
      "text": "A group of flamingos is called a 'flamboyance'.",
      "rating_count": 45
    },
    "recent_activity": {
      "ratings_last_24h": 12,
      "ratings_last_7d": 89
    }
  }
}
```

### 7. Get Top Rated Facts

**GET** `/api/facts/top-rated`

Returns the most positively rated facts (highest "Useful Uselessness" ratings).

**Query Parameters:**

- `limit` (number, optional): Number of facts to return (default: 10, max: 50)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "fact-42",
      "text": "A group of flamingos is called a 'flamboyance'.",
      "source": "Animal Facts",
      "source_url": "https://example.com",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "total_rating": 25,
      "rating_count": 45,
      "user_rating": 1
    }
  ],
  "meta": {
    "limit": 10,
    "count": 10
  }
}
```

### 8. Get Bottom Rated Facts

**GET** `/api/facts/bottom-rated`

Returns the most negatively rated facts (lowest ratings, most "Too Useless").

**Query Parameters:**

- `limit` (number, optional): Number of facts to return (default: 10, max: 50)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "fact-99",
      "text": "The average person spends 6 months of their life waiting for red lights.",
      "source": "Traffic Facts",
      "source_url": "https://example.com",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "total_rating": -18,
      "rating_count": 32,
      "user_rating": -1
    }
  ],
  "meta": {
    "limit": 10,
    "count": 10
  }
}
```

### 9. Import Facts (Admin)

**POST** `/api/facts/import`

Bulk import facts into the database. Used by the admin interface.

**Request Body:**

```json
{
  "facts": [
    {
      "id": "fact-6",
      "text": "The human brain contains approximately 86 billion neurons.",
      "source": "Neuroscience Facts",
      "source_url": "https://example.com"
    }
  ],
  "skipDuplicates": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Import completed",
  "results": {
    "imported": 1,
    "skipped": 0,
    "errors": 0,
    "errors_list": []
  }
}
```

### 10. Seed Database (Admin)

**POST** `/api/seed`

Initialize the database with sample facts.

**Response:**

```json
{
  "success": true,
  "message": "Database seeded successfully"
}
```

## Data Models

### Fact

```typescript
interface Fact {
  id: string
  text: string
  source?: string
  source_url?: string
  created_at: string
  updated_at: string
}
```

### Fact with Rating

```typescript
interface FactWithRating extends Fact {
  total_rating: number
  rating_count: number
  user_rating?: number
}
```

### Fact Rating

```typescript
interface FactRating {
  id: number
  fact_id: string
  rating: number // -1 or 1
  user_ip?: string
  created_at: string
}
```

### Fact Statistics

```typescript
interface FactStatistics {
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
```

### Article with Relevance

```typescript
interface ArticleWithRelevance extends NewsArticle {
  snippet: string
  relevanceScore: number
  matchedTopics: string[]
}
```

### Article Search Result

```typescript
interface ArticleSearchResult {
  articles: ArticleWithRelevance[]
  metadata: {
    totalResults: number
    timeFilter: string
    searchType: "topic" | "text"
    query?: string
    topics?: string[]
  }
}
```

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message"
}
```

**Common HTTP Status Codes:**

- `200`: Success
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting for production use.

## Database Schema

### Facts Table

```sql
CREATE TABLE facts (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Fact Ratings Table

```sql
CREATE TABLE fact_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fact_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating IN (-1, 1)),
  user_ip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fact_id) REFERENCES facts (id) ON DELETE CASCADE
);
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get a random fact
const response = await fetch("/api/facts/random")
const { data: fact } = await response.json()

// Rate a fact
await fetch(`/api/facts/${fact.id}/rate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ rating: 1 }),
})

// Get fun fact statistics
const statsResponse = await fetch("/api/facts/stats")
const { data: stats } = await statsResponse.json()

// Get top rated facts
const topFactsResponse = await fetch("/api/facts/top-rated?limit=10")
const { data: topFacts } = await topFactsResponse.json()

// Get bottom rated facts
const bottomFactsResponse = await fetch("/api/facts/bottom-rated?limit=10")
const { data: bottomFacts } = await bottomFactsResponse.json()

// Get all facts with pagination
const allFacts = await fetch("/api/facts?page=1&limit=10")

// Search articles by topics
const topicSearch = await fetch(
  "/api/articles?topics=AI,machine%20learning&timeFilter=7d&sortBy=score"
)
const { articles: topicArticles } = await topicSearch.json()

// Search articles by free text
const textSearch = await fetch(
  "/api/articles/search?q=artificial%20intelligence&timeFilter=7d"
)
const { articles: textArticles } = await textSearch.json()
```

### cURL

```bash
# Get random fact
curl http://localhost:3000/api/facts/random

# Rate a fact
curl -X POST http://localhost:3000/api/facts/fact-1/rate \
  -H "Content-Type: application/json" \
  -d '{"rating": 1}'

# Get fun fact statistics
curl http://localhost:3000/api/facts/stats

# Get top rated facts
curl "http://localhost:3000/api/facts/top-rated?limit=10"

# Get bottom rated facts
curl "http://localhost:3000/api/facts/bottom-rated?limit=10"

# Get all facts with pagination
curl "http://localhost:3000/api/facts?page=1&limit=10"

# Search articles by topics
curl "http://localhost:3000/api/articles?topics=AI,machine%20learning&timeFilter=7d&sortBy=score"

# Search articles by free text
curl "http://localhost:3000/api/articles/search?q=artificial%20intelligence&timeFilter=7d"
```

### 8. Generate Real-Time Fact

**POST** `/api/facts/real-time`

Generates a quirky fun fact based on recent news articles using AI. Returns a streaming response.

**Headers:**

- `Content-Type: application/json`

**Response:** Streaming text response with the generated fact

**Custom Headers:**

- `X-Article-Source`: News source (e.g., "BBC News")
- `X-Article-URL`: Original article URL
- `X-Article-Title`: Article title

**Example Response:**

```
The concept of blog feeds emerged around the same time as the first commercial email systems.
```

**Error Response:**

```json
{
  "success": false,
  "error": "No news articles available. Please run the news ingestion cron job first."
}
```

### 9. Get Real-Time Fact Info (Testing)

**GET** `/api/facts/real-time`

Returns information about the most relevant news article without generating a fact. Useful for testing.

**Response:**

```json
{
  "success": true,
  "data": {
    "article": {
      "id": "news_1234567890_abc123",
      "title": "Blog Feeds",
      "source": "Hacker News",
      "url": "https://blogfeeds.net",
      "published_at": "2025-10-04T19:08:46.000Z"
    },
    "message": "Use POST to generate streaming fact"
  }
}
```

### 10. News Ingestion Cron Job

**POST** `/api/cron/retrieve-news`

Fetches and stores news articles from RSS feeds. Requires authorization header.

**Headers:**

- `Authorization: Bearer {CRON_SECRET}`

**Response:**

```json
{
  "success": true,
  "message": "News retrieval completed",
  "results": {
    "articlesAdded": 99,
    "articlesSkipped": 68,
    "errors": 2,
    "totalArticlesInDatabase": 99,
    "duration": "41813ms"
  },
  "details": [
    "BBC News: Added \"Netanyahu says he hopes to announce hostage releas...\"",
    "TechCrunch: Added \"A breach every month raises doubts about South Kor...\""
  ],
  "timestamp": "2025-10-05T05:32:25.847Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

## Article Discovery API

### 11. Search Articles by Topics

**GET** `/api/articles`

Search news articles by selected topics with intelligent matching and filtering.

**Query Parameters:**

- `topics` (string, required): Comma-separated list of topics to search for
- `timeFilter` (string, optional): Time window filter - "24h", "7d", "30d", or "all" (default: "7d")
- `topicTypes` (string, optional): Comma-separated list of topic types to filter by (e.g., "TECH", "ORG", "PERSON")
- `sortBy` (string, optional): Sort order - "time" or "score" (default: "score")

**Example Request:**

```
GET /api/articles?topics=AI,machine%20learning&timeFilter=7d&sortBy=score
```

**Response:**

```json
{
  "articles": [
    {
      "id": "news_1234567890_abc123",
      "title": "AI Breakthrough in Machine Learning",
      "snippet": "Researchers have developed a new AI model that can process natural language with unprecedented accuracy. The breakthrough, published in Nature Machine Intelligence, demonstrates significant improvements in understanding context and generating human-like responses. The model was trained on a dataset of over 10 billion parameters and shows promise for applications in healthcare, education, and customer service...",
      "url": "https://example.com/ai-breakthrough",
      "source": "TechCrunch",
      "published_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:35:00Z",
      "relevanceScore": 0.85,
      "matchedTopics": ["AI", "machine learning", "research"]
    }
  ],
  "metadata": {
    "totalResults": 1,
    "timeFilter": "7d",
    "searchType": "topic",
    "topics": ["AI", "machine learning"],
    "topicTypes": [],
    "sortBy": "score",
    "generatedAt": "2024-01-15T10:40:00Z"
  }
}
```

**Error Response:**

```json
{
  "error": "topics parameter is required"
}
```

### 12. Search Articles by Free Text

**GET** `/api/articles/search`

Search news articles using natural language queries with vector similarity.

**Query Parameters:**

- `q` (string, required): Search query (minimum 3 characters)
- `timeFilter` (string, optional): Time window filter - "24h", "7d", "30d", or "all" (default: "7d")

**Example Request:**

```
GET /api/articles/search?q=artificial%20intelligence&timeFilter=7d
```

**Response:**

```json
{
  "articles": [
    {
      "id": "news_1234567890_def456",
      "title": "New AI Model Shows Promise",
      "snippet": "A breakthrough in artificial intelligence has been achieved by researchers at leading tech companies. The new system demonstrates remarkable capabilities in natural language processing, showing significant improvements over previous models. The technology could revolutionize how we interact with computers and automate complex tasks across various industries. The research team spent over two years developing this advanced AI system...",
      "url": "https://example.com/ai-model",
      "source": "BBC News",
      "published_at": "2024-01-15T09:15:00Z",
      "created_at": "2024-01-15T09:20:00Z",
      "relevanceScore": 0.92,
      "matchedTopics": ["artificial intelligence", "AI", "technology"]
    }
  ],
  "metadata": {
    "totalResults": 1,
    "timeFilter": "7d",
    "searchType": "text",
    "query": "artificial intelligence",
    "generatedAt": "2024-01-15T10:40:00Z"
  }
}
```

**Error Response:**

```json
{
  "error": "Query must be at least 3 characters long"
}
```

## Real-Time News Features

### RSS Feed Sources

The system fetches news from 8 diverse sources:

- **General News**: BBC News, Reuters
- **Tech**: TechCrunch, Hacker News
- **Science**: Science Daily, NASA Breaking News
- **Programming**: GitHub Blog, Dev.to

### Date Filtering

Only articles from the last 48 hours are processed to ensure relevance.

### Vector Search

Uses Turso's native vector search with cosine similarity to find the most relevant news articles for fact generation.

### AI Integration

- **Embedding Model**: Google Gemini `text-embedding-004` (768 dimensions)
- **LLM**: Google Gemini `gemini-2.0-flash-lite`
- **Streaming**: Real-time fact generation with word-by-word display

## Development

To test the API locally:

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000/api/facts/random` to test
3. Use the admin interface at `/admin/import` to manage facts

## Topics API

### Get Trending Topics

**GET** `/api/topics`

Retrieves trending topics with optional filtering by topic types.

**Query Parameters:**

- `timeWindow` (optional): Time window in hours (1-168, default: 48)
- `limit` (optional): Number of topics to return (1-50, default: 10)
- `entityType` (optional): Filter by specific entity type
- `topicTypes` (optional): Comma-separated list of topic types to filter by (e.g., "PERSON,ORG,LOCATION")
- `diverse` (optional): Enable diverse topic selection (true/false)

**Example Request:**

```bash
GET /api/topics?limit=20&timeWindow=48&topicTypes=PERSON,ORG&diverse=true
```

**Example Response:**

```json
{
  "topics": [
    {
      "id": "topic_123",
      "text": "Artificial Intelligence",
      "type": "SCIENTIFIC_TERM",
      "occurrenceCount": 45,
      "avgTfidfScore": 0.85,
      "lastSeenAt": "2024-01-15T10:30:00Z",
      "combinedScore": 38.25
    }
  ],
  "metadata": {
    "timeWindow": 48,
    "limit": 20,
    "topicTypes": ["PERSON", "ORG"],
    "diverse": true,
    "totalTopics": 1,
    "generatedAt": "2024-01-15T10:35:00Z"
  }
}
```

### Search Topic Suggestions

**POST** `/api/topics`

Search for topic suggestions based on a query string.

**Request Body:**

```json
{
  "query": "machine learning",
  "limit": 10
}
```

**Example Response:**

```json
{
  "suggestions": [
    {
      "text": "machine learning",
      "type": "SCIENTIFIC_TERM",
      "count": 25
    }
  ],
  "query": "machine learning",
  "total": 1
}
```

## Production Considerations

- Implement proper authentication for admin endpoints
- Add rate limiting to prevent abuse
- Set up monitoring and logging
- Consider caching for frequently accessed endpoints
- Implement proper error tracking

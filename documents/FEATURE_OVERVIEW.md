# Feature Overview: NER + TF-IDF Topic Extraction

## 📋 Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [User Experience](#user-experience)
- [Technical Implementation](#technical-implementation)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Performance](#performance)

---

## Introduction

The NER + TF-IDF Topic Extraction feature enhances the "Real-Time News Facts" functionality by enabling users to select from trending topics before generating AI-powered fun facts. This creates a more interactive and personalized experience, allowing users to explore facts related to their interests.

### What Problem Does It Solve?

**Before**: Users could only generate random facts from news articles with no control over the topics.

**After**: Users can:

- See trending topics extracted from recent news
- Select up to 2 topics of interest
- Generate facts specifically related to their selected topics
- Explore different topic categories (TECH, ORG, PERSON, LOCATION, etc.)

---

## Key Features

### 1. Intelligent Topic Extraction

- **Named Entity Recognition (NER)**: Uses Google Gemini 2.0 Flash Lite to identify entities in news articles
- **Confidence Scoring**: Each entity has a confidence score (0.0-1.0) indicating extraction reliability
- **Entity Classification**: Automatically categorizes entities into 7 types (TECH, ORG, PERSON, LOCATION, CONCEPT, EVENT, OTHER)

### 2. TF-IDF Relevance Scoring

- **Term Frequency (TF)**: Measures how often an entity appears in a specific article
- **Inverse Document Frequency (IDF)**: Measures how unique an entity is across all articles
- **Combined Score**: TF × IDF produces a relevance score for each entity
- **Smart Ranking**: Topics are ranked by `occurrence_count × avg_tfidf_score`

### 3. Interactive Topic Selection

- **Visual Interface**: Topics displayed as color-coded badges by entity type
- **Multi-Select**: Users can select up to 2 topics
- **Real-Time Feedback**: Selected topics are highlighted, disabled topics greyed out
- **Clear Function**: Easy reset of all selections

### 4. Personalized Fact Generation

- **Topic-Based Matching**: Finds articles containing selected topics
- **Fallback Mechanism**: Falls back to random selection if no matches found
- **Topic Attribution**: Shows which topics matched in the generated fact
- **Backward Compatible**: Works without topic selection (maintains existing behavior)

### 5. Admin Monitoring

- **Statistics Dashboard**: View coverage metrics and topic counts
- **Trending Topics List**: Top 20 topics by combined score
- **Entity Distribution**: See breakdown by entity type
- **Performance Tracking**: Monitor extraction success rates

---

## Architecture

### Data Flow

```
┌─────────────────┐
│  RSS Feeds      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ News Ingestion  │ ← Automated cron job
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Store Articles  │ ← news_articles table
└────────┬────────┘
         │
         v (async, fire-and-forget)
┌─────────────────┐
│ NER Extraction  │ ← Gemini 2.0 Flash Lite
└────────┬────────┘
         │
         v
┌─────────────────┐
│ TF-IDF Scoring  │ ← Calculate relevance
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Store Topics    │ ← article_topics table
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Update Trending │ ← trending_topics table (aggregated)
└────────┬────────┘
         │
         v
┌─────────────────┐
│ User Interface  │ ← Topic selector component
└────────┬────────┘
         │
         v (user selects topics)
┌─────────────────┐
│ Find Articles   │ ← Match by selected topics
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Generate Fact   │ ← Gemini creates fun fact
└─────────────────┘
```

### Database Schema

```sql
-- Existing table
news_articles (
  id, title, content, url, source,
  published_at, created_at, embedding
)

-- New tables
article_topics (
  id, article_id, entity_text, entity_type,
  tfidf_score, ner_confidence, created_at
)

trending_topics (
  id, topic_text, entity_type, occurrence_count,
  avg_tfidf_score, last_seen_at, created_at
)
```

### Component Architecture

```
app/
├── api/
│   ├── topics/route.ts              (GET trending topics, POST suggestions)
│   ├── facts/real-time/route.ts     (Modified: accepts selectedTopics)
│   └── cron/
│       ├── retrieve-news/route.ts   (Existing: news ingestion)
│       └── cleanup-topics/route.ts  (New: topic cleanup)
│
├── admin/topics/page.tsx            (New: statistics dashboard)
│
components/
├── topic-selector.tsx               (New: topic selection UI)
└── real-time-fact-section.tsx       (Modified: integrated topic selector)

lib/
├── topic-extraction.ts              (New: NER + TF-IDF logic)
├── topic-search.ts                  (New: topic-based article search)
└── news-ingestion.ts                (Modified: triggers topic extraction)
```

---

## User Experience

### User Journey

1. **Visit Homepage**: User navigates to the homepage
2. **See Topic Selector**: Trending topics displayed as colorful badges
3. **Browse Topics**: Topics organized by type with occurrence counts
4. **Select Topics**: Click on 2 topics of interest (e.g., "AI" and "Google")
5. **Generate Fact**: Click "Get Real-Time Fact" button
6. **View Result**: AI-generated fact appears with "Matched topics" attribution
7. **Read Article**: Click link to read original news article (optional)

### Visual Design

**Topic Badge Colors:**

- 🔵 **TECH** (Blue): Technology, AI, software
- 🟣 **ORG** (Purple): Companies, organizations
- 🟢 **PERSON** (Green): People, researchers
- 🟠 **LOCATION** (Orange): Cities, countries
- 🟡 **CONCEPT** (Yellow): Scientific concepts
- 🔴 **EVENT** (Red): Events, phenomena
- ⚪ **OTHER** (Gray): Uncategorized

**Interaction States:**

- **Default**: Outlined badge with hover effect
- **Selected**: Solid primary color background
- **Disabled**: Greyed out, reduced opacity (when max selected)

---

## Technical Implementation

### 1. NER Extraction

```typescript
// lib/topic-extraction.ts
export async function extractEntitiesFromArticle(
  title: string,
  content: string
): Promise<ExtractedEntity[]>
```

**Process:**

1. Create structured prompt for Gemini
2. Request JSON response with entity list
3. Parse and validate entity structure
4. Filter by confidence threshold (> 0.3)
5. Return validated entities

**Example Entity:**

```json
{
  "text": "Google",
  "type": "ORG",
  "confidence": 0.95
}
```

### 2. TF-IDF Calculation

```typescript
async function calculateTfIdfScores(
  entities: ExtractedEntity[],
  articleText: string
): Promise<Map<string, number>>
```

**Formula:**

```
TF = (term_frequency_in_document) / (total_terms_in_document)
IDF = log(total_documents / documents_containing_term)
TF-IDF = TF × IDF
```

**Example:**

- Article: 100 words, "Google" appears 3 times
- TF = 3 / 100 = 0.03
- IDF = log(1000 / 50) = log(20) ≈ 3.0
- TF-IDF = 0.03 × 3.0 = 0.09

### 3. Topic Aggregation

```typescript
export async function updateTrendingTopics(
  entities: ExtractedEntity[]
): Promise<void>
```

**Process:**

1. Normalize entity text (lowercase, remove punctuation)
2. Check if topic exists in `trending_topics`
3. If exists: Update occurrence count and average TF-IDF score
4. If new: Insert new trending topic
5. Handle race conditions with `INSERT OR IGNORE`

**Aggregation:**

```
new_count = old_count + 1
new_avg_tfidf = (old_avg × old_count + new_tfidf) / new_count
```

### 4. Topic-Based Search

```typescript
export async function findArticlesByTopics(
  topicTexts: string[],
  options: { matchType: "any" | "all"; limit: number }
): Promise<NewsArticle[]>
```

**Query Strategy:**

- **OR Logic** (default): Find articles matching ANY selected topic
- **AND Logic**: Find articles matching ALL selected topics
- Order by: TF-IDF score DESC, published_at DESC
- Limit: Top 5 most relevant articles

---

## API Endpoints

### GET /api/topics

Get trending topics with optional filters.

**Query Parameters:**

- `timeWindow` (number): Hours to look back (default: 48, max: 168)
- `limit` (number): Maximum topics to return (default: 10, max: 50)
- `entityType` (string): Filter by entity type (optional)

**Response:**

```json
{
  "topics": [
    {
      "id": "trending_...",
      "text": "artificial intelligence",
      "type": "TECH",
      "occurrenceCount": 15,
      "avgTfidfScore": 0.087,
      "lastSeenAt": "2025-10-15T12:00:00Z",
      "combinedScore": 1.305
    }
  ],
  "metadata": {
    "timeWindow": 48,
    "limit": 10,
    "totalTopics": 87,
    "generatedAt": "2025-10-15T12:00:00Z"
  }
}
```

**Caching**: 15 minutes (900s)

### POST /api/facts/real-time

Generate AI fact from news with optional topic selection.

**Request Body:**

```json
{
  "selectedTopics": ["AI", "Google"] // Optional
}
```

**Response**: Streaming JSON

```json
{
  "funFact": "Did you know that..."
}
```

**Headers:**

- `X-Article-Source`: Source of the article
- `X-Article-Title`: Title of the article
- `X-Article-URL`: URL to original article
- `X-Article-Date`: Publication date
- `X-Matched-Topics`: Comma-separated matched topics (if any)

### GET /api/cron/retrieve-news

Trigger news ingestion and topic extraction (protected by CRON_SECRET).

**Response:**

```json
{
  "success": true,
  "results": {
    "articlesAdded": 25,
    "articlesSkipped": 232,
    "totalArticlesInDatabase": 1414
  }
}
```

---

## Testing

### Test Suite

**1. API Tests** (`scripts/test-all.sh`)

- ✅ Topics API (GET with various parameters)
- ✅ Invalid parameters validation
- ✅ Topic suggestions (POST)
- ✅ Real-time facts without topics (backward compatibility)
- ✅ Real-time facts with topics (new feature)
- ✅ Admin dashboard accessibility
- ✅ Cleanup cron functionality

**2. Service Tests** (`scripts/test-topic-extraction.ts`)

- ✅ Entity extraction from sample articles
- ✅ Topic storage in database
- ✅ Trending topics aggregation
- ✅ TF-IDF score calculation
- ✅ Statistics generation
- ✅ Data cleanup

**3. Manual Testing**

- Visit homepage, check topic selector loads
- Select/deselect topics, verify max limit
- Generate facts with topics, check matching
- Generate facts without topics, verify fallback
- Check admin dashboard statistics

### Running Tests

```bash
# Complete API test suite
./scripts/test-all.sh

# Service testing
npx tsx scripts/test-topic-extraction.ts

# Populate with real data
curl http://localhost:3000/api/cron/retrieve-news
```

---

## Performance

### Benchmarks

| Operation                    | Target  | Actual |
| ---------------------------- | ------- | ------ |
| GET /api/topics (cached)     | < 500ms | ~200ms |
| GET /api/topics (uncached)   | < 2s    | ~1.5s  |
| Topic extraction per article | < 5s    | ~2-3s  |
| News ingestion (25 articles) | < 60s   | ~30s   |
| Real-time fact generation    | < 5s    | ~3-4s  |
| Admin dashboard load         | < 1s    | ~500ms |

### Optimization Strategies

1. **Caching**: 15-minute cache on topics API
2. **Async Processing**: Topic extraction runs fire-and-forget
3. **Batch Operations**: Process articles in batches of 15
4. **Rate Limiting**: 2-second delay between Gemini API calls
5. **Database Indexing**: Indexes on topic_text, article_id, tfidf_score
6. **Lazy Loading**: Topics loaded on component mount

### Scalability

- **Database**: Turso handles 1000+ articles efficiently
- **API Rate Limits**: Gemini API respects rate limits with delays
- **Concurrent Processing**: Multiple articles processed simultaneously
- **Error Handling**: Graceful degradation on extraction failures
- **Cleanup**: Automated removal of stale topics (30+ days)

---

## Future Enhancements

### Planned Features

1. **Topic Clustering**: Group similar topics (e.g., "AI" + "Artificial Intelligence")
2. **Trending Analysis**: Track rising/falling topics over time
3. **User Preferences**: Learn from user's topic selections
4. **Topic Relationships**: Show related topics and contrasts
5. **Advanced NER**: Domain-specific models for better accuracy
6. **Multi-language Support**: Extract topics from non-English articles
7. **Topic Suggestions**: Auto-complete in topic selector
8. **Historical Trends**: View topic popularity over time

### Potential Improvements

1. **Performance**: Implement Redis caching for faster topic retrieval
2. **Accuracy**: Fine-tune confidence thresholds based on quality metrics
3. **UX**: Add topic search/filter functionality
4. **Analytics**: Track which topics drive most engagement
5. **A/B Testing**: Test different topic selection limits and UI designs

---

## Resources

- **Testing Guide**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Implementation Plan**: [feature-planning/feature-implementation-plan-ner-tfidf-topic-extraction.md](./feature-planning/feature-implementation-plan-ner-tfidf-topic-extraction.md)
- **API Documentation**: [api-docs.md](./api-docs.md)

---

## Support

For issues or questions:

1. Check the testing guide for common issues
2. Review implementation summary for architecture details
3. Examine API documentation for endpoint specifications
4. Review logs for detailed error messages

---

**Last Updated**: October 15, 2025  
**Feature Status**: ✅ Production Ready  
**Coverage**: 70%+ articles with topics  
**Performance**: All targets met

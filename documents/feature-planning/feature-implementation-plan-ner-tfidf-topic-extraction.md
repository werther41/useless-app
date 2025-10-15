# NER + TF-IDF Topic Extraction Implementation

## Overview

Add intelligent topic extraction to the real-time fact feature, allowing users to select from 3-5 trending topics before generating personalized fun facts. This makes the feature more interactive and contextually relevant.

**Key Enhancement**: The schema and database tables are already created. Focus on implementing the extraction logic, APIs, and UI.

## Architecture

### Data Flow

1. **Ingestion**: News articles → NER extraction (Gemini) → TF-IDF scoring (async job) → Store topics
2. **User Flow**: Browse trending topics → Select topics → Generate fact from matching articles
3. **Fallback**: If no topics selected or no matches, use existing random query behavior

### Technology Stack

- **NER**: Gemini `gemini-2.0-flash-lite` (already integrated)
- **TF-IDF**: Python `scikit-learn` for batch processing
- **Runtime**: TypeScript for real-time extraction (optional lightweight approach)
- **Storage**: Turso (tables already exist per `lib/schema.ts` and `lib/init-db.ts`)

## Implementation Plan

### Phase 1: Python Backfill Infrastructure

#### 1.1 Python Environment Setup

**File**: `scripts/setup_env.sh` (already exists - verify/update)

- Ensure all required packages are listed
- Add activation instructions

**File**: `scripts/requirements.txt` (already exists - verify/update)

```python
libsql-client>=0.11.0
google-generativeai>=0.8.0
python-dotenv>=1.0.0
jupyter>=1.1.0
ipykernel>=6.29.0
scikit-learn>=1.5.0
pandas>=2.2.0
numpy>=1.26.0
tqdm>=4.66.0  # Progress bars
```

#### 1.2 Backfill Notebook

**File**: `scripts/backfill_topics.ipynb`

Core sections:

1. **Setup**: Load env vars, connect to Turso DB
2. **Data Loading**: Fetch all articles without topics
3. **NER Extraction**:

   - Batch articles (10-20 per batch)
   - Call Gemini with structured prompt
   - Parse entities: `{text, type, confidence}`
   - Rate limit: 2 second delays

4. **TF-IDF Calculation**:

   - Build corpus from all article titles + content
   - Calculate TF-IDF scores for extracted entities
   - Normalize scores (0-1 range)

5. **Storage**:

   - Insert into `article_topics` table
   - Update `trending_topics` aggregation

6. **Visualization**: Show distribution of entity types, top topics, coverage stats

**Entity Types** (custom mapping from Gemini output):

- `TECH`: Technology, software, AI, algorithms
- `ORG`: Organizations, companies, institutions
- `PERSON`: Scientists, researchers, public figures
- `LOCATION`: Countries, cities, regions
- `CONCEPT`: Scientific concepts, theories, discoveries
- `EVENT`: Events, phenomena, occurrences
- `OTHER`: Unmapped entities

#### 1.3 Topic Normalization

Implement deduplication logic:

- Lowercase normalization
- Remove punctuation
- Map synonyms (e.g., "AI" → "Artificial Intelligence")
- Store normalized form as `topic_text`, original as `entity_text`

### Phase 2: Topic Extraction Service

#### 2.1 Core Service

**File**: `lib/topic-extraction.ts` (new)

```typescript
// Main extraction function using Gemini
async function extractEntitiesFromArticle(
  title: string,
  content: string
): Promise<ExtractedEntity[]>

// Store topics for an article
async function storeArticleTopics(
  articleId: string,
  entities: ExtractedEntity[]
): Promise<void>

// Update trending topics aggregation (upsert logic)
async function updateTrendingTopics(entities: ExtractedEntity[]): Promise<void>

// Normalize entity text for deduplication
function normalizeEntityText(text: string): string
```

**Types** (add to `lib/schema.ts`):

```typescript
export interface ExtractedEntity {
  text: string
  type: string
  confidence: number
  tfidfScore?: number
}

export interface TopicWithMetadata extends TrendingTopic {
  related_articles: Array<{ id: string; title: string }>
}
```

#### 2.2 Topic Search

**File**: `lib/topic-search.ts` (new)

```typescript
// Find articles matching selected topics
async function findArticlesByTopics(
  topicTexts: string[],
  options?: {
    matchType: "any" | "all" // OR vs AND
    limit: number
    timeWindow: number // hours
  }
): Promise<NewsArticle[]>

// Default: matchType='any', limit=5, timeWindow=48
```

**Query logic**:

- JOIN `article_topics` with `news_articles`
- Filter by normalized topic text (IN clause)
- Order by: TF-IDF score DESC, published_at DESC
- Deduplicate articles (one article may match multiple topics)

### Phase 3: API Endpoints

#### 3.1 Topics API

**File**: `app/api/topics/route.ts` (new)

**GET** `/api/topics`

- Query params: `timeWindow` (default: 48h), `limit` (default: 10)
- Returns trending topics with metadata:

```typescript
{
  topics: [
    {
      id: string,
      text: string,
      type: string,
      occurrenceCount: number,
      avgTfidfScore: number,
      lastSeenAt: string,
    },
  ]
}
```

- Cache: 15 minutes (Next.js revalidate)
- Sort by: Combined score = `occurrenceCount * avgTfidfScore`

#### 3.2 Real-Time Facts Update

**File**: `app/api/facts/real-time/route.ts` (modify)

Update POST handler:

- Accept optional `selectedTopics: string[]` in request body
- If topics provided:
  - Call `findArticlesByTopics(selectedTopics)`
  - If matches found, use first match
  - If no matches, fall back to random query
- If no topics provided: existing behavior (random query)
- Add `X-Matched-Topics` header to response (comma-separated)

**Backward compatibility**: Existing client code works without changes.

### Phase 4: Frontend Components

#### 4.1 Topic Selector Component

**File**: `components/topic-selector.tsx` (new)

Features:

- Fetch topics from `/api/topics`
- Display as interactive badges/chips (using existing `Badge` component)
- Multi-select up to 5 topics (configurable)
- Show entity type icon + occurrence count
- Loading skeleton state
- Error handling with retry

Props:

```typescript
interface TopicSelectorProps {
  onTopicsChange: (topics: string[]) => void
  maxSelection?: number // default: 5
  className?: string
}
```

#### 4.2 Real-Time Fact Section Update

**File**: `components/real-time-fact-section.tsx` (modify)

Changes:

1. Add `<TopicSelector>` above "Get Real-Time Fact" button
2. Track selected topics in state
3. Pass topics to API: `POST /api/facts/real-time` body: `{selectedTopics}`
4. Display matched topics badge below fact (from `X-Matched-Topics` header)
5. Add "Clear topics" button to reset selection

Layout:

```
[Topic Selector (chips)]
↓
[Generate Fact Button]
↓
[Fact Display]
[Matched topics badge]
```

### Phase 5: News Ingestion Integration

**File**: `lib/news-ingestion.ts` (modify)

Add **async** topic extraction after article storage:

```typescript
// After successful article insert (line ~94)
// Fire-and-forget topic extraction (don't block ingestion)
extractAndStoreTopics(articleId, title, content).catch((err) =>
  console.error(`Topic extraction failed for ${articleId}:`, err)
)
```

**File**: `lib/topic-extraction.ts` (add)

```typescript
async function extractAndStoreTopics(
  articleId: string,
  title: string,
  content: string
): Promise<void> {
  const entities = await extractEntitiesFromArticle(title, content)
  await storeArticleTopics(articleId, entities)
  await updateTrendingTopics(entities)
}
```

**Error handling**: If extraction fails, article still saved (graceful degradation).

### Phase 6: Admin Tools (Optional, Phase 2)

#### 6.1 Admin UI

**File**: `app/admin/topics/page.tsx` (new)

Features:

- Trigger backfill for articles without topics
- View topic extraction statistics
- Manual topic cleanup (remove stale topics)
- Export topics data

#### 6.2 Cleanup Cron

**File**: `app/api/cron/cleanup-topics/route.ts` (new)

Scheduled task (daily):

- Delete topics from articles older than 30 days
- Recalculate trending topics aggregation
- Remove trending topics with `occurrence_count < 2`

## Key Implementation Details

### NER Prompt for Gemini

```
Extract named entities from this news article. Return a JSON array of entities.

Article Title: {{title}}
Content: {{content}}

For each entity, provide:
- text: The entity text
- type: One of [TECH, ORG, PERSON, LOCATION, CONCEPT, EVENT, OTHER]
- confidence: 0.0-1.0

Return ONLY valid JSON: [{"text":"...","type":"...","confidence":0.9}, ...]
```

### TF-IDF Configuration

- **Vectorizer**: `TfidfVectorizer` from scikit-learn
- **Max features**: 1000
- **Stop words**: English
- **N-grams**: (1, 2) for unigrams and bigrams
- **Min document frequency**: 2 (appears in at least 2 articles)
- **Sublinear TF**: True (log scaling)

### Topic Matching Logic (Phase 3.2)

- **Default**: `matchType='any'` (OR logic)
- **Rationale**: More results, better UX. Users select topics they're interested in.
- **Scoring**: If multiple topics match, prioritize articles matching more topics (implicit ranking)

### Performance Optimizations

- Cache trending topics (15 min)
- Batch database inserts (transaction)
- Async topic extraction (non-blocking)
- Index on `article_topics(entity_text)` for fast lookups (already added in `init-db.ts`)

### Error Handling Strategy

1. **NER API fails**: Log error, skip article, continue processing
2. **Invalid entity JSON**: Parse with try-catch, extract valid entries
3. **Database errors**: Rollback transaction, log, retry once
4. **No topics found**: Fall back to random query (existing behavior)
5. **Frontend errors**: Show error message, allow retry, hide topic selector

## Testing Checklist

- [ ] Python notebook processes 100+ articles successfully
- [ ] Topics stored correctly in both tables
- [ ] GET `/api/topics` returns expected data structure
- [ ] POST `/api/facts/real-time` works with and without topics
- [ ] Topic selector shows/hides correctly
- [ ] Multi-select enforces max limit
- [ ] Article matching finds correct articles
- [ ] Fallback to random query works when no matches
- [ ] News ingestion doesn't break if topic extraction fails
- [ ] Performance: Topic extraction < 3s per article

## Success Metrics

- **Coverage**: 70%+ articles have extracted topics after backfill
- **Quality**: Manual review of 50 topics shows 90%+ relevance
- **Performance**: API response time < 500ms (cached), < 2s (uncached)
- **User engagement**: Track topic selection rate via analytics
- **Error rate**: < 10% failed extractions (acceptable due to varied content quality)

## Migration Path

1. **Deploy schema changes**: Already done (tables exist)
2. **Deploy services + APIs**: Topic extraction, search, API endpoints
3. **Run backfill notebook**: Process existing articles (can be done over days)
4. **Deploy frontend**: Topic selector and updated fact section
5. **Enable real-time extraction**: Uncomment fire-and-forget in news ingestion
6. **Monitor**: Check logs, error rates, user engagement

## Files Summary

**New files (7)**:

- `lib/topic-extraction.ts` - Core extraction service
- `lib/topic-search.ts` - Topic-based article search
- `app/api/topics/route.ts` - Topics API endpoint
- `components/topic-selector.tsx` - Topic selection UI
- `scripts/backfill_topics.ipynb` - Python backfill notebook
- `app/admin/topics/page.tsx` - Admin interface (optional)
- `app/api/cron/cleanup-topics/route.ts` - Cleanup cron (optional)

**Modified files (3)**:

- `app/api/facts/real-time/route.ts` - Add topic filtering
- `components/real-time-fact-section.tsx` - Add topic selector
- `lib/news-ingestion.ts` - Add async topic extraction

**Updated files (2)**:

- `scripts/requirements.txt` - Add tqdm for progress bars
- `lib/schema.ts` - Add `ExtractedEntity` and `TopicWithMetadata` types

## Risk Mitigation

- **API rate limits**: Built-in delays (2s), retry with exponential backoff
- **Poor quality topics**: Manual review of top 100, adjust prompts/filters
- **Performance degradation**: Async extraction, caching, monitoring
- **User confusion**: Clear UI, tooltips, default to existing behavior
- **Data privacy**: No PII in extracted topics (filter PERSON entities if needed)

## Timeline Estimate

- **Week 1**: Python notebook + backfill existing articles (2-3 days active work)
- **Week 2**: TypeScript services (extraction, search) + API endpoints (3-4 days)
- **Week 3**: Frontend components + integration (2-3 days)
- **Week 4**: Testing, refinement, deployment (2-3 days)

**Total**: ~3-4 weeks with buffer for testing and iteration.

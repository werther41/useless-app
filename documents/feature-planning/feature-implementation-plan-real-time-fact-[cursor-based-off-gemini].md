# Real-Time News-Based Fun Facts Implementation

## Overview

Implement a pipeline that fetches news daily from RSS feeds, generates embeddings using Gemini, stores articles with vector embeddings in Turso, and generates fun facts using Gemini LLM based on relevant news articles.

## Technology Stack

- **RSS Parsing**: `rss-parser` npm package

- **Embedding Model**: Google Gemini `text-embedding-004`

- **LLM**: Google Gemini `gemini-1.5-flash` via Vercel AI SDK

- **AI SDK**: `ai` and `@ai-sdk/google` packages

- **Database**: Turso with native vector search support

- **Scheduling**: Vercel Cron Jobs

## Implementation Steps

### 1. Database Schema Update

**File**: `lib/schema.ts`

- Add `NewsArticle` interface with fields: `id`, `title`, `content`, `url`, `source`, `published_at`, `created_at`, `embedding`

**File**: `lib/init-db.ts`

- Create `news_articles` table with vector column for embeddings (`F32_BLOB` type)

- Add unique index on `url` to prevent duplicates

- Add index on `created_at` for efficient querying

### 2. Install Dependencies

Add required packages:

- `npm install rss-parser @ai-sdk/google ai @google/generative-ai`

### 3. Environment Configuration

**File**: `.env.local` (or `.env.development.local`)

```

GOOGLE_API_KEY=your-gemini-api-key

CRON_SECRET=your-random-secret-key

```

Update README.md to document new environment variables.

### 4. Create Embedding Utility

**File**: `lib/embeddings.ts` (new)

- Create utility function to generate embeddings using Gemini `text-embedding-004`

- Use `@google/generative-ai` package directly for embedding generation

- Export `generateEmbedding(text: string): Promise<number[]>` function

### 5. Create News Ingestion Service

**File**: `lib/news-ingestion.ts` (new)

- Define RSS feed sources (BBC, Reuters, TechCrunch, Hacker News RSS, Science Daily, NASA)

- Implement `fetchAndStoreNews()` function:

- Parse RSS feeds using `rss-parser`

- Check for duplicate URLs in database

- Generate embeddings for article title + content

- Insert articles with embeddings into Turso

- Add error handling and logging

### 6. Cron Job API Route

**File**: `app/api/cron/retrieve-news/route.ts` (new)

- Create POST endpoint that calls `fetchAndStoreNews()`

- Validate `Authorization` header against `CRON_SECRET`

- Return summary of articles fetched/stored

- Export `dynamic = "force-dynamic"` and `maxDuration = 60`

**File**: `vercel.json`

- Add cron configuration to run daily at midnight UTC:

```json
{
  "crons": [
    {
      "path": "/api/cron/retrieve-news",

      "schedule": "0 0 * * *"
    }
  ]
}
```

- Add maxDuration config for the cron route

### 7. Vector Search Utility

**File**: `lib/vector-search.ts` (new)

- Implement `findSimilarArticle(queryEmbedding: number[]): Promise<NewsArticle>` function

- Use Turso's `vector_distance_cos()` function for similarity search

- Return the most relevant article based on cosine similarity

### 8. Real-Time Fact Generation API

**File**: `app/api/facts/real-time/route.ts` (new)

- Create POST endpoint for generating real-time facts

- Use `@ai-sdk/google` and Vercel AI SDK:

1. Generate query embedding for "interesting and unusual recent event"

2. Call `findSimilarArticle()` to get relevant news

3. Use `streamText()` with Gemini `gemini-1.5-flash` model

4. System prompt: "You are an assistant that creates short, quirky, and 'useless' fun facts from news articles. The fact should be surprising and tangentially related to the main point. Do not state the obvious. Output only the fact itself."

5. Return streaming response with `toAIStreamResponse()`

- Add cache control headers matching existing patterns

- Export `dynamic = "force-dynamic"` and `revalidate = 0`

### 9. Frontend Component

**File**: `components/real-time-fact-section.tsx` (new)

- Create component with "Get Real-Time Fact" button

- Use `useChat` or `fetch` with streaming support

- Display loading state while generating

- Show generated fact with attribution to news source

- Style with Tailwind CSS matching existing design

- Add error handling UI

**File**: `app/page.tsx`

- Import and add `<RealTimeFact />` component after main fact display section

- Place before the "Deep Dive" section

### 10. Validation & Testing

**Create test endpoint**: `app/api/test/gemini/route.ts` (temporary)

- Test embedding generation with sample text

- Test chat completion with sample prompt

- Verify API key works correctly

- Delete after validation

## Key Files to Create

1. `lib/schema.ts` - Update with NewsArticle interface

2. `lib/init-db.ts` - Add news_articles table

3. `lib/embeddings.ts` - Gemini embedding utility

4. `lib/news-ingestion.ts` - RSS feed fetching logic

5. `lib/vector-search.ts` - Turso vector search

6. `app/api/cron/retrieve-news/route.ts` - Daily cron job

7. `app/api/facts/real-time/route.ts` - Fact generation endpoint

8. `components/real-time-fact-section.tsx` - UI component

9. `app/api/test/gemini/route.ts` - Test endpoint (temporary)

## Key Files to Modify

1. `app/page.tsx` - Add real-time fact section

2. `vercel.json` - Add cron job configuration

3. `package.json` - Updated via npm install

4. `README.md` - Document new env variables

## RSS Feed Sources

- **General News**: BBC News RSS, Reuters Top News

- **Tech**: TechCrunch RSS, Hacker News RSS

- **Science**: Science Daily RSS, NASA Breaking News

- **Programming**: GitHub Blog RSS, Dev.to RSS

## Important Notes

- Turso vector embeddings use `F32_BLOB` type for storing float32 arrays

- Use `vector_distance_cos(embedding, ?)` for similarity search in SQL

- Gemini embedding-004 returns 768-dimensional vectors

- Store embeddings as binary blobs in Turso

- Cron jobs on Vercel require verification via Authorization header

- Set appropriate `maxDuration` for long-running operations

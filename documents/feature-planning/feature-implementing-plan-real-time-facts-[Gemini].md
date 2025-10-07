# Real-Time Fun Fact Feature: Implementation Plan

This document outlines the plan for developing and implementing a new feature that generates fun facts based on real-time news events for the "Useless App".

## 1. Overview

The goal is to create a pipeline that:

1. Fetches fresh news daily from RSS feeds.
2. Converts news articles into vector embeddings.
3. Stores the articles and their embeddings in the database.
4. Uses an LLM to generate a fun fact based on a relevant news article when a user requests it.

## 2. Proposed Architecture

```
+--------------------------+      +--------------------------+      +--------------------------+
|      Vercel Cron Job     |----->|   Next.js API Route      |----->|      RSS Feed Sources    |
| (Triggers Daily at 00:00)|      | /api/cron/retrieve-news  |      |  (e.g., BBC, Reuters)    |
+--------------------------+      +--------------------------+      +--------------------------+
             |                                |
             |                                v
+--------------------------+      +--------------------------+      +--------------------------+
|      User Frontend       |      |    Embedding Service     |----->|      Turso Database      |
|  (Requests new fact)     |<---->| (OpenAI text-embedding)  |      | (Stores articles+vectors)|
+--------------------------+      +--------------------------+      +--------------------------+
             |                                                               |
             | API Call to /api/facts/real-time                              | Vector Search for
             v                                                               | relevant article
+----------------------------------------------------------------------------+
|                            Next.js API Route                               |
|                           /api/facts/real-time                             |
+----------------------------------------------------------------------------+
             |
             | Context (News Article) + Prompt
             v
+--------------------------+
|        LLM Service       |
| (Vercel AI SDK -> Groq)  |
+--------------------------+
             |
             | Generated Fun Fact
             v
+--------------------------+
|      User Frontend       |
| (Displays new fact)      |
+--------------------------+
```

## 3. Technology Choices

- **Backend Framework:** Next.js 13+ (App Directory)
- **Database:** Turso (libSQL) with native vector search
- **Scheduled Tasks:** Vercel Cron Jobs
- **RSS Parsing:** `rss-parser` (npm package)
- **Embedding Model:** OpenAI `text-embedding-ada-002`
- **LLM Provider:** Groq via Vercel AI SDK (for speed)
- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, shadcn/ui

## 4. Step-by-Step Implementation Plan

### ✅ **Step 1: Update Database Schema (Turso)**

- [ ] **Create a `news_articles` table.**
- [ ] Define the following columns:
  - `id` (Primary Key, e.g., UUID or auto-incrementing integer)
  - `title` (TEXT, NOT NULL)
  - `content` (TEXT, NOT NULL) - _Store the main body of the article._
  - `url` (TEXT, UNIQUE, NOT NULL) - _To prevent duplicates._
  - `source` (TEXT) - _e.g., "BBC News"_
  - `published_at` (TIMESTAMP)
  - `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)
  - `embedding` (BLOB or VECTOR type) - _This will store the vector embedding._

### ✅ **Step 2: Backend - Daily News Ingestion Pipeline**

- [ ] **Create a new API Route:** `app/api/cron/retrieve-news/route.ts`.
- [ ] **Install `rss-parser`:** `npm install rss-parser`.
- [ ] **Implement the route logic:**
  - Define a list of RSS feed URLs to fetch.
  - Use `rss-parser` to parse each feed.
  - Loop through the items in the feed.
  - For each article:
    1. Check if the article URL already exists in the `news_articles` table to avoid duplicates.
    2. Call the OpenAI API to generate an embedding for the article's `title` and `content`.
    3. Insert the new article's data (`title`, `content`, `url`, `source`, `published_at`, `embedding`) into the Turso database.
- [ ] **Add Security:** Secure this endpoint using a secret key passed in the headers, which will be configured in the Vercel Cron Job settings. Check for `request.headers.get('authorization')`.

### ✅ **Step 3: Schedule the Task with Vercel Cron Job**

- [ ] **Create or update `vercel.json`** in the root of your project.
- [ ] **Add the cron job configuration:**
  ```
  {
    "crons": [
      {
        "path": "/api/cron/retrieve-news",
        "schedule": "0 0 * * *"
      }
    ]
  }
  ```
  _This schedule runs the job every day at midnight UTC._
- [ ] **Set the Cron Secret** in your Vercel project's environment variables (`CRON_SECRET`). This is the key you will check for in the API route.

### ✅ **Step 4: Backend - Fun Fact Generation API**

- [ ] **Create a new API Route:** `app/api/facts/real-time/route.ts`.
- [ ] **Install Vercel AI SDK:** `npm install ai`.
- [ ] **Implement the route logic:**
  1. **Generate a query embedding:** Create a simple query string like "an interesting and unusual event" and generate an embedding for it using the OpenAI API.
  2. **Perform Vector Search:** Query the Turso database to find the `news_articles` record with the embedding closest to your query embedding (cosine similarity).
  3. **Get the News Article:** Retrieve the content of the top matching article.
  4. **Prompt the LLM:** Use the Vercel AI SDK to send the article content to Groq.

     - **System Prompt:** "You are an assistant that creates short, quirky, and 'useless' fun facts from news articles. The fact should be surprising and tangentially related to the main point of the article. Do not state the obvious. Output only the fact itself."
     - **User Prompt:** `Here is the article: [article.content]. Please generate a fun fact.`

  5. **Return the Response:** Stream the LLM's response back to the client.

### ✅ **Step 5: Frontend Integration**

- [ ] **Create a new component:** `RealTimeFact.tsx`.
- [ ] **Add a button** in your UI: "✨ Get a Real-Time Fact".
- [ ] **Implement the client-side logic:**
  - On button click, make a `fetch` request to `/api/facts/real-time`.
  - Display a loading state while waiting for the response.
  - When the response is received, display the new fun fact.
  - Handle potential errors gracefully (e.g., show an error message if the API call fails).
- [ ] **Style the new section** using Tailwind CSS and shadcn/ui to match the existing application design.

## 5. Key Considerations

- **Cost Management:** API calls to OpenAI (embeddings) and your chosen LLM (generation) will incur costs. Monitor usage closely. Consider caching generated facts for a short period.
- **Data Quality:** The quality of the generated facts is highly dependent on the source RSS feeds. Curate a list of high-quality news sources.
- **Error Handling:** Implement robust error handling for failed API calls, database operations, and RSS feed parsing.
- **Scalability:** The serverless architecture is well-suited for scaling. Turso's performance with vector search will be a key factor to monitor as the dataset grows.

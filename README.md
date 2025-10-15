# Useless Facts

A playful Next.js 13 app that lets you generate and rate completely useless facts, explore a data‑driven burger flipping infographic, and read a tiny blog. Built with the App Router, Tailwind CSS, shadcn/ui components, and powered by Turso database. Live website: [useless-app-nu.vercel.app](https://useless-app-nu.vercel.app/).

## What this project does

- **Quick Facts**: Generate a random "useless" fact and vote it up or down with persistent ratings
- **Real-Time News Facts**: AI-powered fun facts generated from the latest news articles with intelligent topic selection
- **Topic Selection**: Choose from trending topics extracted via NER (Named Entity Recognition) and ranked by TF-IDF scores
- **Database Integration**: All facts, ratings, articles, and topics stored in Turso (libSQL) cloud database
- **Admin Interface**: Bulk import facts and monitor topic extraction statistics at `/admin/import` and `/admin/topics`
- **Infographics**: Visit `/deep-dive/burger-infographic` for a Chart.js‑powered deep dive on burger flipping myths vs. science
- **Blog**: A simple `/blog` page for updates
- **Theming**: Light/dark mode via `next-themes`
- **API**: RESTful API for facts management, topic retrieval, and news ingestion

## Tech stack

- **Frontend**: Next.js 13 (App Directory, React 18), TypeScript, Tailwind CSS + shadcn/ui + Lucide icons
- **Backend**: Next.js API Routes, Turso (libSQL) database
- **AI/ML**: Google Gemini 2.0 Flash Lite for NER (Named Entity Recognition)
- **Topic Extraction**: TF-IDF calculation for topic relevance scoring
- **Data Visualization**: Chart.js + react-chartjs-2
- **Validation**: Zod for type-safe data validation
- **RSS Integration**: RSS Parser for news article ingestion
- **Deployment**: Vercel with automatic CI/CD

## Requirements

- Node.js 22.x (enforced via `engines` in `package.json`)
- npm (repo includes `package-lock.json`)
- Turso database credentials (see Environment Setup below)

## Setup

### 1) Install dependencies

```bash
npm install
# or for clean CI-style installs
npm ci
```

### 2) Environment Setup

Create a `.env.local` file with your credentials:

```env
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
GOOGLE_API_KEY=your-google-gemini-api-key
CRON_SECRET=your-random-secret-key-for-cron-jobs
```

### 3) Initialize Database

Seed the database with initial facts:

```bash
# Via API (recommended)
curl -X POST http://localhost:3000/api/seed

# Or visit http://localhost:3000/api/seed in your browser
```

### 4) Start the development server

```bash
npm run dev
# http://localhost:3000
```

You can browse:

- `/` — Quick Facts generator with voting, persistent ratings, and real-time news facts
- `/admin/import` — Admin interface for bulk importing facts
- `/admin/topics` — Admin dashboard for topic extraction statistics
- `/deep-dive/burger-infographic` — burger flipping infographic (Chart.js)
- `/blog` — project blog
- `/api/facts/random` — API endpoint for random facts
- `/api/topics` — API endpoint for trending topics
- `/api/facts/real-time` — API endpoint for generating AI facts from news

## API Documentation

Complete API documentation is available at: [documents/api-docs.md](./documents/api-docs.md)

**Quick API Examples:**

- `GET /api/facts/random` — Get a random fact
- `POST /api/facts/{id}/rate` — Rate a fact (1 or -1)
- `GET /api/facts` — Get all facts with pagination
- `POST /api/facts/import` — Bulk import facts (admin)
- `GET /api/topics` — Get trending topics with filters
- `POST /api/facts/real-time` — Generate AI fact from news with optional topic selection
- `GET /api/cron/retrieve-news` — Trigger news ingestion (protected)

## Production

Build and start a production server:

```bash
npm run build
npm run start
# default: http://localhost:3000
```

Or use the preview shortcut:

```bash
npm run preview
```

## Deployment

This app is deployed on Vercel with automatic CI/CD and Turso database integration.

- **Production**: [useless-app-nu.vercel.app](https://useless-app-nu.vercel.app/)
- **Main branch deploys**: Merging to `main` automatically builds and updates the production site.
- **Preview deploys for PRs**: Creating a Pull Request triggers a build and deploy to a temporary preview URL for review. Pushing new commits to the PR updates that preview. Merging the PR deploys to production.

**Environment Variables on Vercel:**

- `TURSO_DATABASE_URL` — Your Turso database URL
- `TURSO_AUTH_TOKEN` — Your Turso authentication token
- `GOOGLE_API_KEY` — Your Google Gemini API key for AI features
- `CRON_SECRET` — Secret key for securing cron job endpoints

**Typical workflow**:

1. Create a PR from your feature branch
2. Review the Vercel Preview deployment URL
3. Merge to `main` to promote changes to production

## Useful scripts

- `npm run dev` — start Next.js in dev mode
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint
- `npm run lint:fix` — fix lint issues
- `npm run typecheck` — run TypeScript in no‑emit mode
- `npm run format:check` — Prettier check
- `npm run format:write` — Prettier write

## Project structure (high level)

- `app/` — App Router pages, API routes, and layouts
  - `api/facts/` — RESTful API endpoints for facts management
  - `api/topics/` — Topics API for trending topic retrieval
  - `api/cron/` — Cron jobs for news ingestion and cleanup
  - `admin/` — Admin interface for content management and topic monitoring
- `components/` — UI components (shadcn/ui) including topic selector
- `config/` — site config
- `data/` — static data (e.g., fun facts JSON)
- `documents/` — project documentation, testing guides, and implementation plans
- `lib/` — utilities, database functions, topic extraction, and validation schemas
- `scripts/` — testing scripts and development utilities
- `public/` — static assets
- `styles/` — global Tailwind CSS

## Database Features

- **Persistent Storage**: All facts, ratings, news articles, and extracted topics stored in Turso cloud database
- **User Rating System**: Track user votes by IP address
- **News Articles**: Store and retrieve news from multiple RSS feeds
- **Topic Extraction**: Store extracted entities with NER confidence and TF-IDF scores
- **Trending Topics**: Aggregate and rank topics by occurrence and relevance
- **Duplicate Prevention**: Skip duplicate facts and articles during import
- **Data Validation**: Zod schemas ensure data integrity
- **Admin Interface**: Bulk import facts and monitor topic extraction via web interface

## Admin Features

- **Bulk Import**: Import facts via JSON format with validation
- **Duplicate Handling**: Skip or update existing facts
- **Import Results**: Detailed feedback on import success/failures
- **Topic Monitoring**: View topic extraction statistics and trending topics at `/admin/topics`
- **Coverage Metrics**: Track percentage of articles with extracted topics
- **User-Friendly Interface**: Clean admin panels at `/admin/import` and `/admin/topics`

## API Features

- **RESTful Design**: Standard HTTP methods and status codes
- **Type Safety**: Full TypeScript support with Zod validation
- **Error Handling**: Comprehensive error responses
- **Pagination**: Efficient data retrieval with pagination
- **User Tracking**: IP-based user rating tracking
- **Topic Retrieval**: Get trending topics with filtering and caching
- **News Ingestion**: Automated RSS feed processing with cron jobs
- **AI Generation**: Stream AI-generated facts with Gemini integration

## NER + TF-IDF Topic Extraction

### Overview

The app features an intelligent topic extraction system that analyzes news articles to extract trending topics, enabling users to select topics before generating personalized fun facts.

### How It Works

1. **News Ingestion**: RSS feeds are automatically processed to fetch latest articles
2. **Entity Extraction**: Google Gemini 2.0 Flash Lite performs Named Entity Recognition to identify key entities
3. **TF-IDF Scoring**: Calculate Term Frequency-Inverse Document Frequency scores to measure topic importance
4. **Topic Aggregation**: Entities are aggregated into trending topics ranked by occurrence and relevance
5. **User Selection**: Users can select up to 2 trending topics to personalize their fact generation
6. **Smart Matching**: Articles matching selected topics are prioritized for fact generation

### Entity Types

The system recognizes 7 entity types:

- **TECH**: Technology, software, AI (e.g., "Artificial Intelligence", "Machine Learning")
- **ORG**: Organizations, companies (e.g., "Google", "Meta")
- **PERSON**: People, scientists, CEOs (e.g., "Sundar Pichai")
- **LOCATION**: Cities, countries, regions (e.g., "Silicon Valley")
- **CONCEPT**: Scientific concepts, theories (e.g., "Neural Networks")
- **EVENT**: Events, phenomena (e.g., "Tech Conference 2025")
- **OTHER**: Uncategorized entities

### Testing

Comprehensive testing infrastructure is provided:

```bash
# Run complete API test suite
chmod +x scripts/test-all.sh
./scripts/test-all.sh

# Test topic extraction service
npx tsx scripts/test-topic-extraction.ts

# Trigger news ingestion
curl http://localhost:3000/api/cron/retrieve-news
```

For detailed testing instructions, see: [documents/TESTING_GUIDE.md](./documents/TESTING_GUIDE.md)

### Documentation

- **Testing Guide**: [documents/TESTING_GUIDE.md](./documents/TESTING_GUIDE.md) — Comprehensive testing documentation
- **Implementation Summary**: [documents/IMPLEMENTATION_SUMMARY.md](./documents/IMPLEMENTATION_SUMMARY.md) — Feature overview and architecture
- **Implementation Plan**: [documents/feature-planning/feature-implementation-plan-ner-tfidf-topic-extraction.md](./documents/feature-planning/feature-implementation-plan-ner-tfidf-topic-extraction.md) — Detailed implementation plan

## Credits

Started from the shadcn Next.js template and adapted for this project. Database integration powered by Turso (libSQL). AI features powered by Google Gemini.

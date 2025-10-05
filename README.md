# Useless Facts

A playful Next.js 13 app that lets you generate and rate completely useless facts, explore a data‑driven burger flipping infographic, and read a tiny blog. Built with the App Router, Tailwind CSS, shadcn/ui components, and powered by Turso database. Live website: [useless-app-nu.vercel.app](https://useless-app-nu.vercel.app/).

## What this project does

- **Quick Facts**: Generate a random "useless" fact and vote it up or down with persistent ratings
- **Database Integration**: All facts and ratings are stored in Turso (libSQL) cloud database
- **Admin Interface**: Bulk import facts via a user-friendly admin panel at `/admin/import`
- **Infographics**: Visit `/deep-dive/burger-infographic` for a Chart.js‑powered deep dive on burger flipping myths vs. science
- **Blog**: A simple `/blog` page for updates
- **Theming**: Light/dark mode via `next-themes`
- **API**: RESTful API for facts management with full CRUD operations

## Tech stack

- **Frontend**: Next.js 13 (App Directory, React 18), TypeScript, Tailwind CSS + shadcn/ui + Lucide icons
- **Backend**: Next.js API Routes, Turso (libSQL) database
- **Data Visualization**: Chart.js + react-chartjs-2
- **Validation**: Zod for type-safe data validation
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

- `/` — Quick Facts generator with voting and persistent ratings
- `/admin/import` — Admin interface for bulk importing facts
- `/deep-dive/burger-infographic` — burger flipping infographic (Chart.js)
- `/blog` — project blog
- `/api/facts/random` — API endpoint for random facts

## API Documentation

Complete API documentation is available at: [documents/api-docs.md](./documents/api-docs.md)

**Quick API Examples:**

- `GET /api/facts/random` — Get a random fact
- `POST /api/facts/{id}/rate` — Rate a fact (1 or -1)
- `GET /api/facts` — Get all facts with pagination
- `POST /api/facts/import` — Bulk import facts (admin)

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
  - `admin/` — Admin interface for content management
- `components/` — UI components (shadcn/ui)
- `config/` — site config
- `data/` — static data (e.g., fun facts JSON)
- `documents/` — project documentation
- `lib/` — utilities, database functions, and validation schemas
- `public/` — static assets
- `styles/` — global Tailwind CSS

## Database Features

- **Persistent Storage**: All facts and user ratings stored in Turso cloud database
- **User Rating System**: Track user votes by IP address
- **Duplicate Prevention**: Skip duplicate facts during import
- **Data Validation**: Zod schemas ensure data integrity
- **Admin Interface**: Bulk import facts via web interface

## Admin Features

- **Bulk Import**: Import facts via JSON format with validation
- **Duplicate Handling**: Skip or update existing facts
- **Import Results**: Detailed feedback on import success/failures
- **User-Friendly Interface**: Clean admin panel at `/admin/import`

## API Features

- **RESTful Design**: Standard HTTP methods and status codes
- **Type Safety**: Full TypeScript support with Zod validation
- **Error Handling**: Comprehensive error responses
- **Pagination**: Efficient data retrieval with pagination
- **User Tracking**: IP-based user rating tracking

## Credits

Started from the shadcn Next.js template and adapted for this project. Database integration powered by Turso (libSQL).

# Useless Facts

A playful Next.js 13 app that lets you generate and rate completely useless facts, explore a data‑driven burger flipping infographic, and read a tiny blog. Built with the App Router, Tailwind CSS, and shadcn/ui components. Live website: [useless-app-nu.vercel.app](https://useless-app-nu.vercel.app/).

## What this project does

- Quick Facts: Generate a random "useless" fact and vote it up or down.
- Infographics: Visit `/burger-infographic` for a Chart.js‑powered deep dive on burger flipping myths vs. science.
- Blog: A simple `/blog` page for updates.
- Theming: Light/dark mode via `next-themes`.

## Tech stack

- Next.js 13 (App Directory, React 18)
- TypeScript
- Tailwind CSS + shadcn/ui + Lucide icons
- Chart.js + react-chartjs-2

## Requirements

- Node.js 22.x (enforced via `engines` in `package.json`)
- npm (repo includes `package-lock.json`)

## Setup

1) Install dependencies

```bash
npm install
# or for clean CI-style installs
npm ci
```

2) Start the development server

```bash
npm run dev
# http://localhost:3000
```

You can browse:

- `/` — Quick Facts generator with voting
- `/burger-infographic` — burger flipping infographic (Chart.js)
- `/blog` — project blog

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

This app is deployed on Vercel with automatic CI/CD.

- **Production**: [useless-app-nu.vercel.app](https://useless-app-nu.vercel.app/)
- **Main branch deploys**: Merging to `main` automatically builds and updates the production site.
- **Preview deploys for PRs**: Creating a Pull Request triggers a build and deploy to a temporary preview URL for review. Pushing new commits to the PR updates that preview. Merging the PR deploys to production.

**Typical workflow**:
1) Create a PR from your feature branch
2) Review the Vercel Preview deployment URL
3) Merge to `main` to promote changes to production

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

- `app/` — App Router pages (`/`, `/blog`, `/burger-infographic`), layout and tests
- `components/` — UI components (shadcn/ui)
- `config/` — site config
- `data/` — static data (e.g., fun facts JSON)
- `lib/` — utilities and fonts
- `public/` — static assets
- `styles/` — global Tailwind CSS

## Credits

Started from the shadcn Next.js template and adapted for this project.

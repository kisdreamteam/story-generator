# Deployment checkpoint (Vercel)

Checkpoint deploy for review and QA — **not** a production launch.

## Platform

| Setting | Value |
|---------|--------|
| Platform | [Vercel](https://vercel.com) |
| Framework | Vite (auto-detected) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` (default) |

## Routing

The app uses React Router (`createBrowserRouter`) with client-side routes such as `/dashboard`, `/dashboard/create`, and `/dashboard/stories/:storyId`.

[`vercel.json`](../vercel.json) rewrites non-asset requests to `index.html` so direct URL loads and refreshes work on Vercel. Static assets under `/assets/` are served as files.

## Environment variables

Copy [`.env.example`](../.env.example) for local development only. **Do not commit real secrets.**

For this checkpoint deploy, configure **no** production secrets in Vercel unless explicitly testing a later phase:

| Variable | Checkpoint deploy |
|----------|-------------------|
| `VITE_SUPABASE_URL` | Not required — cloud storage off by default |
| `VITE_SUPABASE_ANON_KEY` | Not required |
| `VITE_ENABLE_SUPABASE_STORIES` | Leave unset or `false` |
| `VITE_GENERATION_MODE` | Default `mock` (no API calls) |
| `OPENAI_API_KEY` | Not connected — no serverless story API on Vercel yet |
| `VITE_OPENAI_API_KEY` | Do not use — deprecated for browser |

Stories persist in **localStorage** when Supabase is disabled.

## Current limitations

- **Mock story generation** — default mode; no paid AI text or image APIs.
- **No Supabase** — no cloud sync or auth until keys are added in a later deploy.
- **No `/api/story-generation` on Vercel** — the dev-only Vite middleware handler does not run in static production builds; real AI text requires a future serverless route or external API.
- **Illustrations** — mock SVG placeholders only.
- **Checkpoint scope** — validates build, routing, and teacher UI flows in a hosted environment; not feature-complete for production teachers.

## Pre-deploy checklist

1. `npm run build` passes locally.
2. No `.env` file committed (only `.env.example` with empty placeholders).
3. Vercel project root = repository root; build command = `npm run build`.
4. After deploy, smoke-test: landing page, `/dashboard`, `/dashboard/create`, refresh on a deep link (e.g. `/dashboard/stories`).

## Related docs

- [domain-6-ai-image-ecosystem.md](./domain-6-ai-image-ecosystem.md) — mock vs real AI boundaries
- [architecture.md](./architecture.md) — app structure

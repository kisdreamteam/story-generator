# Story Generation API (placeholder)

This folder is a **backend route placeholder** for AI story generation. There is no runnable server in this repo yet — the Vite React app remains frontend-only.

When you add a backend, implement a handler here (or copy this contract into your chosen platform).

## Suggested route

```
POST /api/story-generation
Content-Type: application/json
```

## Request body

`AiStoryGenerationApiRequest` — see `storyGeneration.contract.ts`:

| Field | Description |
|-------|-------------|
| `prompt` | Built prompt sections (system, user, format, continuity, safety) |
| `input` | Original `StoryGenerationInput` from the teacher setup form |
| `requestedModel` | Model name (non-secret config from frontend env) |
| `provider` | Provider id (non-secret config from frontend env) |

## Response body

`AiStoryGenerationApiResponse`:

| Field | Description |
|-------|-------------|
| `ok` | Whether generation succeeded |
| `rawText` | Raw JSON/text from the AI provider (when `ok`) |
| `errorMessage` | Error detail (when not `ok`) |
| `provider` | Provider used on the server |
| `model` | Model used on the server |

## Server responsibilities (future)

1. Validate the request body against the contract.
2. Read the AI provider API key from **server-side** environment variables (never `VITE_*`).
3. Call the AI provider with `prompt` + `input`.
4. Return `AiStoryGenerationApiResponse` with `rawText` on success.

## Frontend (current)

- The browser **must never** call OpenAI or other AI providers directly.
- `src/features/story-generation/services/requestAiStoryGeneration.ts` is a client wrapper that is **still mocked** and returns `"AI generation API is not connected yet."`
- When the backend exists, enable the commented `fetch('POST /api/story-generation')` block in that service.

## Contract sync

If you change request/response shapes in the frontend, update `storyGeneration.contract.ts` to match (or extract a shared package later).

## Platform notes

This layout maps cleanly to:

- **Vercel** — `api/story-generation.ts` or App Router route handler
- **Netlify** — `netlify/functions/story-generation.ts`
- **Express** — `app.post('/api/story-generation', ...)`
- **Supabase Edge Functions** — `supabase/functions/story-generation/index.ts`

The contract file can be imported or copied into whichever handler you choose.

# Story Generation API

Server-side handler for AI story text generation. The browser never holds provider secrets.

## Routes

| Environment | Entry |
|-------------|-------|
| **Local dev** | Vite middleware in `vite.config.ts` → `POST /api/story-generation` |
| **Vercel** | `api/story-generation.ts` → `POST /api/story-generation` |

Both delegate to `handleStoryGenerationRequest.ts`.

## Feature flag (frontend)

Set in `.env`:

```env
VITE_GENERATION_MODE=ai
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4o-mini
# Optional override:
# VITE_STORY_GENERATION_API_URL=/api/story-generation
```

Default is `mock` — no backend call is made.

## Server secret (never in the browser)

```env
OPENAI_API_KEY=sk-...
```

Use **`OPENAI_API_KEY`** without the `VITE_` prefix. Vite only exposes `VITE_*` variables to the client bundle.

## Suggested route

```
POST /api/story-generation
Content-Type: application/json
```

## Request body (create flow)

`StoryGenerationBackendRequest` — see `storyGeneration.contract.ts` and `handleStoryGenerationRequest.ts`:

| Field | Description |
|-------|-------------|
| `setup` | Teacher `StorySetupInput` from the dashboard form |
| `prompt` | `{ system, user }` strings built on the client |
| `provider` | Provider id (non-secret, e.g. `openai`) |
| `model` | Model name (non-secret, e.g. `gpt-4o-mini`) |

## Response body

`StoryGenerationBackendResponse`:

| Field | Description |
|-------|-------------|
| `ok` | Whether generation succeeded |
| `rawText` | Raw JSON story from the AI provider (when `ok`) |
| `errorMessage` | Error detail (when not `ok`) |
| `provider` | Provider used on the server |
| `model` | Model used on the server |

## Server responsibilities

1. Validate the request body (`validateStoryGenerationBackendRequest`).
2. Read **`OPENAI_API_KEY`** from server environment variables.
3. Call the AI provider with `prompt.system` + `prompt.user`.
4. Return `rawText` for the frontend parser to validate and map to `GeneratedStory`.

## Frontend (current)

- The browser **never** calls OpenAI directly.
- `realAiGenerationAdapter` → `requestStoryGenerationFromBackend()` → `POST /api/story-generation`.
- Raw responses are parsed by `parseAiStoryResponseToGeneratedStory()` — AI output is never trusted directly.
- If the backend is unavailable in AI mode, the create flow falls back to mock generation and shows a warning toast.

## Contract sync

If you change request/response shapes in the frontend, update:

- `src/features/story-generation/api/storyGenerationBackend.types.ts`
- `server/api/story-generation/storyGeneration.contract.ts`
- `server/api/story-generation/handleStoryGenerationRequest.ts`

## Platform notes

- **Vite dev** — middleware in `vite.config.ts` (wired)
- **Vercel** — `api/story-generation.ts` imports this handler (wired)
- **Netlify** — `netlify/functions/story-generation.ts`
- **Express** — `app.post('/api/story-generation', ...)`
- **Supabase Edge Functions** — `supabase/functions/story-generation/index.ts`

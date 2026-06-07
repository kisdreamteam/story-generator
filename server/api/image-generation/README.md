# Image Generation API

Server-side handler for single-page story illustrations. The browser never holds provider secrets.

## Routes

| Environment | Entry |
|-------------|-------|
| **Local dev** | Vite middleware in `vite.config.ts` → `POST /api/image-generation` |
| **Vercel** | `api/image-generation.ts` → `POST /api/image-generation` |

Both delegate to `handleImageGenerationRequest.ts`.

## Feature flag (frontend)

```env
VITE_IMAGE_GENERATION_MODE=ai
VITE_IMAGE_PROVIDER=openai
VITE_IMAGE_MODEL=dall-e-3
# Optional override:
# VITE_IMAGE_GENERATION_API_URL=/api/image-generation
```

Default is `mock` — SVG placeholders only. Independent of `VITE_GENERATION_MODE`.

## Server secret (never in the browser)

```env
OPENAI_API_KEY=sk-...
# Or dedicated:
# IMAGE_GENERATION_API_KEY=sk-...
```

## Request body (single page)

`ImageGenerationBackendRequest` — see `imageGeneration.contract.ts`:

| Field | Description |
|-------|-------------|
| `storyId` | Story identifier |
| `pageNumber` | Page being illustrated (one per request) |
| `prompt` | Scene description |
| `continuityReminder` | Nina/Nino outfit and style notes |
| `provider` | Provider id (non-secret, e.g. `openai`) |
| `model` | Model name (non-secret, e.g. `dall-e-3`) |

## Response body

| Field | Description |
|-------|-------------|
| `ok` | Whether generation succeeded |
| `imageUrl` | `data:image/png;base64,...` or HTTPS URL |
| `errorMessage` | Error detail when not `ok` |
| `generatedAt` | ISO timestamp when successful |

## Frontend (current)

- `realImageGenerationAdapter` → `requestImageGenerationFromBackend()` → `POST /api/image-generation`
- `storyPageImageGeneration.service` falls back to mock SVG on provider failure when image mode is `ai`
- Sequential “generate missing” — one API call per page, user-initiated only

## Contract sync

If you change request/response shapes, update:

- `src/features/story-images/api/imageGenerationBackend.types.ts`
- `server/api/image-generation/imageGeneration.contract.ts`
- `server/api/image-generation/handleImageGenerationRequest.ts`

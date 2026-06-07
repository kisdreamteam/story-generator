# Domain 6 — Real Image Generation Plan

**Status:** V1 single-page real generation **implemented** (adapter + `/api/image-generation`). Batch, collage, and cloud storage remain deferred.

This document defines real page illustration architecture. It follows the same server-safe pattern as story text (`/api/story-generation`).

Authoritative ecosystem map: [domain-6-ai-image-ecosystem.md](./domain-6-ai-image-ecosystem.md)  
Real story text QA: [domain-6-real-ai-qa-checklist.md](./domain-6-real-ai-qa-checklist.md)

---

## Current state summary

| Layer | Status |
|-------|--------|
| Story text (`VITE_GENERATION_MODE=ai`) | Wired — `POST /api/story-generation` |
| Image prompts (text planning) | Produced during story generation; editable on story detail |
| Pixel generation (teacher UI) | **Mock default** — SVG placeholders; **real when** `VITE_IMAGE_GENERATION_MODE=ai` |
| `realImageGenerationAdapter` | Wired — single page via `POST /api/image-generation` |
| Mock fallback (AI image mode) | Wired — placeholder on provider failure + warning toast |
| `imageGenerationOrchestrator` | Not connected to story detail UI |
| Cloud image storage | Deferred — `imageUrl` stored on story page fields (data URLs or provider URLs) |

---

## Audit: Image generation files

### Adapter boundary (teacher UI path — canonical for V1)

| File | Role today |
|------|------------|
| `story-images/adapters/resolveImageGenerationAdapter.ts` | Returns mock or real from `VITE_IMAGE_GENERATION_MODE` |
| `story-images/adapters/mockImageGenerationAdapter.ts` | Validates request; returns deterministic SVG `data:` URL after ~400ms delay |
| `story-images/adapters/realImageGenerationAdapter.ts` | POST `/api/image-generation`; throws on provider failure for fallback |
| `story-images/api/imageGenerationBackend.client.ts` | Browser backend client (no secrets) |
| `server/api/image-generation/handleImageGenerationRequest.ts` | OpenAI Images API; returns base64 data URL |
| `api/image-generation.ts` | Vercel serverless route |
| `story-images/adapters/imageGenerationAdapter.types.ts` | `ImageGenerationAdapter` contract: `generateImage({ storyId, pageNumber, prompt, continuityReminder })` |

### Feature service + hooks (what story detail uses)

| File | Role today |
|------|------------|
| `story-images/services/storyPageImageGeneration.service.ts` | `generateStoryPageImage` (single page) and `generateMissingStoryPageImages` (sequential loop) |
| `story-images/hooks/useStoryPageImageGeneration.ts` | UI state: missing count, per-page generating, regenerate, generate missing |
| `story-images/lib/storyPageImageGeneration.utils.ts` | Ready check, prompt resolution, apply image fields to story |
| `story-images/lib/storyImageDisplay.ts` | Display model: ready / placeholder / generating / failed |

### Teacher review UI (no pixel API calls)

| File | Role today |
|------|------------|
| `story-images/components/ImagePromptReviewPanel.tsx` | Per-page prompt + continuity reminder editor |
| `story-images/hooks/useImagePromptReview.ts` | Dirty tracking, reset, apply to story |
| `story-images/lib/imagePromptReview.utils.ts` | Align prompts to pages, patch helpers |

### Illustration controls UI

| File | Role today |
|------|------------|
| `story-images/components/StoryImageGenerationPanel.tsx` | “Generate N missing images”, save illustrations, status chips |
| `story-images/components/StoryImage.tsx` | Renders `<img>` when ready, else placeholder |

Wired from `StoryDetailPage`: prompt review → illustration panel → page list with per-page regenerate.

### Orchestrator path (not teacher UI — future batch/collage)

| File | Role today |
|------|------------|
| `shared/ai/images/imageGenerationOrchestrator.ts` | Job queue; routes SINGLE / BATCH / COLLAGE to provider handlers |
| `shared/ai/images/providers/mockAIImageGenerationProvider.ts` | Returns `PROMPT_ONLY` asset records — no pixels |
| `shared/ai/images/providers/getAIImageGenerationProvider.ts` | Always resolves to mock provider |
| `shared/ai/images/storage/imagePromptPersistence.ts` | Separate `localStorage` records for orchestrator assets (not story detail save path) |
| `shared/ai/images/types/imageGeneration.types.ts` | `ImageGenerationMode`, `ImageAssetRecord`, job types |

**Important:** Story detail does **not** call `enqueueImageGenerationJob`. Two parallel architectures exist; real image work should extend the **adapter + storyPageImageGeneration.service** path first.

### Types and fixtures

| File | Role |
|------|------|
| `stories/types/story.types.ts` | `StoryImagePrompt { pageNumber, prompt, continuityReminder }` |
| `story-images/types/storyImage.types.ts` | `StoryPageImageFields`: `imageUrl`, `imageStatus`, `imageError`, etc. |
| `story-generation/fixtures/aiStoryResponse.fixture.ts` | Sample `imagePrompts[]` in parse fixture |
| `shared/ai/prompts/templates/imagePromptTemplate.ts` | Scene builder used in adapter path (includes “no text overlays”) |

---

## Current mock image flow

```
Story generation (text pipeline)
        │
        ▼
GeneratedStory.imagePrompts[]     ← one { prompt, continuityReminder } per page
        │
        ▼
Story detail — ImagePromptReviewPanel
  • Teacher edits prompts (optional)
  • Save prompts → story storage (saveStoryEditorChanges)
        │
        ▼
StoryImageGenerationPanel / per-page regenerate
        │
        ▼
generateStoryPageImage()
  • resolvePageImagePromptText(page, imagePrompts)
  • resolveImageGenerationAdapter() → mock
  • mockImageGenerationAdapter.generateImage()
        │
        ▼
data:image/svg+xml,... placeholder URL
  • StoryPage.imageStatus = ready
  • StoryPage.imageUrl = data URL
        │
        ▼
Save illustrations → story storage (page fields persisted with story JSON)
        │
        ▼
StoryImage / StoryPages — display img or placeholder
```

### What is real today

- Image **prompt text** from story generation (or teacher edits)
- Per-page status tracking (`none` → `generating` → `ready` | `failed`)
- Sequential “generate missing” over pages without images
- Persisting `imageUrl` on story pages (local storage; cloud when enabled — as part of story payload)
- **Single-page real illustrations** when `VITE_IMAGE_GENERATION_MODE=ai` and server key is set
- **Mock fallback** when real illustration fails (placeholder + warning toast)

### What is not real yet

- Batch orchestrator wired to story detail
- Collage generation or grid review UI
- Dedicated cloud blob/CDN storage for illustration files
- Server-side retry/rate-limit policies (documented only)
- Automated image QA (continuity, no text-in-image lint)

---

## Proposed real image architecture

Mirror the story text boundary: browser sends prompt metadata; server holds secrets and calls the provider.

```
Story detail (unchanged UI)
        │
        ▼
generateStoryPageImage()
  • resolveImageGenerationAdapter() → mock | real
        │
        ├─ mock ──► SVG data URL (current)
        │
        └─ real ──► requestImageGenerationFromBackend()
                        │
                        POST /api/image-generation
                        │
                        handleImageGenerationRequest()
                        │
                        OpenAI Images (dall-e-3, b64_json → data URL)
                        │
                        ▼
              { ok, imageUrl | imageBase64, ... }
                        │
                        ▼
              StoryPage.imageUrl updated → save as today
```

### Server route (implemented)

```
POST /api/image-generation
Content-Type: application/json
```

**Local dev:** Vite middleware forwards to `handleImageGenerationRequest.ts`  
**Vercel:** `api/image-generation.ts`

**Request:**

| Field | Description |
|-------|-------------|
| `storyId` | Story identifier (logging, rate limits) |
| `pageNumber` | Page being illustrated |
| `prompt` | Scene description from `StoryImagePrompt.prompt` |
| `continuityReminder` | Nina/Nino outfit and style notes |
| `provider` | Non-secret id (e.g. `openai`) |
| `model` | Non-secret model name (e.g. `dall-e-3`) |

**Response:**

| Field | Description |
|-------|-------------|
| `ok` | Success flag |
| `imageUrl` | `data:image/png;base64,...` (preferred) or HTTPS URL |
| `errorMessage` | When not `ok` |
| `provider` / `model` / `generatedAt` | Echo / metadata |

Server reads **`IMAGE_GENERATION_API_KEY`** or falls back to **`OPENAI_API_KEY`** — **never** `VITE_*`.

### Client mode flag (implemented)

```env
VITE_IMAGE_GENERATION_MODE=mock   # mock | ai
```

Independent of `VITE_GENERATION_MODE`. Default is `mock`.

`resolveImageGenerationAdapter()` reads `getImageGenerationConfig()` and returns `realImageGenerationAdapter` when `ai`.

### Safe fallback (implemented)

When `VITE_IMAGE_GENERATION_MODE=ai`:

1. `generateStoryPageImage()` tries `realImageGenerationAdapter`
2. On provider/network failure (not validation, not abort): `mockImageGenerationAdapter` placeholder
3. Warning toast: *“Illustration service was unavailable, so a placeholder was used instead.”*
4. Sequential “generate missing” unchanged — one paid call per page, user-initiated only

---

## Domain 6 image boundary rules (locked for V1 implementation)

These apply to the **next coding slice** and until explicitly revised:

| Rule | Rationale |
|------|-----------|
| **No UI redesign** | Use existing `ImagePromptReviewPanel` and `StoryImageGenerationPanel` |
| **No dashboard route changes** | Illustrations stay on story detail |
| **No Supabase schema changes** | Store `imageUrl` on existing story page fields first |
| **No paid provider connection until slice is approved** | This document is plan-only |
| **No batch/collage UI** | SINGLE page path only |
| **No cloud file bucket yet** | Unless story storage already accepts URL strings (it does); large base64 may need size limits |
| **No merging orchestrator into UI prematurely** | Adapter path first; orchestrator for batch later |
| **No `VITE_*` provider secrets** | Same rule as story text |
| **Do not change story text generation** | Image mode is orthogonal |

---

## Continuity requirements for real images

These must be enforced in **server-side prompt assembly** (combining `prompt` + `continuityReminder` + fixed safety suffix) before calling the provider:

| Requirement | Source / enforcement |
|-------------|---------------------|
| Nina is older sister | Append continuity block; server-side template |
| Nino is younger brother | Same |
| Not twins | Same; distinct age appearance in scene |
| Consistent clothing/colors | Nina indigo, Nino emerald green — from `continuityReminder` + server defaults |
| Match story page | `prompt` must describe the scene for that `pageNumber`; optional: include truncated page text server-side |
| English story, no visible text in images | Negative prompt suffix: no speech bubbles, captions, signs, logos, readable writing |
| Child-safe classroom imagery | Safety suffix: warm, age-appropriate, no violence/scary/adult content |
| One image per story page | SINGLE mode only in V1; response mapped to one `pageNumber` |

Reuse wording from `buildStoryGenerationPrompt` image rules and `imagePromptTemplate.ts` (“No text overlays, logos, or unsafe elements”) in the **server handler**, not only in story JSON prompts.

---

## Cost and safety controls

### Generation scope

| Control | V1 behavior | Future |
|---------|-------------|--------|
| Single-page first | `regeneratePageImage(pageNumber)` — one paid call | Default teacher action for real AI |
| Generate missing | Sequential loop; **no parallel 12-call burst** | Optional confirmation when `missingCount > 3` |
| Skip ready pages | `isStoryPageImageReady` — already implemented | Keep |
| Force regenerate | `force: true` on single page only | Teacher-initiated; one call |

### Retry and failure

| Control | Proposal |
|---------|----------|
| Per-page retry | Teacher clicks regenerate again; max 2 auto-retries in job queue if orchestrator used later |
| Adapter failure | Page `imageStatus: failed`, `imageError` message; optional mock fallback |
| Abort | `AbortSignal` already wired in hooks — cancel in-flight fetch |
| No runaway batch | Server: reject requests with `pageNumbers.length > 1` until batch mode is explicitly enabled |

### Accidental 12-image spend prevention

- V1: API accepts **one page per request** only
- Client: `generateMissingStoryPageImages` stays sequential (not `Promise.all`)
- Optional env: `VITE_IMAGE_GENERATION_CONFIRM_THRESHOLD=4` — show confirm dialog before loop (implementation slice; UI copy only, no layout change)
- Server env: `IMAGE_GENERATION_DAILY_CAP` / per-story cap (future ops control)

### Expected environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_IMAGE_GENERATION_MODE=mock\|ai` | Client | Illustration adapter selection (default `mock`) |
| `VITE_IMAGE_GENERATION_API_URL` | Client | Default `/api/image-generation` |
| `VITE_IMAGE_PROVIDER=openai` | Client | Non-secret provider id |
| `VITE_IMAGE_MODEL=dall-e-3` | Client | Non-secret model name |
| `OPENAI_API_KEY` | Server | Shared provider key |
| `IMAGE_GENERATION_API_KEY` | Server | Optional dedicated illustration key |

**Never:** `VITE_OPENAI_API_KEY`, `VITE_IMAGE_API_KEY`, or any secret in the client bundle.

### Future server controls (not implemented)

- `IMAGE_GENERATION_MAX_RETRIES` — auto-retry policy
- `IMAGE_GENERATION_DAILY_CAP` — ops kill switch / budget
- `VITE_IMAGE_GENERATION_CONFIRM_THRESHOLD` — confirm before multi-page generate

---

## Known risks

| Risk | Impact | Mitigation in plan |
|------|--------|-------------------|
| Large base64 URLs in story JSON | localStorage / Supabase row size | Prefer short-lived HTTPS URLs; cap image dimensions; document size limit |
| Provider ignores “no text in image” | Unusable classroom slides | Server negative prompt; manual QA checklist |
| Character drift across pages | Broken series continuity | Strong continuity suffix; per-page regenerate; future reference-image pass |
| 12-page “generate missing” cost | Unexpected bill | Sequential single calls; confirm threshold; server single-page contract |
| Dual architecture confusion | Wrong entry point wired | V1 uses adapter path only; orchestrator documented as Phase 2 |
| No image fallback yet | Failed page blocks teacher | Implement mock fallback with warning in first real slice |
| Story text AI on, images mock | Teacher expectation gap | Independent env flags; clear panel copy (existing) |

---

## Deferred work

- Real pixel provider integration (this plan precedes it)
- `imageGenerationOrchestrator` wired to story detail
- BATCH mode optimization and parallel provider calls
- COLLAGE mode and grid review UI
- Supabase Storage / CDN for illustration assets
- Reference-image / character-sheet continuity (multi-image conditioning)
- Automated image QA (vision model lint for text-in-image, safety)
- `VITE_IMAGE_GENERATION_MODE` config module (implement in slice)
- Image generation metadata on story (`provider`, `model` per page)
- Student mode image delivery optimizations

---

## Recommended next implementation slice

**V1 single-page slice: complete.** Next work:

1. ~~Manual image QA checklist~~ — [domain-6-real-image-qa-checklist.md](./domain-6-real-image-qa-checklist.md)
2. Run manual QA on Vercel before batch/collage
3. Cloud blob storage if story JSON size becomes an issue
4. Server retry/rate limits + optional confirm-before-multi-page dialog

### V1 acceptance criteria (met)

- [x] `VITE_IMAGE_GENERATION_MODE=mock` — unchanged SVG behavior
- [x] `VITE_IMAGE_GENERATION_MODE=ai` + server key — one page returns real image URL
- [x] Missing key — mock fallback + warning toast; app does not crash
- [x] “Generate missing” — sequential single-page API calls
- [x] Saved story persists `imageUrl` as before

---

## Real image QA and cost safety

Manual checklist: [domain-6-real-image-qa-checklist.md](./domain-6-real-image-qa-checklist.md)

Reference scenario: `src/features/story-images/fixtures/realImageQaReferenceScenario.ts`

### Cost safety (verified)

| Control | Location |
|---------|----------|
| One API call per page | `handleImageGenerationRequest` (`n: 1`); one adapter call per `generateStoryPageImage` |
| Sequential multi-page | `generateMissingStoryPageImages` — `for` + `await`, no parallel burst |
| User-initiated only | `StoryImageGenerationPanel` button / per-page regenerate — no auto-run on load |
| Skip ready pages | `isStoryPageImageReady` |

**Cost risk:** “Generate N missing” = N sequential paid calls (max = page count). Confirmation dialog before multi-page generate is **recommended** but **not implemented** (`VITE_IMAGE_GENERATION_CONFIRM_THRESHOLD` reserved).

### Fallback (verified)

| Scenario | Behavior |
|----------|----------|
| Missing `OPENAI_API_KEY` / `IMAGE_GENERATION_API_KEY` | Mock SVG placeholder; warning toast; story detail stable |
| Provider / network error | Same mock fallback via `generateImageWithOptionalFallback` |
| Validation error (empty prompt) | Page `failed` — no mock substitution |
| User abort | Cancelled state; no silent mock |

Toast: **Placeholder illustration used** — *Illustration service was unavailable, so a placeholder was used instead.*

---

## Related docs

- [domain-6-ai-image-ecosystem.md](./domain-6-ai-image-ecosystem.md) — full Domain 6 map
- [domain-6-real-image-qa-checklist.md](./domain-6-real-image-qa-checklist.md) — manual real image QA
- [domain-6-real-ai-qa-checklist.md](./domain-6-real-ai-qa-checklist.md) — story text QA
- [server/api/story-generation/README.md](../server/api/story-generation/README.md) — pattern for server handlers

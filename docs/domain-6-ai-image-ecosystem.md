# Domain 6 — AI + Image Ecosystem

Authoritative map for story text generation, prompt construction, output transformation, image prompt planning, fixtures, and mock/real AI boundaries.

This document is **Domain 6 only**. It does not redefine UI, routing, dashboard flows, classrooms, or other domains. Where older docs overlap (e.g. [story-generation-flow.md](./story-generation-flow.md), [architecture.md](./architecture.md)), treat this file as the source of truth for **AI and image generation architecture**.

---

## Scope

| In scope | Out of scope |
|----------|--------------|
| Story text generation pipeline | Dashboard layout, nav, settings UI |
| Prompt building (story + image) | Story detail / reader UI polish |
| AI response parsing & validation | Classroom assignment flows |
| Mock, fixture, fallback, real-AI boundaries | Supabase auth / storage (except metadata attachment) |
| Image prompt planning & page illustration jobs | Student mode UI |
| Nina & Nino continuity / series memory | Paid API wiring unless already configured |

---

## Teacher unblock path (MVP)

Minimal flow a teacher can complete today without batch orchestrators or real image APIs:

1. **Create** — `/dashboard/create` → confirm setup → generate story + flashcards + image prompts
2. **Auto-save** — persisted story opens on `/dashboard/stories/:id`
3. **Review prompts** — `ImagePromptReviewPanel` on story detail (above illustration controls)
4. **Generate illustrations** — mock SVG placeholders via `StoryImageGenerationPanel`
5. **Save** — prompt edits and illustration URLs persisted to storage

Partial pipeline success (e.g. flashcards or image prompts fail but story text validates) still delivers a usable story.

Mock output respects `setup.pageCount` — a 6-page story yields 6 pages and 6 image prompts.

**Real image generation plan (not implemented):** [domain-6-image-generation-plan.md](./domain-6-image-generation-plan.md)

---

## High-level architecture

Two **teacher-facing generation entry points** share the same underlying contracts but differ in orchestration:

| Entry point | Orchestrator | Primary use |
|-------------|--------------|-------------|
| **Dashboard create flow** | `story-generator/lib/generation/storyGenerationService.ts` → `generateStoryPipeline.ts` | `/dashboard/create` (current product path) |
| **Legacy wizard output** | `story-generation/services/storyGeneration.service.ts` | `/projects/:id/output` (Phase 2B path) |

Both must respect the **server-safe boundary**: the browser never holds provider secrets or calls OpenAI directly in production paths.

```
Teacher setup (StorySetupInput)
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Prompt layer (no network)                                 │
│  • buildStoryGenerationPrompt (structured, dashboard)      │
│  • shared/ai/buildStoryPrompt (contract-based, adapters)   │
│  • storyPrompt.service (legacy StoryGenerationInput)         │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Adapter resolution                                        │
│  resolveAiGenerationAdapter() → mock | real                │
│  (VITE_GENERATION_MODE: mock | fixture | ai)               │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Staged pipeline (dashboard)                               │
│  validate → story → flashcards → imagePrompts → combine    │
│  (generateStoryPipeline.ts)                                │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Output shaping                                            │
│  parsers/parseAiStoryResponse → StoryResponseContract      │
│  aiStoryOutputMapping → GeneratedStoryOutput               │
│  validateGeneratedStoryOutput / validateStoryOutput        │
└───────────────────────────────────────────────────────────┘
        │
        ▼
   Persisted story (pages, flashcards, imagePrompts)

        │  (later, on story detail — illustration phase)
        ▼
┌───────────────────────────────────────────────────────────┐
│  Page illustration                                         │
│  story-images/services/storyPageImageGeneration.service    │
│  resolveImageGenerationAdapter() → mock | real             │
└───────────────────────────────────────────────────────────┘
```

---

## Where things live (audit map)

### Story text generation orchestration

| Concern | Location |
|---------|----------|
| Dashboard orchestrator | `src/features/story-generator/lib/generation/storyGenerationService.ts` |
| Staged pipeline (validate/story/flashcards/imagePrompts/combine) | `src/features/story-generation/generateStoryPipeline.ts` |
| Legacy monolithic orchestrator | `src/features/story-generation/services/storyGeneration.service.ts` |
| Generation recovery & session | `src/features/story-generation/generationRecovery.ts`, `generationSessionStorage.ts` |
| Progress reporting | `src/features/story-generation/generationProgress.ts` |
| Env mode (`mock` / `fixture` / `ai`) | `src/shared/config/generationConfig.ts` |

### Prompt construction

| Layer | Location | Used by |
|-------|----------|---------|
| **Structured dashboard prompt** | `src/features/story-generation/prompts/buildStoryGenerationPrompt.ts` | Dashboard pipeline metadata; Nina & Nino rules inline |
| **Contract-based prompts (canonical for adapters)** | `src/shared/ai/prompts/builders/buildStoryPrompt.ts` | `AIProvider` adapters via `buildAIPromptContract` |
| **Legacy wizard prompt** | `src/features/story-generation/services/storyPrompt.service.ts` | Legacy `generateStoryOutput` + backend request shape |
| **Prompt contract builder** | `src/shared/ai/builders/buildAIPromptContract.ts` | Normalizes `StorySetupInput` → sections for prompts |
| **Templates** | `src/shared/ai/prompts/templates/` | System/user/output/image templates |
| **Continuity injectors** | `src/shared/ai/prompts/continuity/` | Character, series, vocabulary lines |

**Note:** Three prompt builders coexist for historical reasons. **Do not merge without a dedicated refactor.** New AI work should prefer:

1. `buildAIPromptContract` + `shared/ai/prompts/builders/buildStoryPrompt` for adapter-facing generation
2. `buildStoryGenerationPrompt` when dashboard structured metadata is required
3. `storyPrompt.service` only for legacy output page maintenance

### Generated output transformation

| Step | Location |
|------|----------|
| Raw AI text → JSON extract | `src/features/story-generation/parsers/normalizeRawAiStoryPayload.ts` |
| Parse + validate contract | `src/features/story-generation/parsers/parseAiStoryResponse.ts` |
| Legacy parse service | `src/features/story-generation/services/parseAiStoryResponse.service.ts` |
| Response contract normalization | `src/features/story-generator/lib/generation/contracts/storyResponseContract.ts` |
| Contract validation | `src/features/story-generator/lib/generation/contracts/validation.ts` |
| AI → app output mapping | `src/features/story-generator/lib/generation/adapters/aiStoryOutputMapping.ts` |
| Legacy output validation | `src/features/story-generation/services/validateStoryOutput.service.ts` |
| Generation metadata attachment | `src/shared/ai/metadata/buildStoryGenerationMetadata.ts` |

### Image prompt generation (text planning, not pixels)

| Concern | Location |
|---------|----------|
| Per-page prompt builder | `src/shared/ai/prompts/builders/buildImagePrompt.ts` |
| Image prompt requirements in structured prompt | `buildImagePromptRequirements()` in `buildStoryGenerationPrompt.ts` |
| Adapter stage `generateImagePrompts` | `createStoryGenerationApi.ts` → `AIProvider.generateImagePrompts` |
| Mock image prompt fixtures | `src/shared/ai/providers/mock/mockStoryFixture.ts` (`getMockAIImagePrompts`) |
| Prompt persistence model | `src/shared/ai/images/storage/imagePromptPersistence.ts` |
| Story domain fields | `GeneratedStory.imagePrompts[]` (`StoryImagePrompt` in `stories/types`) |

### Page illustration (pixels)

| Concern | Location |
|---------|----------|
| Teacher-facing page image service | `src/features/story-images/services/storyPageImageGeneration.service.ts` |
| Adapter resolution | `src/features/story-images/adapters/resolveImageGenerationAdapter.ts` |
| Mock / real illustration adapters | `mockImageGenerationAdapter.ts`, `realImageGenerationAdapter.ts` |
| Batch job orchestrator (AI-side) | `src/shared/ai/images/imageGenerationOrchestrator.ts` |
| Job modes: single / batch / collage | `src/shared/ai/images/types/imageGeneration.types.ts` |
| Mock image provider | `src/shared/ai/images/providers/mockAIImageGenerationProvider.ts` |

### Fixtures & mock data

| Asset | Location |
|-------|----------|
| Dashboard mock story fixture | `src/shared/ai/providers/mock/mockStoryFixture.ts` |
| Real AI QA reference setup | `src/features/story-generation/fixtures/realAiQaReferenceSetup.ts` |
| Real image QA reference scenario | `src/features/story-images/fixtures/realImageQaReferenceScenario.ts` |
| Legacy market mock pages | `src/features/story-generation/services/mockStoryData.ts` |
| AI response parse fixture | `src/features/story-generation/fixtures/aiStoryResponse.fixture.ts` |
| Fixture loader | `src/features/story-generation/services/aiStoryResponseFixture.service.ts` |
| Mock AI provider (adapter boundary) | `src/shared/lib/ai/mockProvider.ts` |
| Generation adapters | `src/features/story-generation/adapters/mockAiGenerationAdapter.ts`, `realAiGenerationAdapter.ts` |

### Continuity & series memory

| Concern | Location |
|---------|----------|
| Series profile model | `src/features/story-continuity/models/seriesProfile.model.ts` |
| Profile resolution (existing vs new series) | `src/features/story-continuity/lib/resolveSeriesProfile.ts` |
| Local profile storage | `src/features/story-continuity/lib/seriesProfileStorage.ts` |
| Continuity context builder | `src/features/story-continuity/lib/buildContinuityContext.ts` |
| Prompt continuity lines | `src/shared/ai/prompts/continuity/characterContinuity.ts`, `seriesContinuity.ts`, `vocabularyContinuity.ts` |
| Nina & Nino catalog defaults | `src/features/series/services/series.service.ts` |
| Dashboard Nina & Nino rules (inline) | `buildStoryGenerationPrompt.ts` (`NINA_NINO_CONTINUITY_RULES`, visual style notes) |

### Server boundary (Vercel + dev middleware)

| Piece | Location |
|-------|----------|
| API contract | `server/api/story-generation/storyGeneration.contract.ts` |
| Shared handler | `server/api/story-generation/handleStoryGenerationRequest.ts` |
| Vercel serverless route | `api/story-generation.ts` |
| Vite dev middleware | `vite.config.ts` (`storyGenerationApiPlaceholderPlugin`) |
| Frontend client | `src/features/story-generation/api/storyGenerationBackend.client.ts` |
| Legacy request wrapper | `src/features/story-generation/services/requestAiStoryGeneration.ts` |

---

## Current AI generation flow (dashboard — canonical path)

1. **Setup** — `StorySetupInput` collected in create flow.
2. **Orchestration** — `runStoryGeneration()` in `storyGenerationService.ts` resolves adapter via `resolveAiGenerationAdapter()`.
3. **Pipeline stages** (`generateStoryPipeline.ts`):
   - `validate` — adapter validates setup
   - `story` — core pages + metadata
   - `flashcards` — vocabulary cards (recoverable failure → partial output)
   - `imagePrompts` — one text prompt per page (recoverable failure → partial output)
   - `combine` — maps to `GeneratedStoryOutput`
4. **Recovery** — checkpoints persisted per stage; resume/retry skips completed stages.
5. **Metadata** — `buildStoryGenerationMetadataFromSetup` records provider, model, prompt version.
6. **Persistence** — story saved via story-storage; UI reads `GeneratedStory`.

Environment knob: `VITE_GENERATION_MODE=mock|fixture|ai` (see `generationConfig.ts`). Legacy flags `VITE_AI_GENERATION_ENABLED` / `VITE_AI_FIXTURE_MODE` still work when mode is unset.

---

## Mock vs real AI boundary

**Text and images are independent.** `VITE_GENERATION_MODE=ai` enables real story text; `VITE_IMAGE_GENERATION_MODE=ai` enables real single-page illustrations via `/api/image-generation`.

| Mode | Story adapter | Image adapter | Network |
|------|---------------|---------------|---------|
| **mock** (default) | `mockAiGenerationAdapter` | `mockImageGenerationAdapter` | None |
| **fixture** | Real adapter path with fixture JSON injected | Mock images | None (fixture file) |
| **ai** (story) | `realAiGenerationAdapter` → `/api/story-generation` | Mock unless `VITE_IMAGE_GENERATION_MODE=ai` | Story text API |
| **ai** (images) | Unchanged | `realImageGenerationAdapter` → `/api/image-generation` | One request per page |

Rules:

- **No `VITE_OPENAI_API_KEY` in production UI paths** — keys belong in server env (`server/api/story-generation/`).
- **Mock is not an error state** — it is the default dev/demo path.
- **Fallback** (legacy path): if AI enabled and parse/validation fails, `storyGeneration.service.ts` returns mock backup with `generationMode: fallback`.
- **Adapter fallback** (dashboard path): if `GenerationMode.AI` adapter throws, `storyGenerationService.ts` retries with `getMockAiGenerationAdapter()`.

Provider interface: `src/shared/lib/ai/AIProvider.ts` (validate, generateStory, generateFlashcards, generateImagePrompts).

---

## Image prompt planning flow

Image generation is **two-phase**:

### Phase A — Text planning (during story generation)

Included in the same AI job as story pages (pipeline stage `imagePrompts`):

- Output: `imagePrompts[]` with `{ pageNumber, prompt, continuityReminder }`
- Requirements enforced in prompt: exactly **N prompts for N pages** (supports 4–12 pages; default setup often uses 12)
- Continuity reminders must reference Nina/Nino outfits, props, and art style
- Builders: `buildImagePromptFromContract`, `buildImagePromptRequirements`

### Phase B — Pixel generation (after story is saved)

Triggered from story detail (UI not documented here):

- Service: `generateStoryPageImage` / `generateMissingStoryPageImages`
- Reads stored `imagePrompts` + page text via `resolvePageImagePromptText`
- Calls `resolveImageGenerationAdapter()` — mock by default; real when `VITE_IMAGE_GENERATION_MODE=ai`
- Updates `StoryPage` image fields: `imageStatus`, `imageUrl`, `imageError`

**Planned real wiring:** see [domain-6-image-generation-plan.md](./domain-6-image-generation-plan.md) (`/api/image-generation`, `VITE_IMAGE_GENERATION_MODE`, single-page first).

**AI-side batch orchestration** (not wired to all UI yet): `shared/ai/images/imageGenerationOrchestrator.ts` supports:

| Mode | Purpose |
|------|---------|
| `SINGLE` | One page illustration |
| `BATCH` | Sequential multi-page generation (12-page storyboard) |
| `COLLAGE` | Reserved — multi-page layout in one asset |

Jobs use `createGenerationJobQueue` with retry/state machine shared with text generation jobs.

---

## Storyboard review concept (MVP)

The teacher-facing storyboard is **one prompt per page**, not a grid orchestrator:

| Concept | Implementation |
|---------|----------------|
| Prompt planning | Pipeline stage `imagePrompts` during story generation |
| Review surface | `ImagePromptReviewPanel` + `useImagePromptReview` on story detail |
| Per-page fields | `prompt` (scene) + `continuityReminder` (Nina/Nino outfits, style) |
| Order | Review prompts **before** `StoryImageGenerationPanel` on story detail |
| Save | `handleSaveImagePrompts` → `saveStoryEditorChanges` |

**Deferred:** `imageGenerationOrchestrator` batch/COLLAGE jobs, dedicated grid UI, real pixel generation.

---

## 12-image storyboard — AI-side architecture (no UI)

For a 12-page Nina & Nino story:

1. **Prompt planning (single story job)**
   - `buildImagePromptRequirements(12)` → `promptsPerPage: 12`
   - Structured prompt requires exactly 12 `imagePrompts` in JSON output
   - Each prompt: scene description + `continuityReminder`

2. **Review surface (data model, not UI spec)**
   - Teachers edit prompts via `ImagePromptReviewPanel` data hooks (`useImagePromptReview`)
   - Baseline vs edited prompts tracked before save
   - Persisted on `GeneratedStory.imagePrompts`

3. **Batch illustration generation (orchestrator)**
   ```
   ImageGenerationJobInput {
     storyId,
     mode: BATCH,
     pageNumbers: [1..12],
     prompts: ImagePromptRecord[]
   }
   → imageGenerationOrchestrator.enqueueImageGenerationJob
   → provider.generateBatch(context, prompts)
   → upsertImageAssetRecords(storyId, assets)
   ```
   - Per-asset status: `PROMPT_ONLY | QUEUED | RUNNING | GENERATED | FAILED`
   - Failed pages do not block ready pages (matches story detail partial-ready UX)

4. **Ordering & idempotency**
   - `buildImageGenerationInputKey` dedupes jobs per story + page set
   - Page-level skip when `isStoryPageImageReady` (force regenerate bypasses)

---

## Nina & Nino continuity rules

Hard rules applied across prompt builders:

| Rule | Source |
|------|--------|
| Nina = older sibling; Nino = younger sibling | `buildStoryGenerationPrompt`, `storyPrompt.service`, series catalog |
| Not twins — distinct ages | All continuity builders |
| Nina wears indigo; Nino wears emerald green | `NINA_NINO_VISUAL_STYLE_NOTES`, `ninaNinoSeries.visualContinuityNotes` |
| Warm watercolor illustration style | Series catalog + image prompt reminders |
| Safe, classroom-appropriate tone | Safety instructions in prompt builders |
| Vocabulary repetition | `vocabularyContinuity.ts`, flashcard rules |

Series catalog: `src/features/series/services/series.service.ts` (`ninaNinoSeries`).

**At generation time (dashboard):** `buildStoryGenerationPrompt` calls `resolveSeriesProfile({ mode: EXISTING, seriesId: 'nina-nino' })` and merges catalog character roles, appearance notes, and recurring rules into the structured prompt. Teacher `setup.characters` and vocabulary fields override when provided. No series-continuity UI yet — catalog + setup only.

---

## Continuity / context strategy

### Layers of memory

```
┌─────────────────────────────────────────────────────────┐
│ 1. Series catalog (static)                               │
│    ninaNinoSeries — characters, visual notes, tone       │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ 2. Series profile (localStorage, per-series)             │
│    seriesProfileStorage — editable bible for EXISTING    │
│    or NEW series modes                                   │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ 3. Teacher setup (per story)                             │
│    characters, vocabulary, lesson goal, main events      │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ 4. Vocabulary memory (optional prompt injection)          │
│    AIVocabularyMemoryContext — words from prior stories  │
└─────────────────────────────────────────────────────────┘
```

### Modes (`SeriesContinuityMode`)

| Mode | Behavior |
|------|----------|
| **EXISTING** | Load profile from `seriesProfileStorage` or catalog; inject summary into prompts |
| **NEW** | Establish series bible; prompt asks model to define reusable rules |

Resolution entry: `resolveSeriesProfile({ mode, seriesId })` in `story-continuity`.

Prompt injection path:

```
StorySetupInput
  → buildAIPromptContract
  → resolveStoryPromptContext (series + character + vocabulary lines)
  → buildStoryPrompt / buildImagePromptFromContract
```

Hook for UI continuity state (future): `useSeriesContinuity` in `story-continuity`.

### Vocabulary progression

- `buildVocabularyContinuityLines` merges teacher `wordsToInclude` with optional memory context
- Flashcard stage enforces example sentences from story text
- Words to avoid are excluded from flashcards and called out in prompts

---

## Known architectural tensions (documented, not refactored)

1. **Dual orchestrators** — legacy `generateStoryOutput` vs dashboard pipeline. Keep behavior aligned; do not add a third path.
2. **Triple prompt builders** — consolidate only in a planned refactor; use adapter path for new work.
3. **Dual AI package roots** — `shared/lib/ai` (provider interface) wraps `shared/ai` (ecosystem). `mockAIProvider` delegates to `shared/ai/providers/mock`.
4. **Image orchestrator vs feature service** — `imageGenerationOrchestrator` (batch jobs) vs `storyPageImageGeneration.service` (page-by-page). UI currently uses the feature service; orchestrator is ready for batch/review workflows.

---

## Environment reference

```env
# Primary mode switch (preferred) — story text
VITE_GENERATION_MODE=mock   # mock | fixture | ai

# Illustration mode — independent of story text (default mock)
VITE_IMAGE_GENERATION_MODE=mock   # mock | ai
# VITE_IMAGE_GENERATION_API_URL=/api/image-generation
# VITE_IMAGE_PROVIDER=openai
# VITE_IMAGE_MODEL=dall-e-3

# Legacy (used when GENERATION_MODE unset)
VITE_AI_GENERATION_ENABLED=false
VITE_AI_FIXTURE_MODE=false

# Non-secret config (safe in frontend)
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4o-mini
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_STORY_PROMPT_VERSION=v1
VITE_STORY_GENERATION_API_URL=/api/story-generation
```

**Do not add new paid API connections in this domain until backend route is deployed and env is explicitly set to `ai`.**

---

## Real story text generation on Vercel

Story text generation uses a **server-safe boundary**: the browser builds prompts and POSTs to `/api/story-generation`; the Vercel function calls OpenAI with `OPENAI_API_KEY` and returns raw JSON for client-side parsing.

```
Teacher setup (StorySetupInput)
        │
        ▼
buildStoryGenerationPrompt()          ← client, no secrets
        │
        ▼
realAiGenerationAdapter
  → requestStoryGenerationFromBackend()
  → POST /api/story-generation
        │
        ▼
api/story-generation.ts (Vercel)      ← or Vite dev middleware locally
  → handleStoryGenerationRequest()
  → OpenAI chat/completions (JSON mode)
        │
        ▼
parseAiStoryResponseToGeneratedStory() ← client validates; never trusts raw AI
        │
        ▼
generateStoryPipeline (flashcards + image prompts from same cached response)
```

### Required environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_GENERATION_MODE=ai` | Vercel **Project → Environment Variables** (build + runtime for client bundle) | Enables `realAiGenerationAdapter` in the browser |
| `OPENAI_API_KEY` | Vercel **server only** — never `VITE_*` | OpenAI auth in `handleStoryGenerationRequest` |
| `VITE_AI_PROVIDER=openai` | Client (optional) | Provider id forwarded in request body |
| `VITE_AI_MODEL=gpt-4o-mini` | Client (optional) | Model name forwarded in request body |
| `VITE_STORY_GENERATION_API_URL` | Client (optional) | Defaults to `/api/story-generation` |

**Never** set `VITE_OPENAI_API_KEY` or any provider secret with a `VITE_` prefix.

Local dev: copy `.env.example` → `.env`, set `VITE_GENERATION_MODE=ai` and `OPENAI_API_KEY`. Vite middleware serves the same handler at `POST /api/story-generation`.

### Mock vs AI behavior

| `VITE_GENERATION_MODE` | Story text | Illustrations | Backend call |
|------------------------|------------|---------------|--------------|
| `mock` (default) | `mockAiGenerationAdapter` | Mock SVG | None |
| `fixture` | Fixture JSON path | Mock SVG | None |
| `ai` | `realAiGenerationAdapter` → `/api/story-generation` | Mock SVG (unchanged) | Yes, when key is set |

Text and images are **independent**. `VITE_GENERATION_MODE=ai` does not enable real pixel generation.

### Fallback behavior (AI mode)

If real AI fails (network, missing key, OpenAI error, parse/validation failure after a bad response), the dashboard path **does not crash**:

1. `storyGenerationService.ts` → `generateWithOptionalAiFallback()` catches non-abort errors
2. Retries the full pipeline with `getMockAiGenerationAdapter()`
3. `useStoryGenerationFlow` shows `generationSucceededWithFallback` toast when metadata shows `provider: mock` after an AI-mode run

Aborts and recovery errors (partial output, user cancel) are **not** silently replaced with mock.

### Known failure modes

| Symptom | Likely cause | User-visible behavior |
|---------|--------------|------------------------|
| Mock story after AI attempt | Backend unreachable, missing `OPENAI_API_KEY`, OpenAI 4xx/5xx, empty response | Story still generates; fallback toast |
| `503` from `/api/story-generation` | No key or provider error | Fallback to mock in create flow |
| `405` | Non-POST request | Error (no fallback) |
| Parse/validation error on `rawText` | Model returned invalid JSON or wrong page count | `StoryGenerationApiError` → mock fallback |
| SPA instead of API response | `vercel.json` rewrite catching `/api/*` | Fixed: rewrite excludes `api/` prefix |

### Deferred (not in this slice)

- **Batch orchestrator UI wiring** — `imageGenerationOrchestrator` BATCH mode
- **Collage review** — COLLAGE job mode reserved; no grid orchestrator UI
- **Cloud blob storage** — large base64 URLs stored in story JSON for now
- **Server retry/rate limits** — documented in image generation plan

---

## Real output QA and continuity validation

Manual checklist: [domain-6-real-ai-qa-checklist.md](./domain-6-real-ai-qa-checklist.md)

Reference test setup: `src/features/story-generation/fixtures/realAiQaReferenceSetup.ts`

### Validation pipeline (automated contract checks)

Real AI output passes through these gates before the teacher sees it:

| Stage | Location | What it enforces |
|-------|----------|------------------|
| Backend response | `handleStoryGenerationRequest` | Non-empty JSON text from OpenAI |
| Parse + normalize | `parseAiStoryResponseToGeneratedStory` | Extract JSON; map fields to contract |
| Page count | Same parser (`expectedPageCount`) | `storyPages.length === setup.pageCount` |
| Contract validation | `validateGeneratedStory` | Required fields on pages, flashcards, image prompts |
| Pipeline output | `validateGeneratedStoryOutput` | Final assembled `GeneratedStoryOutput` |

Prompt-level rules (not programmatically enforced) cover Nina/Nino roles, reading level, flashcard-story alignment, and no text in image prompts — see `buildStoryGenerationPrompt.ts`.

### Continuity validation rules (manual QA)

| Rule | Prompt source | How to verify |
|------|---------------|---------------|
| Nina = older sister | `NINA_NINO_CONTINUITY_RULES`, system prompt | Story roles and image prompt reminders |
| Nino = younger brother | Same | Nino learns/follows; not peer-equal with Nina |
| Not twins | Same + visual style notes | No twin language; distinct age cues |
| Indigo / emerald outfits | `NINA_NINO_VISUAL_STYLE_NOTES` | Image prompt `continuityReminder` fields |
| Watercolor style | Same | Consistent across all page prompts |
| English default | `setup.language` in user prompt + system | Story text matches selected language |
| No text in artwork | `buildImagePromptRequirements` | Prompts omit bubbles, captions, readable signs |

### Known risks (real AI mode)

| Risk | Mitigation today | Future |
|------|------------------|--------|
| Model returns wrong page count | Parser rejects → mock fallback | Retry with stricter prompt or repair pass |
| Weak Nina/Nino age distinction | Prompt rules; manual QA | Continuity scoring or post-parse lint |
| Flashcard sentence not in story | Prompt rules; manual QA | Automated substring check (optional) |
| Image prompts request on-image text | Prompt rules; manual QA | Post-parse filter for bubble/caption keywords |
| OpenAI outage or rate limit | Mock fallback + warning toast | Retry/backoff in server handler |
| Teacher thinks fallback is real AI | Toast + metadata `provider: mock` | UI badge on detail (Domain 7) |
| Long generations timeout | `withGenerationTimeout` + recovery session | Configurable timeout per age/page count |

### What to test on Vercel

1. Reference setup from `realAiQaReferenceSetup.ts` → generate → full QA checklist pass
2. API route returns JSON, not SPA HTML
3. Missing key → fallback without crash
4. Network tab: browser never calls `api.openai.com` directly
5. After prompt changes: re-run checklist on preview deploy before production

### Deferred to later Domain 6 phases

- Automated QA tests (no test runner in repo yet; fixture + manual checklist preferred)
- Real pixel generation batch path via orchestrator
- Batch storyboard orchestrator and collage review
- Flashcard–story substring validation in parser
- Multi-language generation QA (KR/VI) beyond English-first V1
- Provider retry/backoff and structured error telemetry

---

## Real image QA and cost safety

Manual checklist: [domain-6-real-image-qa-checklist.md](./domain-6-real-image-qa-checklist.md)

Reference scenario: `src/features/story-images/fixtures/realImageQaReferenceScenario.ts`

### Illustration validation (manual)

Real pixels are not contract-validated like story JSON. QA covers scene match, Nina/Nino continuity, no text in artwork, classroom safety, fallback, and save behavior.

### Cost safety summary

- **One request per page** — server and client enforce single-page calls
- **Sequential “Generate missing”** — no automatic 12-image parallel generation
- **Explicit teacher action** — illustrations never generate on story load or after text generation
- **Risk:** A 12-page “Generate missing” click = up to 12 sequential API calls; future confirm dialog recommended before batch work

### Image fallback summary

When `VITE_IMAGE_GENERATION_MODE=ai` and the provider fails: mock SVG placeholder, warning toast, page status **Ready**, save still works.

---

## Related docs

- [domain-6-image-generation-plan.md](./domain-6-image-generation-plan.md) — real pixel generation architecture
- [domain-6-real-image-qa-checklist.md](./domain-6-real-image-qa-checklist.md) — manual real image QA
- [domain-6-real-ai-qa-checklist.md](./domain-6-real-ai-qa-checklist.md) — manual real AI output QA
- [story-generation-flow.md](./story-generation-flow.md) — legacy flow detail
- [phase-2b-ai-checklist.md](./phase-2b-ai-checklist.md) — fixture/mock testing
- [phase-5-progress.md](./phase-5-progress.md) — dashboard generation integration
- [architecture.md](./architecture.md) — app-wide tier rules (Domain 6 extends, does not replace)

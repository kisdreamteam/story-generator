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
| Legacy market mock pages | `src/features/story-generation/services/mockStoryData.ts` |
| AI response fixture (library theme) | `src/features/story-generation/fixtures/aiStoryResponse.fixture.ts` |
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

### Server boundary (placeholder)

| Piece | Location |
|-------|----------|
| API contract | `server/api/story-generation/storyGeneration.contract.ts` |
| Handler sketch | `server/api/story-generation/handleStoryGenerationRequest.ts` |
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

| Mode | Story adapter | Image adapter | Network |
|------|---------------|---------------|---------|
| **mock** (default) | `mockAiGenerationAdapter` → `mockAIProvider` | `mockImageGenerationAdapter` | None |
| **fixture** | Real adapter path with fixture JSON injected | Mock images | None (fixture file) |
| **ai** | `realAiGenerationAdapter` | `realImageGenerationAdapter` | Backend `/api/story-generation` when deployed; OpenAI only on server |

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
- Calls `resolveImageGenerationAdapter()` (mock by default)
- Updates `StoryPage` image fields: `imageStatus`, `imageUrl`, `imageError`

**AI-side batch orchestration** (not wired to all UI yet): `shared/ai/images/imageGenerationOrchestrator.ts` supports:

| Mode | Purpose |
|------|---------|
| `SINGLE` | One page illustration |
| `BATCH` | Sequential multi-page generation (12-page storyboard) |
| `COLLAGE` | Reserved — multi-page layout in one asset |

Jobs use `createGenerationJobQueue` with retry/state machine shared with text generation jobs.

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
# Primary mode switch (preferred)
VITE_GENERATION_MODE=mock   # mock | fixture | ai

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

## Related docs

- [story-generation-flow.md](./story-generation-flow.md) — legacy flow detail
- [phase-2b-ai-checklist.md](./phase-2b-ai-checklist.md) — fixture/mock testing
- [phase-5-progress.md](./phase-5-progress.md) — dashboard generation integration
- [architecture.md](./architecture.md) — app-wide tier rules (Domain 6 extends, does not replace)

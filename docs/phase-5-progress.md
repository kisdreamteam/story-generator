# Phase 5 — Progress

Real AI generation and provider integration for the Nina & Nino **dashboard** create-story flow.

**Phase 5 is complete through 5.10.**

---

## 1. End-to-end flow (Phase 5.10)

```
Create Story UI
↓
useGenerationStore          (status, errors, progress)
↓
useStoryGenerationFlow      (page hook orchestration)
↓
storyGenerationService      (queue, limits, validation, usage)
↓
StoryGenerationProvider     (mock | OpenAI)
↓
imageGenerationService      (illustration prompts)
↓
contracts validation        (validateGeneratedStoryOutput)
↓
persistGeneratedStory       (story-storage via saveDraft)
↓
/dashboard/stories/:id      (StoryDetailPage)
```

**Failure recovery**

- AI mode errors → mock fallback inside `storyGenerationService`
- Invalid provider output → validation error → same AI fallback path
- Cancelled generation → no save, no error spam
- Save failure after successful generation → preview remains; user can retry save

**Persistence** still uses Phase 4 storage (`story-storage.ts` → resolver → local | supabase). Generation layers do not bypass storage.

---

## 2. Architecture boundaries

### UI layer

| Rule | Detail |
|------|--------|
| Entry | Pages/hooks call `generateStory()` or `useStoryGenerationFlow()` only |
| State | `useGenerationStore` for loading/errors — no duplicate local flags |
| No providers | Components never import `mockStoryGenerationProvider`, OpenAI, or prompt templates |

### Story generation

| Module | Responsibility |
|--------|----------------|
| `lib/generation/storyGenerationService.ts` | Public API: `generateStory()`, `cancelStoryGeneration()` |
| `lib/generation/storyGenerationProvider.ts` | Interface: story text + flashcards |
| `lib/generation/mockStoryGenerationProvider.ts` | Mock story provider |
| `lib/generation/providers/openAIStoryGenerationProvider.ts` | OpenAI story provider (dynamic import in AI mode) |
| `lib/generation/runtime/` | Queue, abort, session (anti-spam, cancel) |
| `lib/generation/contracts/` | Prompt/response contracts + validation |
| `lib/generation/validateGeneratedStoryOutput.ts` | Output validation before return |
| `lib/generation/persistGeneratedStory.ts` | Build project + save (no UI) |

### Image generation (separate boundary)

| Module | Responsibility |
|--------|----------------|
| `lib/image-generation/imageGenerationService.ts` | `generateImagePrompts()`, `generateImages()` |
| `lib/image-generation/mockImageGenerationProvider.ts` | Mock prompts (active) |

Story providers **do not** implement image methods. OpenAI seeds prompts into the image boundary after parsing.

### Configuration & prompts

| Module | Responsibility |
|--------|----------------|
| `shared/config/` | `getGenerationMode()`, `isAIEnabled()` |
| `prompts/` | Versioned templates (`v1`), `getActivePromptVersion()` |

Providers consume prompt files — prompt strings do not live in provider files.

### Usage

| Module | Responsibility |
|--------|----------------|
| `lib/usage/` | Local `canGenerate()`, `recordGeneration()` |

---

## 3. Generation modes

| Env | Mode | Story provider | Notes |
|-----|------|----------------|-------|
| `VITE_GENERATION_MODE=mock` (default) | MOCK | Mock | Unchanged sample story |
| `VITE_GENERATION_MODE=ai` | AI | OpenAI → mock fallback | Requires `VITE_OPENAI_API_KEY` |
| `VITE_GENERATION_MODE=fixture` | FIXTURE | Mock | Fixture provider not wired yet |

| Env | Purpose |
|-----|---------|
| `VITE_STORY_PROMPT_VERSION=v1` | Prompt template version (default `v1`) |

---

## 4. Completed phases (summary)

| Phase | Deliverable |
|-------|-------------|
| **5.1** | Story generation provider boundary + mock provider |
| **5.2** | `shared/config` — `getGenerationMode()` |
| **5.3** | AI contracts + runtime validation |
| **5.4** | OpenAI provider + mock fallback |
| **5.5** | `useGenerationStore` |
| **5.6** | Generation queue + cancellation |
| **5.7** | Local usage tracking + limits |
| **5.8** | Image generation boundary |
| **5.9** | Prompt versioning (`prompts/v1`) |
| **5.10** | Full flow integration — validate → save → story detail route |

---

## 5. Key files (Phase 5.10)

| File | Role |
|------|------|
| `hooks/useStoryGenerationFlow.ts` | Generate + persist + navigate orchestration |
| `hooks/useCreateStoryPageState.ts` | Create page wiring |
| `lib/generation/storyGenerationService.ts` | Central generation orchestration |
| `lib/generation/persistGeneratedStory.ts` | Save generated output |
| `lib/generation/validateGeneratedStoryOutput.ts` | Contract validation gate |
| `stores/useGenerationStore.ts` | Generation UI state |

---

## 6. What is not connected yet

- Fixture story provider (`GenerationMode.FIXTURE`)
- Server-side API proxy for OpenAI (keys in Vite env today)
- Real image asset generation (`generateImages()` returns placeholders)
- Automatic local → cloud story migration (Phase 4.13 covers optional copy)

---

## 7. Suggested next work

- **Phase 6** — Server/API proxy for OpenAI; real image provider
- **Legacy wizard** — separate module under `features/story-generation/` (see [story-generation-flow.md](./story-generation-flow.md))

---

## Related docs

- [phase-4-progress.md](./phase-4-progress.md) — Supabase storage, auth, migration
- [story-generation-flow.md](./story-generation-flow.md) — Legacy wizard flow (unchanged)

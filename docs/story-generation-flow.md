# Story Generation Flow

End-to-end contract for mock, fixture, fallback, and future backend AI story generation (Phase 2B).

## Server-safe boundary

**The frontend must not call an AI provider directly.** Secret keys belong on a server/API.

### Frontend (this app)

```
StoryGenerationInput
  → buildStoryPrompt(input)
  → requestAiStoryGeneration({ prompt, input, provider, requestedModel })
  → parseAiStoryResponse(rawText)
  → validateStoryOutput(parsed)
  → display or fallback to mock
```

### Server/API (placeholder)

```
server/api/story-generation/
  README.md
  storyGeneration.contract.ts
```

Suggested route: **`POST /api/story-generation`**

```
Receives AiStoryGenerationApiRequest
  → calls AI provider with secret server-side key
  → returns AiStoryGenerationApiResponse { ok, rawText, errorMessage, provider, model }
```

No runnable server exists yet. See [phase-2b-ai-checklist.md](./phase-2b-ai-checklist.md) for what to wire up before real AI.

---

## Generation modes

| Mode | Env / trigger | What happens | Teacher sees |
|------|---------------|--------------|--------------|
| **Mock** | `VITE_AI_GENERATION_ENABLED=false` (default) | Local mock data from `mockStoryData.ts` | **Mock Story** badge |
| **Fixture** | AI enabled + `VITE_AI_FIXTURE_MODE=true` | Fixture JSON → parse → validate | **AI Generated** badge (library story) |
| **Fallback** | AI enabled, fixture off, no backend (or parse/validation fails) | Mock backup + error metadata | **Fallback Story** badge + calm notice |
| **Future backend** | AI enabled, fixture off, backend deployed | Real `POST /api/story-generation` | **AI Generated** badge |

Fallback protects the teacher experience: if AI fails, a safe backup story is always shown. Technical details (`lastAiError`, `fallbackReason`) stay in the **Debug** tab.

---

## Pipeline overview

```
Story Setup Form
  → buildStoryGenerationInput()
  → navigate to output page
  → generateStoryOutput(input)   [async]
      ├─ simulate latency (mock + fixture only)
      ├─ if AI enabled:
      │    → buildStoryPrompt(input)
      │    → requestAiStoryGeneration()
      │    → parseAiStoryResponse(rawText)
      │    → validateStoryOutput(parsed)
      │    → success: generationMode "ai"
      │    → failure: mock backup, generationMode "fallback"
      └─ if AI disabled:
           → mock output, generationMode "mock"
  → StoryGenerationOutput + UI (tabs, copy, debug)
```

Setup page only prepares input and navigates — generation runs on the output page.

---

## Environment

See `.env.example`:

```env
VITE_AI_PROVIDER=
VITE_AI_MODEL=
VITE_AI_GENERATION_ENABLED=false
VITE_AI_FIXTURE_MODE=false
```

**Do not put API keys in frontend env files.**

Config: `services/aiConfig.service.ts`

---

## Mock mode (default)

```env
VITE_AI_GENERATION_ENABLED=false
```

Uses `mockStoryData.ts` (market-themed Nina & Nino story). No AI boundary involved. Expected during normal development.

---

## Fixture mode

Tests parse → validate → display without a real provider or backend.

```env
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4o-mini
VITE_AI_GENERATION_ENABLED=true
VITE_AI_FIXTURE_MODE=true
```

```
requestAiStoryGeneration() → fixture raw JSON
  → parseAiStoryResponse()
  → validateStoryOutput()
  → generationMode = "ai"
```

Fixture: `fixtures/aiStoryResponse.fixture.ts` (library-themed story, distinct from mock).

Invalid fixture JSON → fallback mock + Debug errors.

---

## Fallback mode

When AI is enabled but generation fails:

- Teacher sees backup mock story + notice: *"We used a safe backup story because AI generation was unavailable."*
- Debug shows `lastAiError`, `fallbackReason`, provider, model

Common trigger today: AI enabled without fixture and no backend (`api-not-connected`).

`fallbackReason` values: `api-not-connected`, `parse-failed`, `validation-failed`, `unexpected-error`

---

## Future backend mode

When ready to connect real AI:

1. Implement `POST /api/story-generation` using `server/api/story-generation/storyGeneration.contract.ts`
2. Store API keys in **server-side** env (never `VITE_*`)
3. Uncomment the `fetch` block in `requestAiStoryGeneration.ts`
4. Set `VITE_AI_GENERATION_ENABLED=true` and `VITE_AI_FIXTURE_MODE=false`
5. Remove or bypass `simulateGenerationLatency()` for production backend path

---

## API types

`types/ai.types.ts`:

**Request — `AiStoryGenerationApiRequest`**

- `prompt`, `input`, `requestedModel`, `provider`

**Response — `AiStoryGenerationApiResponse`**

- `ok`, `rawText`, `errorMessage`, `provider`, `model`

**Result — `StoryGenerationResult`** (`validation.types.ts`)

- `output`, `validation`, `generationMode`, `lastAiError?`, `fallbackReason?`

---

## Key services

| Service | Role |
|---------|------|
| `aiConfig.service.ts` | Env flags (no secrets) |
| `storyPrompt.service.ts` | Build prompt for backend |
| `requestAiStoryGeneration.ts` | Client → API boundary (mocked / fixture / future fetch) |
| `parseAiStoryResponse.service.ts` | rawText → StoryGenerationOutput |
| `validateStoryOutput.service.ts` | Shape validation |
| `storyGeneration.service.ts` | Orchestrator (mock / ai / fallback) |
| `generationLatency.service.ts` | Simulated delay for mock + fixture |
| `generationSubmitUi.service.ts` | Setup button label + helper text |
| `buildAiGenerationDebugStatus.service.ts` | Debug panel status |

---

## UI surfaces

| Surface | Shows |
|---------|-------|
| Setup button | Generate Mock Story / Generate Story + mode helper text |
| Output loading | `StoryGenerationLoadingState` during async generation |
| Mode badge | Mock Story / AI Generated / Fallback Story |
| Fallback notice | Calm teacher message when mode is fallback |
| Debug tab | AI enabled, fixture mode, provider, model, mode, errors, fallback reason |

---

## Related docs

- [phase-2b-ai-checklist.md](./phase-2b-ai-checklist.md) — testing checklist and pre-real-AI steps
- [phase-1-summary.md](./phase-1-summary.md)
- [architecture.md](./architecture.md)

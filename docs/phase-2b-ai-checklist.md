# Phase 2B AI Pipeline Checklist

Quick reference for what Phase 2B built, what is still mocked, and how to test each mode before connecting a real backend.

---

## What is complete

- [x] Server-safe API boundary (`requestAiStoryGeneration` — no direct browser → OpenAI)
- [x] API request/response types (`AiStoryGenerationApiRequest`, `AiStoryGenerationApiResponse`)
- [x] Backend placeholder folder (`server/api/story-generation/`)
- [x] Prompt builder (`buildStoryPrompt`)
- [x] AI response parser (`parseAiStoryResponse`)
- [x] Output validator (`validateStoryOutput`)
- [x] Generation orchestrator with mock / ai / fallback modes
- [x] Fixture mode for testing parser + validation
- [x] Async generation + loading UI on output page
- [x] Setup page submit loading transition
- [x] Fallback teacher notice + Debug error visibility
- [x] `fallbackReason` for developer diagnostics

---

## What is still mocked

| Piece | Status |
|-------|--------|
| Backend route `POST /api/story-generation` | Placeholder only — not deployed |
| `requestAiStoryGeneration()` fetch call | Commented out |
| AI provider API keys | Not in app — belong on server later |
| Mock story content | `mockStoryData.ts` (market theme) |
| Fixture story content | `fixtures/aiStoryResponse.fixture.ts` (library theme) |
| Generation latency | Simulated 300–800ms for mock + fixture |
| Setup submit delay | 400ms UI transition before navigate |

---

## How to test mock mode (default)

**.env**

```env
VITE_AI_GENERATION_ENABLED=false
VITE_AI_FIXTURE_MODE=false
```

**Steps**

1. Create a project → Story Setup → **Generate Mock Story**
2. Output page shows loading, then market-themed mock story
3. Badge: **Mock Story**
4. Debug tab: AI enabled = false, generation mode = mock
5. No fallback notice

---

## How to test fixture mode

**.env**

```env
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4o-mini
VITE_AI_GENERATION_ENABLED=true
VITE_AI_FIXTURE_MODE=true
```

**Steps**

1. Restart dev server after changing `.env`
2. Setup → **Generate Story** (helper: fixture pipeline text)
3. Output page shows loading, then library-themed story (not market mock)
4. Badge: **AI Generated**
5. Debug tab: AI enabled = true, fixture mode = true, generation mode = ai
6. No fallback notice

**Optional:** Break fixture JSON temporarily to confirm fallback + `parse-failed` in Debug.

---

## How to test fallback mode

**.env**

```env
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4o-mini
VITE_AI_GENERATION_ENABLED=true
VITE_AI_FIXTURE_MODE=false
```

**Steps**

1. Restart dev server
2. Setup → **Generate Story**
3. Output shows market-themed backup story (mock fallback)
4. Badge: **Fallback Story**
5. Teacher notice: safe backup story message
6. Debug tab: generation mode = fallback, fallback reason = `api-not-connected`, last AI error shown

---

## What to do before real AI

1. **Deploy a backend handler** at `POST /api/story-generation` using the contract in `server/api/story-generation/storyGeneration.contract.ts`
2. **Add server-side secrets** (e.g. `OPENAI_API_KEY`) — never `VITE_*`
3. **Implement provider call** in the backend handler using `prompt` + `input` from the request
4. **Return** `AiStoryGenerationApiResponse` with `rawText` containing valid story JSON
5. **Uncomment** the `fetch` block in `src/features/story-generation/services/requestAiStoryGeneration.ts`
6. **Configure frontend** with `VITE_AI_GENERATION_ENABLED=true` and `VITE_AI_FIXTURE_MODE=false`
7. **Verify** parse + validation pass on real responses; adjust prompt schema if needed
8. **Remove or gate** `simulateGenerationLatency()` for production if desired
9. **Test fallback** still works when backend returns errors or invalid JSON

---

## File map

```
src/features/story-generation/
  services/
    aiConfig.service.ts
    storyPrompt.service.ts
    requestAiStoryGeneration.ts      ← enable fetch here
    parseAiStoryResponse.service.ts
    validateStoryOutput.service.ts
    storyGeneration.service.ts       ← orchestrator
    generationLatency.service.ts
  fixtures/aiStoryResponse.fixture.ts
  types/ai.types.ts
  validation.types.ts

server/api/story-generation/
  storyGeneration.contract.ts        ← sync with frontend types
  README.md
```

See also: [story-generation-flow.md](./story-generation-flow.md)

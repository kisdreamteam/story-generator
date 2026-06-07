# Domain 6 — Real AI Output QA Checklist

Manual quality pass for **real story text generation** (`VITE_GENERATION_MODE=ai`) after `/api/story-generation` is deployed. Use before demos, after prompt changes, or when validating a Vercel deployment.

**Scope:** Story text, flashcards, and image **prompts** (not pixel generation).  
**Out of scope:** Illustration rendering, Supabase, teacher UI polish, classroom assignment.

Reference setup: `src/features/story-generation/fixtures/realAiQaReferenceSetup.ts` (`REAL_AI_QA_REFERENCE_SETUP`).

---

## Environment

### Local dev

```env
VITE_GENERATION_MODE=ai
OPENAI_API_KEY=sk-...
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4o-mini
```

Restart `npm run dev` after changing `.env`.

### Vercel

| Variable | Notes |
|----------|-------|
| `VITE_GENERATION_MODE=ai` | Client — redeploy after change |
| `OPENAI_API_KEY` | Server only — never `VITE_*` |

---

## Reference test run

1. Open **Create Story** (`/dashboard/create`).
2. Enter the reference setup from `realAiQaReferenceSetup.ts` (or paste equivalent values):
   - Age **4–6**, **6 pages**, **English**
   - Theme: helping at home / kitchen
   - Words to include: bowl, spoon, help, share
3. Click **Generate story**.
4. Wait for redirect to story detail.
5. Work through the criteria below. Note provider in metadata if visible (real vs fallback mock).

**Fallback check (separate run):** Temporarily remove `OPENAI_API_KEY` on server or block network. Confirm a sample story still appears and toast says *"AI generation was unavailable, so a sample story was used instead."* — app must not crash.

---

## Output quality criteria

Check each item after a successful **real AI** run (not fallback mock).

### Structure and language

- [ ] **Page count** — Exactly the requested page count (reference: 6 pages). Page numbers sequential 1…N.
- [ ] **English by default** — Story text is English when language is English.
- [ ] **Age-appropriate language (4–6)** — Short sentences, familiar words, read-aloud friendly; no abstract or adult phrasing.
- [ ] **Classroom-ready story** — Clear beginning, middle, and end; warm tone; teacher could read it aloud without rewriting.

### Nina & Nino continuity

- [ ] **Nina is older sister** — Story treats Nina as the older sibling (leads, explains, or mentors appropriately).
- [ ] **Nino is younger brother** — Nino reads as younger (follows, asks, learns).
- [ ] **Not twins** — Ages feel distinct; text does not describe them as twins or same age.
- [ ] **Visual continuity in prompts** — Image prompts mention Nina (indigo) and Nino (emerald green) and watercolor style consistently.

### Flashcards

- [ ] **Flashcards present** — At least one card; count within prompt range (roughly 4–12 for a 6-page story).
- [ ] **Match story text** — Each `exampleSentence` appears in or closely quotes the story pages.
- [ ] **Child-friendly definitions** — `simpleDefinition` uses words a teacher can read to ages 4–6 without jargon.
- [ ] **Vocabulary alignment** — Cards favor lesson goal / words to include; nothing from words to avoid.

### Image prompts (text planning only)

- [ ] **One prompt per page** — `imagePrompts.length === pageCount`; `pageNumber` matches story pages.
- [ ] **Scene matches page** — Each prompt describes the same moment as its page text.
- [ ] **Character continuity** — `continuityReminder` references outfits, props, or art style across pages.
- [ ] **No text in artwork** — Prompts do **not** ask for speech bubbles, captions, text boxes, signs with readable text, or other written text in the illustration.
- [ ] **Safe content** — No violence, fear, romance, or inappropriate themes in prompts or story.

### Teacher usability

- [ ] **First draft usable** — Teacher could save and use the story in class without editing raw image prompts (minor page text tweaks OK).
- [ ] **Image placeholders work** — Mock illustration generation still runs from stored prompts on story detail.

---

## Fallback and failure verification

| Scenario | Expected behavior |
|----------|-------------------|
| Missing `OPENAI_API_KEY` | `503` from API; mock story generated; warning toast |
| OpenAI error / timeout | Mock fallback; warning toast; no white screen |
| Invalid JSON from model | Parse error → mock fallback |
| Wrong page count in JSON | Validation error → mock fallback |
| User cancels generation | No silent mock replacement; cancel state shown |

Toast copy (fallback): **Sample story created** — *AI generation was unavailable, so a sample story was used instead.*

---

## What to test on Vercel specifically

- [ ] `POST /api/story-generation` returns JSON (not `index.html`)
- [ ] With key set: real story content (not identical to mock fixture every time)
- [ ] With key unset: deploy still works; create flow falls back to mock
- [ ] Browser network tab shows no `Authorization` header to OpenAI (only to your domain)
- [ ] No `VITE_OPENAI_API_KEY` in client bundle

---

## Filing issues

Include:

- Environment (local / Vercel preview / production)
- `REAL_AI_QA_REFERENCE_SETUP_SUMMARY` values used
- Page count requested vs received
- Whether fallback toast appeared
- Redacted snippet of failing page, flashcard, or image prompt
- Approximate date and model (`VITE_AI_MODEL`)

---

## Related docs

- [domain-6-ai-image-ecosystem.md](./domain-6-ai-image-ecosystem.md) — architecture, env, deferred work
- [phase-8-qa-checklist.md](./phase-8-qa-checklist.md) — full app smoke test (mock mode)

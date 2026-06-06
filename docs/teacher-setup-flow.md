# Teacher Setup Flow

How teachers plan a Nina & Nino story before generation (Phase 2C).

See also: [story-generation-flow.md](./story-generation-flow.md), [phase-2b-ai-checklist.md](./phase-2b-ai-checklist.md)

---

## Overview

```
Create project → Story Setup (form) → Review → Generate → Story Output
```

All steps use **local state only** — no backend, no account, no saved setup drafts yet.

Progress indicator on the setup page:

| Step | When |
|------|------|
| **Setup** | Editing the form |
| **Review** | Review panel visible |
| **Generate** | Confirm loading, before output page |

---

## Step 1 — Setup form

Route: `/projects/:projectId/setup`

Teachers answer guided questions in five sections:

1. **Your lesson goal** — purpose, tone, main events (one per line)
2. **Where the story happens** — theme and setting
3. **Words for students to learn** — vocabulary focus, learning goal, optional word lists
4. **How long should it be?** — page count
5. **Anything else?** — optional notes + Nina & Nino picture guidance

### Validation (before review)

Required:

- Theme, setting, vocabulary focus, learning goal, page count
- At least one main event (one non-empty line)

Optional:

- Words to include / avoid
- Notes

Friendly inline errors appear on the form. **Need ideas?** buttons are placeholders (coming soon).

### Submit button labels

Depends on AI env mode — see [Generation modes](#generation-modes) below.

---

## Step 2 — Review

After a valid form submit, teachers see **Check your story plan** grouped as:

- **Lesson plan** — purpose, tone, learning goal, vocabulary
- **Story details** — theme, setting, length
- **What happens in the story** — numbered list of main events (highlighted)
- **Word choices** — only if optional word lists were filled
- **Anything else** — only if notes were added

Actions:

- **Back to Edit** — return to form with values preserved
- **Confirm & Generate** — proceed to generation

---

## Step 3 — Generate

On confirm:

1. Brief loading state (“Creating your story…”)
2. Navigate to `/projects/:projectId/output`
3. Async story generation runs on the output page (mock, fixture, or fallback)

Teachers then review pages, flashcards, image prompts, and teacher notes.

---

## Generation modes

What happens after **Confirm & Generate** depends on `.env`:

| Mode | Env | What the teacher gets |
|------|-----|------------------------|
| **Mock** (default) | `VITE_AI_GENERATION_ENABLED=false` | Sample market-themed Nina & Nino story |
| **Fixture** | AI enabled + `VITE_AI_FIXTURE_MODE=true` | Sample library-themed story (tests parse/validation path) |
| **Fallback** | AI enabled, no backend | Backup mock story + calm notice if AI path fails |
| **Future AI** | AI enabled, backend connected | Real generated story via server API |

No API keys in the frontend. Mock and fixture modes are safe for classroom workflow previews.

---

## Key files

| File | Role |
|------|------|
| `StorySetupPage.tsx` | Setup + review shell |
| `StorySetupForm.tsx` | Guided form UI |
| `SetupReviewPanel.tsx` | Review groups + confirm |
| `SetupProgressIndicator.tsx` | Setup → Review → Generate steps |
| `useStorySetupForm.ts` | Form state, validation, review mode |
| `validateStorySetupForm.service.ts` | Required field rules |
| `buildSetupReviewFields.service.ts` | Review section builder |
| `buildStoryGenerationInput.ts` | Input contract for generation |

---

## Defaults

Nina & Nino defaults live in `setupDefaults.ts` — market-day theme, warm tone, introduce-vocabulary purpose, and five sample main events. Teachers can edit everything before review.

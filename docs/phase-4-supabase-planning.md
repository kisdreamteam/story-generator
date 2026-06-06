# Phase 4 — Supabase planning

Plan persistence **before** implementation. This document defines goals, ownership, domain shape, and boundaries.

**Progress tracker:** [phase-4-progress.md](./phase-4-progress.md) (through **4.4** — storage adapter layer).

Current baseline: Phase 3.8 local-first flows; Phase 4.3 Supabase schema applied manually; Phase 4.4 adapter layer in `story-generator/lib/storage/` with **local** adapter active.

---

## 1. Persistence goals

| Concern | What survives | Notes |
|---------|---------------|-------|
| **Refresh** | Saved drafts, saved stories, auth session | Must reload from durable storage (Supabase when signed in; optional local cache) |
| **Devices** | Nothing today without an account | With Supabase: drafts and stories tied to the signed-in teacher |
| **Accounts** | Teacher profile, all owned drafts/stories, edit history (future) | Requires auth; RLS enforces ownership |
| **Temporary workflow** | Current wizard step, unsaved form fields, loading spinners, “draft saved” toasts, mock generation timer | Lost on refresh unless explicitly saved |

**Principle:** durable teacher work lives in Supabase; ephemeral UI and in-progress editing stay client-side until save.

---

## 2. User ownership

| Asset | Owner | Access today | Future |
|-------|-------|--------------|--------|
| Story drafts (setup only) | Teacher | Device `localStorage` | Teacher account only |
| Saved stories (setup + generated content) | Teacher | Device `localStorage` | Teacher account only |
| Generated pages, flashcards, image prompts | Teacher (via story) | Embedded in `StoryProject` | Same; editable by owner |
| Mock sample on Stories page | App | Read-only demo | Unchanged or account-gated |

**Future student access:** read-only or assignment-scoped views — not in Phase 4.1. Students do not own stories; teachers publish or share later. Plan for optional `shared_with` or classroom links without designing student accounts yet.

---

## 3. Story domain model

Relationships only — maps to existing TypeScript types in `features/stories/types/`.

```
User (teacher)
  └── owns many Story Draft / Story Project
        ├── has one StorySetupInput (setup)
        ├── optional StoryPlanReview (review snapshot)
        └── optional GeneratedStory
              ├── has many StoryPage (ordered by pageNumber)
              ├── has many StoryFlashcard
              └── has many StoryImagePrompt (per page)

Series / Continuity (future)
  └── groups many Story Projects
        └── shared character/world metadata across stories
```

| Entity | Role |
|--------|------|
| **User** | Authenticated teacher; owner of all drafts and stories |
| **Story Draft** | `StoryProject` before or without final save — setup metadata, optional partial output |
| **Generated Story** | `GeneratedStory` — title, summary, pages, flashcards, prompts, word counts, `generatedAt` |
| **Story Pages** | Paginated classroom text + teaching focus |
| **Flashcards** | Vocabulary tied to the generated story |
| **Image Prompts** | Per-page illustration prompts + continuity reminders |
| **Series / Continuity** | Future: link Nina & Nino stories across themes; not required for first Supabase slice |

`StoryProject` remains the aggregate root in the app: metadata + setup + optional generated payload.

---

## 4. Persistence boundaries

| Data | Layer | Rationale |
|------|-------|-----------|
| Form field values while typing | **Local component state** | Avoid network noise; reset on navigation |
| Wizard step (`form` / `review` / `generated`) | **Local component state** | Session UX; restore via route + loaded draft |
| `setupData`, `generatedStory`, `activeDraftId`, `createdAt` | **Zustand** | Cross-step workflow within Create Story |
| Saved drafts and stories | **Supabase** | Durable, multi-device, account-scoped |
| Draft list, detail, edit loads | **Supabase** (via storage abstraction) | Pages call APIs — same boundary as today’s `getStoryDrafts`, `loadDraftWithGeneratedStory`, `saveStoryDraft` |
| Auth session | **Supabase Auth** | Not Zustand long-term |

**Migration path:** keep `story-generator/lib/story-storage.ts` as the client boundary (Phase **4.4** — now a thin delegator to `StoryStorageAdapter`). Phase 4.5+ adds Supabase implementation in `supabaseStoryStorageAdapter` without changing pages or hooks.

**Examples:**

- Form inputs → local  
- Workflow state → Zustand  
- Saved stories → Supabase  
- Generation in progress → local (+ optional job record in Supabase later)

---

## 5. Draft strategy

**Recommendation: hybrid with local fallback**

| Mode | When | Behavior |
|------|------|----------|
| **Manual save** | Review step (“Save draft”) | Explicit; matches current UX; teacher control |
| **Autosave (debounced)** | After review, while editing generated content | Optional Phase 4.x; reduces data loss |
| **Local fallback** | Offline or pre-auth | Write to `localStorage`; sync on sign-in (merge or prompt) |
| **Conflict behavior** | Same draft edited on two devices | **Last-write-wins** for v1; surface `updatedAt` conflict warning in v2 |

**Statuses (conceptual):**

- **Draft** — setup saved, no generated content  
- **Saved story** — setup + generated content persisted  
- **Generating** — transient; not persisted until job completes (future)

Do not autosave every keystroke on the setup form in v1 — too noisy and confusing before auth exists.

---

## 6. Future considerations

| Area | Planning note |
|------|----------------|
| **Multi-device** | Supabase as source of truth; optional optimistic cache in `localStorage` |
| **AI generation jobs** | Async row or job table; poll/subscribe; store result into `GeneratedStory` on completion |
| **Exporting** | Read saved story from Supabase; generate PDF client- or server-side; no persistence change |
| **Sharing stories** | Public read link or classroom code; separate from ownership; RLS or signed URLs |
| **Translations** | New language variant per story or per page set; links to same project or fork |
| **Image generation** | Store image URLs or storage bucket refs on `StoryImagePrompt`; prompts already in domain model |

None of these block Phase 4.2 schema work; design aggregates so extensions attach to `StoryProject` / `GeneratedStory` without breaking v1.

---

## 7. Suggested next phase

Phase 4.2–4.4 are done (schema design, manual migration, storage adapter). See [phase-4-progress.md](./phase-4-progress.md).

### Phase 4.5 — Supabase client + adapter implementation

1. Add Supabase client and auth  
2. Implement `supabaseStoryStorageAdapter`  
3. Switch active adapter in `story-storage.ts` when signed in (optional local fallback)  
4. One-time or lazy migration from `localStorage` on first login  
5. Verify flows unchanged: Create → Review → Generate → Save → Stories → Detail → Edit  

**Out of scope:** real AI jobs, sharing, series, image gen, export.

---

## Related docs

- [phase-4-progress.md](./phase-4-progress.md) — Phase 4 status through 4.4  
- [phase-3-progress.md](./phase-3-progress.md) — local-first implementation through 3.8  
- [phase-3-stories-feature.md](./phase-3-stories-feature.md) — folder map and feature boundaries  
- [story-generation-flow.md](./story-generation-flow.md) — AI boundary (future wire-up)

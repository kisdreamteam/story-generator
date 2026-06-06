# Phase 4.2 — Supabase schema design

First Supabase schema for the Nina & Nino story app. Design only — no SQL migrations or app code yet.

Aligns with [phase-4-supabase-planning.md](./phase-4-supabase-planning.md) and existing types in `features/stories/types/story.types.ts`.

---

## 1. Tables

### v1 tables

| Table | Purpose |
|-------|---------|
| **`profiles`** | App profile for each authenticated teacher |
| **`story_projects`** | One draft or saved story project (aggregate root) |
| **`story_pages`** | Individual generated story pages |
| **`story_flashcards`** | Vocabulary cards for a project |
| **`story_image_prompts`** | Illustration prompt (and future image) per page |

### Future tables (not v1)

- `students` / `classrooms` — student access and assignments  
- `story_shares` — public or classroom read links  
- `story_translations` — language variants  
- `generation_jobs` — async AI generation tracking  
- `story_series` — Nina & Nino continuity across projects  

---

## 2. Table responsibilities

### `profiles`

| Column (conceptual) | Notes |
|---------------------|-------|
| `id` | Primary key; matches `auth.users.id` |
| `display_name` | Teacher name shown in UI |
| `email` | Optional mirror of auth email |
| `created_at` / `updated_at` | Profile lifecycle |

One row per signed-in teacher. Created on first login (trigger or app upsert in Phase 4.3).

---

### `story_projects`

One row = one `StoryProject` in the app.

| Column (conceptual) | Notes |
|---------------------|-------|
| `id` | UUID primary key |
| `owner_id` | FK → `profiles.id` |
| `title` | Display title (from setup or generated story) |
| `status` | `draft` \| `generated` \| `saved` \| `archived` |
| `setup_data` | JSONB — full `StorySetupInput` (+ optional `StoryPlanReview`) |
| `generated_metadata` | JSONB — title, summary, `totalWordCount`, `generatedAt`, etc. without normalized child rows |
| `language` | Indexed filter field (also in `setup_data`) |
| `age_range` | Indexed filter field |
| `theme` | Indexed filter field |
| `page_count` | Planned page count from setup |
| `created_at` / `updated_at` | Sorting and conflict detection |

**Status mapping (app → DB):**

| App concept | `status` |
|-------------|----------|
| Setup saved, no output | `draft` |
| Mock/AI output in session, not explicitly saved | `generated` (optional; may skip until “Save story”) |
| Setup + generated content persisted | `saved` |
| Teacher hid / retired project | `archived` |

v1 can treat “Save story” as `saved` and manual “Save draft” as `draft`. Child tables (`story_pages`, etc.) populate when status moves to `saved` or `generated`.

---

### `story_pages`

Normalized generated page content for read, edit, and future export.

| Column (conceptual) | Notes |
|---------------------|-------|
| `id` | UUID primary key |
| `project_id` | FK → `story_projects.id` |
| `page_number` | Order within project (unique per project) |
| `text` | Page body |
| `word_count` | Denormalized for summaries |
| `notes` | Optional — maps to `teachingFocus` in app types today |

Rows exist only after generation. Empty for setup-only drafts.

---

### `story_flashcards`

| Column (conceptual) | Notes |
|---------------------|-------|
| `id` | UUID primary key |
| `project_id` | FK → `story_projects.id` |
| `page_id` | FK → `story_pages.id`, nullable — story-wide vs page-specific cards |
| `word` | Vocabulary term |
| `definition` | Nullable — maps to `simpleDefinition` |
| `example_sentence` | Nullable |
| `sort_order` | Stable display order |

---

### `story_image_prompts`

| Column (conceptual) | Notes |
|---------------------|-------|
| `id` | UUID primary key |
| `project_id` | FK → `story_projects.id` |
| `page_id` | FK → `story_pages.id`, nullable until pages synced |
| `page_number` | Denormalized for lookup before `page_id` exists |
| `prompt_text` | Illustration prompt |
| `continuity_reminder` | Optional text — from app `StoryImagePrompt`; can live here or in JSONB until needed |
| `image_url` | Nullable — future generated image in Storage |
| `status` | `prompt_only` \| `generated` \| `failed` |
| `created_at` / `updated_at` | Image job lifecycle (future) |

---

## 3. Relationships

Plain English:

- **Auth user → profile:** one-to-one. Supabase Auth owns identity; `profiles` holds app fields.
- **Profile → story projects:** one-to-many. Every project has exactly one `owner_id`.
- **Story project → story pages:** one-to-many. Pages belong to one project; deleting a project deletes its pages (cascade).
- **Story project → story flashcards:** one-to-many. Flashcards belong to one project; optional link to one page.
- **Story project → story image prompts:** one-to-many. Each prompt belongs to one project; optionally linked to one page via `page_id`.
- **Story page → flashcards / image prompts:** one-to-many (optional). Child rows may reference `page_id` when scoped to a page.

**Load pattern for the app:** fetch `story_projects` for the signed-in teacher, then fetch child rows by `project_id` (or single query with joins in the storage adapter). Map back to `StoryProject` / `GeneratedStory` shapes the UI already expects.

---

## 4. RLS plan

Policy **intent** only — SQL in Phase 4.3.

| Resource | Policy intent |
|----------|----------------|
| **`profiles`** | Authenticated users can **read and update their own** profile row (`id = auth.uid()`). No cross-teacher reads. |
| **`story_projects`** | Authenticated teachers can **SELECT, INSERT, UPDATE, DELETE** rows where `owner_id = auth.uid()`. |
| **`story_pages`** | Access only if the parent project is owned by `auth.uid()`. Same for INSERT/UPDATE/DELETE. |
| **`story_flashcards`** | Same as pages — gated through owned `project_id`. |
| **`story_image_prompts`** | Same as pages — gated through owned `project_id`. |

**Rules of thumb:**

- No anonymous write access in v1.  
- No teacher reads another teacher’s projects or children.  
- Service role (Edge Functions, future AI jobs) bypasses RLS — not used from the browser.  
- Future sharing uses separate tables/policies; do not weaken owner-only RLS on core tables.

---

## 5. JSONB decision

### Stored as JSONB in v1

| Field | Contents |
|-------|----------|
| `story_projects.setup_data` | Full `StorySetupInput`, optional `StoryPlanReview` |
| `story_projects.generated_metadata` | `GeneratedStory` fields not duplicated in child tables (summary, `generatedAt`, extras) |

### Why JSONB now

- **Faster iteration** — setup form fields still evolve; no migration per new question.  
- **App shape still changing** — matches today’s `StoryProject` blob in `localStorage`.  
- **Avoids premature normalization** — don’t split setup into 15 columns before the workflow stabilizes.

### What may be normalized later

- Setup fields used heavily in search/filter (already duplicated: `theme`, `language`, `age_range`).  
- `generation_jobs` when AI runs server-side.  
- `story_series_id` on `story_projects` for continuity.  
- Image binary metadata (bucket path, dimensions) separate from `image_url`.  
- Version history / edit audit rows.

Child tables (`story_pages`, `story_flashcards`, `story_image_prompts`) are already normalized for **generated content editing** — the main pain point in Phase 3 edit mode.

---

## 6. Migration path from localStorage

Today, `story-generator/lib/story-storage.ts` exposes:

- `getStoryDrafts()` / `getStoryDraft(id)`  
- `saveStoryDraft(project)`  
- `deleteStoryDraft(id)` / `clearStoryDrafts()`

**Phase 4.3+ approach:**

1. **Keep the same function signatures** in `story-storage.ts` (or rename file to `story-persistence.ts` with re-exports).  
2. **Add a Supabase implementation** that:
   - Maps `StoryProject` ↔ `story_projects` + child rows + JSONB fields.  
   - Uses the signed-in user’s `owner_id` on insert.  
   - Rebuilds `StoryProject` in `loadDraftWithGeneratedStory` from joined queries.  
3. **Choose backend at runtime:** signed in → Supabase; signed out → existing `localStorage` (optional dual-write during transition).  
4. **One-time import on first login:** read `localStorage` array, upsert each draft with new UUIDs or preserve ids if UUID-compatible; clear or mark local cache imported.  
5. **Pages unchanged** — they already call storage APIs, not `localStorage` directly (Phase 3.8 boundary).

Conflict handling v1: **last-write-wins** using `updated_at` on `story_projects`.

---

## 7. Next phase

### Phase 4.3 — SQL migration and policies

1. Write Supabase migration: create v1 tables, indexes, FKs, cascades.  
2. Add RLS policies per section 4.  
3. Profile bootstrap on signup (trigger or client upsert).  
4. Generate TypeScript types from schema (`supabase gen types`) — wire in a later app phase.  
5. Implement Supabase adapter behind `story-storage.ts`; keep local fallback until auth is mandatory.

**Still out of scope:** students, sharing, translations, AI jobs, series, image generation pipeline.

---

## Related docs

- [phase-4-supabase-planning.md](./phase-4-supabase-planning.md) — persistence goals and boundaries  
- [phase-3-progress.md](./phase-3-progress.md) — current local-first implementation

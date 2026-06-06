# Phase 4.3 — Supabase setup check

Record of the **manual SQL migration** applied in the Supabase SQL Editor.

Source script: [phase-4-supabase-migration.md](./phase-4-supabase-migration.md)

> **App integration has not started yet.** The existing `localStorage` flow in `story-generator/lib/story-storage.ts` remains unchanged. This database layer is ready for a future adapter phase.

---

## Apply record

| Item | Value |
|------|--------|
| **Date applied** | 2026-06-06 |
| **Applied via** | Supabase Dashboard → SQL Editor (manual paste) |
| **Environment** | Supabase project (hosted) |
| **Migration file in repo** | Not committed — SQL lives in docs only for now |

---

## What was created

### Tables (5)

| Table | Purpose |
|-------|---------|
| `public.profiles` | Teacher app profile (`id` = `auth.users.id`) |
| `public.story_projects` | Draft or saved story aggregate root |
| `public.story_pages` | Generated page text |
| `public.story_flashcards` | Vocabulary cards |
| `public.story_image_prompts` | Illustration prompts (+ future `image_url`) |

### Extension

- `pgcrypto` — `create extension if not exists "pgcrypto"` (for `gen_random_uuid()`)

### Trigger function

| Function | Purpose |
|----------|---------|
| `public.set_updated_at()` | Sets `updated_at` to UTC `now()` on row update |

### `updated_at` triggers (5)

| Trigger | Table |
|---------|--------|
| `profiles_set_updated_at` | `profiles` |
| `story_projects_set_updated_at` | `story_projects` |
| `story_pages_set_updated_at` | `story_pages` |
| `story_flashcards_set_updated_at` | `story_flashcards` |
| `story_image_prompts_set_updated_at` | `story_image_prompts` |

### RLS

Row Level Security **enabled** on all five tables.

### Policies (19)

| Table | Policies |
|-------|----------|
| `profiles` | `profiles_select_own`, `profiles_insert_own`, `profiles_update_own` (3 — no DELETE) |
| `story_projects` | `story_projects_select_own`, `_insert_own`, `_update_own`, `_delete_own` (4) |
| `story_pages` | `story_pages_select_own`, `_insert_own`, `_update_own`, `_delete_own` (4) |
| `story_flashcards` | `story_flashcards_select_own`, `_insert_own`, `_update_own`, `_delete_own` (4) |
| `story_image_prompts` | `story_image_prompts_select_own`, `_insert_own`, `_update_own`, `_delete_own` (4) |

Child policies gate access through owned `story_projects` (`owner_id = auth.uid()`).

### Indexes (8)

| Index | Table |
|-------|--------|
| `story_projects_owner_updated_idx` | `(owner_id, updated_at desc)` |
| `story_projects_owner_status_idx` | `(owner_id, status)` |
| `story_pages_project_id_idx` | `(project_id)` |
| `story_flashcards_project_id_idx` | `(project_id)` |
| `story_flashcards_project_sort_idx` | `(project_id, sort_order)` |
| `story_image_prompts_project_id_idx` | `(project_id)` |
| `story_image_prompts_page_id_idx` | `(page_id)` |

### Constraints (notable)

- `story_projects.status` — `draft`, `generated`, `saved`, `archived`
- `story_image_prompts.status` — `prompt_only`, `generated`, `failed`
- `story_pages` — unique `(project_id, page_number)`
- `story_image_prompts` — unique `(project_id, page_number)`
- `story_flashcards_page_belongs_to_project` — `page_id` must match `project_id` when set
- `story_image_prompts_page_belongs_to_project` — same

---

## `handle_new_user` trigger

| Item | Status |
|------|--------|
| **`handle_new_user()` function** | **Not created** — left commented out in migration script |
| **`on_auth_user_created` trigger on `auth.users`** | **Not created** |

Profiles must be created manually (SQL insert) or by the app on first login until this block is enabled or app upsert exists.

---

## SQL Editor warnings or errors

| Result | Notes |
|--------|--------|
| **Errors** | None — migration completed successfully |
| **Warnings** | None blocking. If `pgcrypto` already existed, `create extension if not exists` is a no-op (safe to ignore) |

Update this table if you re-run partial scripts or see permission messages on a fresh project.

---

## Manual smoke test checklist

Run in SQL Editor **as each test user** (use Supabase Auth test accounts), or via Table Editor with “Run as user” / authenticated client.

### Setup

- [ ] Two test users exist: **User A** and **User B** (email/password or magic link)
- [ ] Each user has a row in `profiles` (`id` = their `auth.users.id`) — insert manually if signup trigger is disabled

### User A — own data

- [ ] **User A** can `INSERT` into `story_projects` with `owner_id = auth.uid()`
- [ ] **User A** can `SELECT` their own `story_projects` row
- [ ] **User A** can `UPDATE` their own project (e.g. change `title`; confirm `updated_at` changes)
- [ ] **User A** can `INSERT` child rows (`story_pages`, `story_flashcards`, `story_image_prompts`) for that `project_id`
- [ ] **User A** can `SELECT` those child rows

### User B — isolation

- [ ] **User B** cannot `SELECT` User A’s `story_projects` row (0 rows)
- [ ] **User B** cannot `SELECT` User A’s child rows (0 rows)
- [ ] **User B** cannot `INSERT` child rows pointing at User A’s `project_id` (RLS denies)

### Child row ownership

- [ ] Child `INSERT` fails when `project_id` belongs to another user
- [ ] Flashcard/prompt with `page_id` set fails CHECK if page belongs to a different `project_id`

### Anonymous access

- [ ] **Anonymous** (`anon` role / not signed in) cannot `SELECT` from `story_projects` (0 rows or permission denied)
- [ ] Anonymous cannot `SELECT` from child tables

### Optional cleanup

- [ ] Delete test rows or keep in a dedicated dev project only

---

## Next steps (not started)

1. `supabase gen types typescript` — generate DB types for future client code  
2. Supabase client + auth in the app  
3. Supabase adapter behind `story-generator/lib/story-storage.ts`  
4. Optional: enable `handle_new_user` trigger for auto-profiles on signup  

---

## Related docs

- [phase-4-supabase-migration.md](./phase-4-supabase-migration.md) — migration SQL and review notes  
- [phase-4-supabase-schema.md](./phase-4-supabase-schema.md) — schema design  
- [phase-4-supabase-planning.md](./phase-4-supabase-planning.md) — persistence goals

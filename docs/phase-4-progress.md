# Phase 4 — Progress

Supabase persistence planning, schema, migration, and storage adapter work for the story app.

App behavior is still **local-first** — `localStorage` via the adapter layer until Supabase is wired.

---

## 1. Current Phase 4 status

Phase 4 is **complete through 4.13**. Teachers can sign in via Settings; cloud storage activates when eligible; story routes handle missing/invalid/unauthorized loads safely; storage mode is visible in the UI; local stories can be copied to cloud on demand.

**Layering (current):**

```
pages → hooks → story-storage.ts → resolveStoryStorageAdapter() → local | supabase
```

---

## 2. Completed phases

### Phase 4.1 — Planning

- [phase-4-supabase-planning.md](./phase-4-supabase-planning.md) — persistence goals, ownership, domain model, boundaries

### Phase 4.2 — Schema design

- [phase-4-supabase-schema.md](./phase-4-supabase-schema.md) — v1 tables, RLS intent, JSONB decision (no SQL)

### Phase 4.3 — SQL migration (applied manually)

- [phase-4-supabase-migration.md](./phase-4-supabase-migration.md) — draft SQL  
- [phase-4-supabase-setup-check.md](./phase-4-supabase-setup-check.md) — apply record, RLS inventory, smoke-test checklist  
- Tables: `profiles`, `story_projects`, `story_pages`, `story_flashcards`, `story_image_prompts`  
- `handle_new_user` trigger left **commented out** (profiles via app upsert later)

### Phase 4.4 — Storage adapter layer

- **Public storage API unchanged** — `story-generator/lib/story-storage.ts`
- **`story-storage.ts`** — thin delegator to the active adapter
- **`StoryStorageAdapter`** — interface in `lib/storage/StoryStorageAdapter.ts`
- **`localStoryStorageAdapter`** — existing `localStorage` behavior moved here (identical)
- **`supabaseStoryStorageAdapter`** — stub only; methods throw `Not implemented`
- **Active adapter:** `localStoryStorageAdapter`
- **No changes** to pages, routes, hooks, or flows
- **`npm run build` passes**

| File | Role |
|------|------|
| `lib/story-storage.ts` | Public API — delegates to adapter |
| `lib/storage/localStoryStorageAdapter.ts` | Current implementation |
| `lib/storage/supabaseStoryStorageAdapter.ts` | Future Supabase backend (stub) |
| `lib/storage/StoryStorageAdapter.ts` | Interface contract |

### Phase 4.5 — Supabase client + env check

- **Installed** `@supabase/supabase-js`
- **Added** shared Supabase client utilities in `src/shared/lib/supabase/`
- **`getSupabaseClient()`** — lazy singleton; throws a clear dev error if env vars are missing
- **`isSupabaseConfigured()`** — non-throwing env check
- **`checkSupabaseConnection()`** — harmless `auth.getSession()` check (no story table queries)
- **`.env.example`** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (anon key only)
- **`src/vite-env.d.ts`** — Vite env typings for Supabase vars
- **Client not imported by app flow yet** — Create/Stories/Edit unchanged
- **Story storage still uses** `localStoryStorageAdapter`
- **No changes** to pages, routes, hooks, auth flow, or persistence behavior
- **`npm run build` passes**

### Phase 4.6 — Supabase adapter implementation

- **`supabaseStoryStorageAdapter`** — full CRUD against Supabase tables
- Inactive until resolver selects it

### Phase 4.7 — Async public storage API

- **`story-storage.ts`** exports async functions
- Call sites updated to `await`

### Phase 4.8 — Adapter resolver

- **`resolveStoryStorageAdapter()`** — flag + env + session checks
- **`VITE_ENABLE_SUPABASE_STORIES`** (default `false`)
- Local fallback always available

### Phase 4.10 — Auth + cloud storage

- **`AuthProvider`** + **`useAuth()`** — session restore, sign-in/up/out
- **Settings → Account** — teacher auth UI
- **Dashboard header** — sign-in link / sign-out
- Resolver unchanged — uses `auth.getSession()` when flag + env allow
- **`docs/phase-4-auth-and-cloud-storage.md`**

### Phase 4.11 — Story ownership guards

- **`story-route-guards.ts`** — validate story route ids; user-safe error copy
- **`useStoryGeneratedLoader`** — reloads on auth/resolver change; try/catch loads
- **`StoryLoadGuardView`** — loading / not-found / invalid-id / error UI
- **Stories list** — error state + retry; refreshes on sign-in/out
- **Edit save** — error handling; redirects use canonical `draft.id`
- Cloud ownership enforced by Supabase RLS (null = not found, no leak)

### Phase 4.12 — Storage status UX

- **`getStorageStatusSnapshot()`** — sync status aligned with `resolveStoryStorageAdapter()` (no duplicate adapter selection)
- **`useStorageStatus()`** — hook composing auth + snapshot; updates on sign-in/out and session restore
- **`StorageStatusIndicator`** — badge + friendly copy in dashboard header, Settings → Account, and Stories list
- Resolver, auth, and storage behavior unchanged
- **`npm run build` passes**

### Phase 4.13 — Optional local-to-cloud migration

- **`detectPendingLocalStoryMigration()`** — signed-in + cloud active + unmigrated local stories
- **`copyLocalStoriesToCloud()`** — reads `localStoryStorageAdapter`, writes `supabaseStoryStorageAdapter` directly (not resolver)
- **`localStoryMigrationMap`** — local id → cloud id mapping in localStorage for duplicate protection
- **`useLocalStoryMigration()`** + **`LocalStoryMigrationPrompt`** — Stories page and Settings → Account
- Local stories are never deleted; user must opt in; no auto-migrate
- **`npm run build` passes**

---

## 3. What is not connected yet

- Real AI generation  

---

## 4. Suggested next phase

**Phase 5** — Import local drafts on first cloud sign-in; teacher onboarding.

---

## Related docs

- [phase-4-supabase-planning.md](./phase-4-supabase-planning.md) — goals and boundaries  
- [phase-4-supabase-schema.md](./phase-4-supabase-schema.md) — table design  
- [phase-4-supabase-migration.md](./phase-4-supabase-migration.md) — migration SQL  
- [phase-4-supabase-setup-check.md](./phase-4-supabase-setup-check.md) — post-apply checklist  
- [phase-4-auth-and-cloud-storage.md](./phase-4-auth-and-cloud-storage.md) — auth + resolver behavior  
- [phase-4-cloud-storage-testing.md](./phase-4-cloud-storage-testing.md) — enable & test cloud storage  
- [phase-3-progress.md](./phase-3-progress.md) — dashboard and local-first flows through 3.8

# Phase 4.10 — Auth and cloud story storage

How teacher sign-in connects to automatic cloud/local story persistence.

---

## Architecture (unchanged)

```
pages → hooks → story-storage.ts → resolveStoryStorageAdapter() → local | Supabase
```

**No page or hook chooses the adapter.** Auth only affects what `resolveStoryStorageAdapter()` returns.

---

## Auth flow

| Layer | Role |
|-------|------|
| **`AuthProvider`** | Restores session on load; listens to `onAuthStateChange` |
| **`useAuth()`** | `user`, `session`, `isLoading`, `signIn`, `signUp`, `signOut` |
| **Settings → Account** | Sign-in / sign-up forms |
| **Dashboard header** | Email + sign out, or link to Settings |

Session persistence uses Supabase Auth (localStorage/cookies managed by `@supabase/supabase-js`).

On sign-in / sign-up / sign-out, `resetStoryStorageAdapterLog()` runs so the next storage operation logs the correct adapter.

---

## Storage resolver behavior

`resolveStoryStorageAdapter()` selects **Supabase** when **all** are true:

1. `VITE_ENABLE_SUPABASE_STORIES=true`
2. `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set
3. Active Supabase session (`auth.getSession()`)

Otherwise → **local adapter** (`localStorage`).

Console (once per adapter switch): `[Story Storage] Using local adapter` or `Using supabase adapter`.

---

## User experience

### Signed out (default)

- All story CRUD uses **local device storage**
- Same behavior as Phase 3 local-first app

### Signed in + cloud flag on

- Create, save draft, save story, list, view, edit, delete → **Supabase**
- Local drafts from before sign-in are **not** merged automatically

### Sign out

- Next storage operations use **local** again
- Cloud-saved stories remain in Supabase for next sign-in

### Refresh

- **Logged in:** session restored → resolver keeps using Supabase when eligible
- **Logged out:** local storage only

---

## Enable cloud storage

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENABLE_SUPABASE_STORIES=true
```

Teachers sign in at **Dashboard → Settings → Account**.

---

## Return to local-only

Any of:

- `VITE_ENABLE_SUPABASE_STORIES=false`
- Remove Supabase env vars
- **Sign out** (Settings or header)

---

## Dev helpers (optional)

`window.__storyCloudTest` remains in **development** for debugging only. The app does not require it — use Settings sign-in instead.

See also [phase-4-cloud-storage-testing.md](./phase-4-cloud-storage-testing.md).

---

## Related docs

- [phase-4-progress.md](./phase-4-progress.md)
- [phase-4-supabase-setup-check.md](./phase-4-supabase-setup-check.md)

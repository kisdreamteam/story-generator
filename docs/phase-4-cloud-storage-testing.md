# Phase 4.9 — Cloud storage testing

Safely test Supabase story persistence using the adapter resolver.

> **Phase 4.10:** Use **Settings → Account** for normal sign-in. Dev console helpers below are optional.

See [phase-4-auth-and-cloud-storage.md](./phase-4-auth-and-cloud-storage.md) for the full auth + storage flow.

---

## Enable cloud storage

1. Apply the Phase 4.3 SQL migration in Supabase (see [phase-4-supabase-setup-check.md](./phase-4-supabase-setup-check.md)).

2. Create a test teacher in **Supabase Auth** (email + password).

3. Copy `.env.example` → `.env` and set:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENABLE_SUPABASE_STORIES=true
```

4. Restart the dev server (`npm run dev`).

---

## When Supabase is used

`resolveStoryStorageAdapter()` selects **Supabase** only when **all** are true:

| Check | Required |
|--------|----------|
| `VITE_ENABLE_SUPABASE_STORIES=true` | Yes |
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set | Yes |
| Signed-in Supabase session | Yes |

Otherwise → **local adapter** (default / fallback).

Console (once per session): `[Story Storage] Using local adapter` or `Using supabase adapter`.

---

## Sign in for testing

**Recommended:** Dashboard → **Settings** → Account → Sign in / Sign up.

**Optional dev console** (development builds only):

```javascript
await __storyCloudTest.devCloudStorageStatus()
await __storyCloudTest.devCloudSignIn('teacher@example.com', 'your-password')
await __storyCloudTest.devCloudStorageStatus()
```

Expect `adapterKind: "supabase"` and `[Story Storage] Using supabase adapter` on the next storage operation.

Sign out:

```javascript
await __storyCloudTest.devCloudSignOut()
```

---

## Manual CRUD test checklist

Use the normal app flows (Create Story, Stories, Detail, Edit):

| Step | App action | Check in Supabase |
|------|------------|-------------------|
| 1 | Create setup → **Save draft** | `story_projects` row (`status: draft`), `profiles` row |
| 2 | Confirm → mock generate → **Save story** | `story_projects` updated (`status: saved`), child tables populated |
| 3 | **Stories** list | Row visible (cloud id = UUID) |
| 4 | **View story** | `story_pages`, `story_flashcards`, `story_image_prompts` |
| 5 | **Edit story** → Save | Child rows replaced; `updated_at` changes |
| 6 | **Delete** draft/story | Project row gone; children cascade-deleted |

**Note:** Local draft ids (`draft-*`) map to stable cloud UUIDs in `sessionStorage` for repeat saves. After first cloud save, the workflow store uses the cloud UUID.

---

## Return to local-only storage

Any of:

- Set `VITE_ENABLE_SUPABASE_STORIES=false` (or remove it)
- Remove Supabase env vars
- Run `await __storyCloudTest.devCloudSignOut()`
- Use a private/incognito window without signing in

The app falls back to `localStorage` automatically. Existing local drafts are unchanged.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Always `local adapter` | Flag off, missing env, or not signed in |
| FK error on save | No `profiles` row — adapter upserts profile on save; ensure Auth user exists |
| Story not found after save | Old `draft-*` URL bookmark — open from Stories list (UUID id) |
| RLS error | Test user does not own the row — use the same signed-in user |

---

## Related docs

- [phase-4-progress.md](./phase-4-progress.md) — Phase 4 status  
- [phase-4-supabase-setup-check.md](./phase-4-supabase-setup-check.md) — schema apply record

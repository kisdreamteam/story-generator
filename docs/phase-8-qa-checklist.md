# Phase 8 — Manual QA Checklist

Lightweight smoke test for the **dashboard story app** (`/dashboard/*`). Use this before demos, releases, or after storage/auth/copy changes.

**Scope:** Create story, Your stories, story detail, Settings account, local/cloud storage, and mock generation.  
**Out of scope:** Legacy `/projects/*` routes (separate story-projects flow).

---

## How to use

1. Run the app: `npm run dev`
2. Work through each section in order the first time; later runs can spot-check what changed.
3. Check boxes as you go. Note browser, env, and any failures in the margin.
4. Finish with **§12 Build check**.

---

## Setup reference

### Default local QA (no cloud)

```env
VITE_ENABLE_SUPABASE_STORIES=false
VITE_GENERATION_MODE=mock
```

Restart the dev server after changing `.env`.

### Cloud QA (optional second pass)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENABLE_SUPABASE_STORIES=true
VITE_GENERATION_MODE=mock
```

Apply the Supabase schema migration first. See [phase-4-cloud-storage-testing.md](./phase-4-cloud-storage-testing.md).

### Main routes

| Route | Page |
|-------|------|
| `/dashboard` | Dashboard home |
| `/dashboard/create` | Create story (plan → review → generate) |
| `/dashboard/stories` | Your stories |
| `/dashboard/stories/:storyId` | Story detail |
| `/dashboard/stories/:storyId/edit` | Redirects to detail with `?edit=1` |
| `/dashboard/settings` | Account sign-in |

### Storage behavior (quick)

| Condition | Where stories save | Badge |
|-----------|-------------------|--------|
| Signed out, or cloud flag off | This browser (`localStorage`) | **Saved here** |
| Signed in + cloud flag on + Supabase configured | Teacher account | **Your account** |

Console (dev): `[Story Storage] Using local adapter` or `Using supabase adapter` on the next storage operation.

---

## 1. Local-only teacher flow

**Prerequisites:** `VITE_ENABLE_SUPABASE_STORIES=false` (or unset). Use a normal browser window (not incognito unless testing fresh state).

- [ ] Open `/dashboard` — sidebar shows Dashboard, Create Story, Stories, Settings
- [ ] Header shows **Saved here** (compact badge)
- [ ] **Create Story** → fill plan form → **Review story plan** → **Save plan**
- [ ] “Plan saved…” message appears; status badge shows **Story plan**
- [ ] Go to **Stories** — saved plan appears in **Story library** (not in Sample story)
- [ ] **Generate story** from review (or reopen plan and generate) — story completes and opens on detail page
- [ ] Return to **Stories** — finished story listed with **Saved** (or **View story** action)
- [ ] Refresh the page — stories still listed
- [ ] Open a **new incognito/private window** — library is empty (local to this browser)
- [ ] **Settings → Account** — sign-in unavailable or explains stories save in this browser (no cloud jargon in UI)

---

## 2. Cloud-enabled teacher flow

**Prerequisites:** Cloud env vars set, `VITE_ENABLE_SUPABASE_STORIES=true`, test teacher account created in Supabase Auth.

- [ ] **Settings → Account** → sign in with test teacher
- [ ] Header shows email + **Sign out**; badge shows **Your account**
- [ ] Create a new story plan → **Save plan** → **Generate story**
- [ ] Story appears in **Your stories** after save
- [ ] Refresh — story still there (loaded from account)
- [ ] **Sign out** from header
- [ ] Badge returns to **Saved here**; hint mentions signing in to keep stories in your account
- [ ] Create another story while signed out — saves locally only
- [ ] Sign in again — account stories visible; locally created story while signed out may still be in browser (see §3)

---

## 3. Local-to-cloud migration prompt

**Prerequisites:** Cloud enabled and signed in. At least one story saved **before** sign-in (local-only pass) that was **not** already copied.

- [ ] Prompt appears on **Your stories** (Story library section) and/or **Settings → Account**
- [ ] Copy mentions stories “saved in this browser” and **Copy to account** / **Not now**
- [ ] **Copy to account** — progress text, then success count
- [ ] Message confirms originals stay in this browser
- [ ] Story library refreshes; copied stories visible in account list
- [ ] **Not now** — prompt hides for this set of stories (until fingerprint changes)
- [ ] Sign out and sign in again — already-copied stories do not re-prompt endlessly
- [ ] (If copy fails) failure list shows story title + short reason — no raw API/Supabase errors

---

## 4. Create story setup draft

**Route:** `/dashboard/create`

- [ ] Progress steps: **Plan your story** → **Review plan** → **Your story**
- [ ] Form sections load with sensible defaults; **Review story plan** submits to review step
- [ ] Review shows grouped plan fields and **Story plan** badge
- [ ] **Back to edit** returns to form with values kept
- [ ] **Save plan** — “Plan saved…” confirmation; leaving the page without other unsaved work does not warn
- [ ] Change form after save without saving again → navigate away → browser confirms unsaved plan
- [ ] From **Stories**, open a plan-only story (**Continue editing**) → lands on create flow with plan loaded
- [ ] Invalid/missing `?draftId=` shows friendly amber warning and empty form (no crash)

---

## 5. Generate mock story

**Prerequisites:** `VITE_GENERATION_MODE=mock` (default).

- [ ] From review, **Generate story** → step moves to **Your story**
- [ ] **Creating your story…** loading card appears (pages, vocabulary cards, illustration notes mentioned)
- [ ] On success, app **auto-saves** and navigates to `/dashboard/stories/:storyId` (you may not stay on the create preview step)
- [ ] Detail page shows story pages, vocabulary cards, and illustration ideas
- [ ] If generation fails: red alert with plain teacher copy (no “mock”, “API key”, or stack traces)
- [ ] **Back to review** available from empty/error state when plan exists

---

## 6. Save generated story

**Happy path (normal):**

- [ ] After mock generation succeeds, you land on story detail without tapping **Save story** manually
- [ ] Status badge **Saved**; header shows page/word counts

**Save failure path (optional — simulate offline or block storage if needed):**

- [ ] Generation completes but save fails → stay on create **Your story** step
- [ ] Amber alert with friendly save message (not raw storage error)
- [ ] **Save story** saves and opens detail; **Story saved…** status on actions bar
- [ ] **View story** / **Edit story** enabled after save

---

## 7. Reopen generated story

- [ ] **Your stories** → **View story** on a finished story → correct detail page
- [ ] **Continue editing** on a plan-only story → create flow with plan (not detail)
- [ ] Direct URL `/dashboard/create?draftId=<id>` for a generated story → **Your story** step with preview
- [ ] Direct URL `/dashboard/create?draftId=<id>` for a plan-only story → plan form or review as expected
- [ ] Browser back/forward between list and detail works without losing saved data

---

## 8. Story detail route

**Route:** `/dashboard/stories/:storyId`

### View mode (generated story)

- [ ] Title, summary, **Saved** badge, page/word counts, **Ready for class** pill
- [ ] **View mode** banner — “Ready to read with your class”
- [ ] **Story details** and **Your lesson plan** sections populated
- [ ] **Story for your class**, **Vocabulary cards**, **Illustration ideas** sections render
- [ ] **← Back to stories** and **Open in creator** work
- [ ] **Edit story** → amber **Edit mode** banner; inline fields editable
- [ ] Change text → **Save changes** enabled → save → changes persist after refresh
- [ ] **Cancel editing** restores original text
- [ ] Navigate away with unsaved edits → confirmation prompt
- [ ] **Duplicate story** → new story opens at new URL
- [ ] **Delete story** → confirm dialog → returns to **Your stories**; story gone
- [ ] **Story ideas** shows **Coming soon** (disabled)

### Setup-only story (plan saved, not generated)

- [ ] Description explains saved story plan; **Continue editing** in nav
- [ ] Content sections show empty-state messages (not a crash)
- [ ] **Delete story** still works

### Legacy edit URL

- [ ] `/dashboard/stories/:storyId/edit` redirects to detail with edit mode on

### Invalid routes

- [ ] Bad `storyId` (e.g. `/dashboard/stories/not%20valid!`) → friendly “Story link not recognized” or load error
- [ ] Deleted or unknown id → **Story not found** + **Back to stories**

---

## 9. Empty states

- [ ] **Your stories** with no user stories → **No stories yet** card, three hints, **Create your first story** button
- [ ] **Sample story** section always visible below the library (demo content, not deletable)
- [ ] Create flow **Your story** step before generation → **Your story is not ready yet**
- [ ] Detail sections with no data (setup-only) → section-specific empty messages, not blank crashes

---

## 10. Error states

- [ ] Break network (offline) → reload **Your stories** → error card + **Try again** (plain copy)
- [ ] Delete failure → error on list with **Dismiss**
- [ ] Detail load failure → **Back to stories** (no internal error strings)
- [ ] Cloud story opened while signed out → sign-in guidance (no Supabase/RLS jargon)
- [ ] Create flow generation/save errors — teacher-friendly sentences only
- [ ] Account sign-in wrong password → “Email or password is incorrect…” (not raw auth payload)

---

## 11. Mobile layout checks

Test at ~375px width (browser devtools device mode).

- [ ] **Menu** button visible; sidebar slides in as overlay
- [ ] Tap backdrop or nav link closes sidebar
- [ ] Page content readable without horizontal scroll
- [ ] Story library cards stack; action buttons usable (full-width on narrow screens)
- [ ] Create flow form fields and review actions stack cleanly
- [ ] Story detail action bar buttons stack/wrap; edit form fields usable
- [ ] Header: storage badge and sign-in/sign-out fit without overlap

---

## 12. Build check

From project root:

```bash
npm run build
```

- [ ] TypeScript compile succeeds (`tsc -b`)
- [ ] Vite production build completes with no errors
- [ ] (Optional) `npm run dev` still starts after build

---

## Quick regression matrix

| Feature | Local | Cloud |
|---------|-------|-------|
| Save plan | ☐ | ☐ |
| Generate (mock) | ☐ | ☐ |
| View detail | ☐ | ☐ |
| Edit + save | ☐ | ☐ |
| Duplicate | ☐ | ☐ |
| Delete | ☐ | ☐ |
| Migration prompt | n/a | ☐ |

---

## Related docs

- [story-detail-flow.md](./story-detail-flow.md)
- [story-generation-flow.md](./story-generation-flow.md)
- [phase-4-cloud-storage-testing.md](./phase-4-cloud-storage-testing.md)
- [phase-4-auth-and-cloud-storage.md](./phase-4-auth-and-cloud-storage.md)
- [phase-7-progress.md](./phase-7-progress.md)

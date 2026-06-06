# Phase 3 — Progress

Status of the dashboard shell, **stories** feature (`src/features/stories/`), and **story-generator** workflow layer (`src/features/story-generator/`).

The original project wizard under `/projects/*` remains intact and unchanged.

---

## 1. Current Phase 3 status

Phase 3 is **complete through 3.8** for local-first teacher workflows. The dashboard shell, Create Story flow, Stories list, story detail, edit mode, and shared workflow state (Zustand) are working with **mock generation** and **`localStorage` persistence**.

Teachers can: create setup → save draft → generate → save story → view on Stories → edit generated text → save changes — all on this device.

No backend, account sync, or real AI generation is connected yet.

---

## 2. Completed features

### Dashboard shell

- **`DashboardLayout`** — sidebar (desktop), mobile overlay, header, and `<Outlet />` for dashboard routes

### Stories feature scaffold

- **`src/features/stories/`** — UI components, domain types, mocks, and story helpers
- **`src/features/story-generator/`** — Zustand workflow store, storage abstraction, draft hook
- **Story domain types** — `StorySetupInput`, `StoryPlanReview`, `GeneratedStory`, `StoryProject`, pages, flashcards, image prompts
- **Mock story data** — `mockGeneratedStory`, `mockStoryProject` (Nina & Nino fire station field trip, 12 pages)

### Stories page (`/dashboard/stories`)

- **Recent stories** — local drafts plus `mockStoryProject`, sorted by `updatedAt`
- **`StoryProjectCard`** — **Draft**, **Saved story**, **Mock draft** badges
- **Continue editing** / **View story** / **View preview** / **Delete**

### Story detail & edit

- **`StoryDetailPage`** — `/dashboard/stories/:storyId`
- **`StoryEditPage`** — `/dashboard/stories/:storyId/edit`

### Create Story flow (`/dashboard/create`)

- Setup → review → save draft → mock generate → save story
- Shared workflow state in Zustand; step/form UI state stays local

### Supporting components & utilities

| Component / util | Role |
|------------------|------|
| `StoryReadOnlyView` / `StoryEditForm` | Read and edit generated content |
| `story-generator/lib/story-storage.ts` | `localStorage` CRUD abstraction |
| `useStoryGeneratorStore` | Shared workflow state (Zustand) |
| `useStoryDraft` | Store + storage bridge for drafts |
| `useStoryGeneratorSelectors` | Narrow Zustand subscriptions (`useSetupData`, etc.) |
| `features/stories/utils/storyStorage.ts` | Re-exports storage layer (backward compatible) |

---

## Phase 3.5 — Local draft persistence

### Completed

- **`storyStorage` utilities** — safe read/write; never throws
- **Save draft / save story** — setup and generated output in `localStorage`
- **Stories list** — load, delete, status badges, upsert on re-save
- **Continue editing** — setup-only drafts via `/dashboard/create?draftId=<id>`
- **View story** — saved stories via `/dashboard/stories/:storyId`

### Current local flow

```
Create Story → Review → Save draft → Generate → Save story → Stories → View story → Detail → Edit → Save changes
```

### Limitations

- Device/browser only — no sync, no Supabase, no cross-device access
- Generation still uses mock output until AI is wired
- Export remains a placeholder on the Create Story output step

---

## Phase 3.6 — Edit mode for generated stories

### Completed

- **Edit route** — `/dashboard/stories/:storyId/edit`
- **Editable** — page text, flashcard words, image prompts
- **Save / Cancel** — back to read-only detail
- **`StoryDetailPage`** — **Edit story** button

### Unchanged

- Create Story flow, Continue editing, View story, mock sample preview

---

## Phase 3.7 — Zustand story workflow state

### Completed

- **Zustand installed**
- **`useStoryGeneratorStore`** — shared workflow state:
  - `setupData`
  - `generatedStory`
  - `activeDraftId`
  - `createdAt`
- **Local component state kept for:** form fields, step state, modal state, temporary UI toggles
- **`story-generator/lib/story-storage.ts`** — storage abstraction (no direct `localStorage` in pages)
- **`useStoryDraft.ts`** — hook bridge between store and storage
- **`CreateStoryPage`** — uses Zustand for shared workflow state
- **`StoryDetailPage`**, **`StoryEditPage`**, **`StoriesPage`** — use storage abstraction
- **`features/stories/utils/storyStorage.ts`** — re-exports from story-generator for backward compatibility
- **Existing flows unchanged** — `npm run build` passes

---

## Phase 3.8 — Cleanup and boundary check

### Completed

- **Story generator boundaries are now clearer:**
  - `types/` — shared types only
  - `stores/` — Zustand workflow state only
  - `hooks/` — orchestration / wiring
  - `lib/` — storage, I/O, and transforms
  - `pages/` — composition
  - `components/` — UI
- **Only `story-generator/lib/story-storage.ts` touches:**
  - `localStorage`
  - `JSON.parse` / `JSON.stringify`
  - storage keys
- **Pages now use storage APIs such as:**
  - `getStoryDrafts`
  - `getStoryDraft`
  - `loadDraftWithGeneratedStory`
  - `saveStoryDraft`
- **Imports** — `@/` aliases used consistently in dashboard and story-generator files
- **Flow boundaries remain isolated:**
  - Create Story
  - Review
  - Generate
  - Stories list
  - Story detail
  - Story edit
- **Architecture is ready for Supabase integration**
- **`npm run build` passes**

---

## 3. Current user flow

### Create Story (`/dashboard/create`)

```
Story setup → Review → [Save draft] → Confirm → Generated preview → Save story
```

### Stories (`/dashboard/stories`)

```
Recent stories → Continue editing (drafts) | View story (saved) | View preview (mock)
Story detail → Edit story → Save changes → back to detail
```

### Key routes

| Route | Purpose |
|-------|---------|
| `/dashboard/create` | New story wizard |
| `/dashboard/create?draftId=` | Reopen draft in create flow |
| `/dashboard/stories/:storyId` | Read saved story |
| `/dashboard/stories/:storyId/edit` | Edit saved story content |

---

## 4. Current mock-only behavior

| Action | Behavior |
|--------|----------|
| Confirm story plan | Mock loading → `mockGeneratedStory` |
| Edit / Export (Create Story output) | `console.log` placeholder |
| Generation | `setTimeout` (~1.5s), not an API call |
| Persistence | `localStorage` via `story-storage.ts` |

---

## 5. What is intentionally not connected yet

- **Supabase** — no auth, database, or cloud sync
- **AI generation** — new create flow does not call `story-generation` services yet
- **Image generation** — prompts are text only
- **Export** — placeholder
- **Migration from `/projects/*`** — legacy wizard still in `story-projects` / `story-generation`

---

## 6. Recommended next steps

1. **Wire real AI generation** — replace mock timeout via existing `story-generation` boundary (fixture mode first)
2. **Add Supabase** — when teacher accounts and cross-device sync are needed
3. **Export story** — PDF or printable output from saved stories

---

## Related docs

- [phase-3-stories-feature.md](./phase-3-stories-feature.md) — folder map and migration notes
- [teacher-setup-flow.md](./teacher-setup-flow.md) — existing wizard setup (story-projects)
- [story-generation-flow.md](./story-generation-flow.md) — AI boundary and fixture mode

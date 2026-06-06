# Phase 8 — Progress

Teacher workflow polish and production readiness for the **dashboard story app** (`/dashboard/*`).

**Phase 8 is complete through 8.7.**

Phase 8 did **not** add new AI features or change storage architecture. It made the existing create → save → list → detail → edit flow clearer, safer, and easier to QA before wider classroom use.

---

## 1. Current status

Teachers can:

- Plan a story, save a **story plan**, and generate a classroom story (mock mode by default)
- See consistent status labels (**Story plan**, **Ready to save**, **Saved**) across create, list, and detail
- Browse **Your stories** with improved loading, empty, and error states
- Open setup-only plans or finished stories on the detail page without crashes
- Leave the create flow safely when unsaved work would be lost
- Sign in (when Supabase is configured) and optionally copy browser-saved stories to their account
- Read plain-language UI copy — no developer terminology in teacher-facing screens

**Production readiness:** The app builds cleanly (`npm run build`), has a manual QA checklist, and handles common failure paths with teacher-safe messages. That does **not** mean AI generation or cloud storage are fully production-hardened (see §5).

---

## 2. Completed work

### Phase 8.1 — Dashboard quality pass

- **`StoriesPage`** — user stories only in the library; sample story stays in a separate **Sample story** section
- **`LoadingState`** while stories load; clearer list header copy
- **`StoryEmptyState`** — hints and icon for first-time teachers
- **`StoryProjectCard`** — scan line (age · topic · created); storage badge in section header via **`StorageStatusIndicator`**

### Phase 8.2 — Story detail polish

- **`fetchStoryForDetail()`** — returns generated content or a **setup-only** draft shell
- Setup-only drafts render plan + empty content sections instead of erroring
- **`StoryDetailNav`**, **`StoryDetailSectionFallback`**, **`displayDetailValue()`**
- Section headings and empty states tuned for classroom reading (pages, vocabulary cards, illustration ideas)

See [story-detail-flow.md](./story-detail-flow.md).

### Phase 8.3 — Story status labels

- **`deriveStoryStatus()`** / **`storyStatus.ts`** — labels from existing project fields (no schema change)
- **`StoryStatusBadge`** on cards, detail header, and create-flow review
- **`getStoryProjectStatusLabel()`** delegates to the shared helper

| Status | When |
|--------|------|
| **Story plan** | Setup saved; no generated pages yet |
| **Ready to save** | Generated in create flow; not persisted |
| **Saved** | Generated content stored on the project |
| **Sample story** | Demo content on the dashboard only |

### Phase 8.4 — Create-flow navigation guards

- **`shouldWarnLeaveCreateStoryFlow()`** / **`createStoryNavigation.ts`**
- **`useCreateStoryNavigationGuard`** — blocks leaving `/dashboard/create` + `beforeunload`
- Wired in **`useCreateStoryPageState`**; **`StorySetupForm`** reports live values via **`onValuesChange`**
- Warns on unsaved plan or unsaved generated story; no warn for empty form, saved story, or in-flow step changes

### Phase 8.5 — Teacher copy review

- Plain teacher language across create, review, generate, dashboard, detail, account, and migration UI
- Removed visible terms like adapter, mock, Supabase, migration, payload, read-only preview, AI actions
- **`formatTeacherFacingGenerationError`**, **`formatTeacherFacingSaveError`**, **`formatTeacherFacingAuthError`**, **`formatTeacherFacingMigrationCopyFailure`** in **`story-route-guards.ts`**
- Storage badge copy: **Saved here** / **Your account** (`storageStatus.ts`)
- Button labels aligned: **Save plan**, **Generate story**, **Story ideas** (coming soon)

Internal code names (adapters, mock providers, migration maps) were **not** renamed.

### Phase 8.6 — Manual QA checklist

- **[phase-8-qa-checklist.md](./phase-8-qa-checklist.md)** — checkbox smoke test for local flow, cloud flow, migration, create/save/reopen, detail, empty/error states, mobile layout, and build

### Phase 8.7 — Documentation

- This progress doc

---

## 3. What changed (summary)

| Area | Change |
|------|--------|
| **Stories dashboard** | Clear library vs sample; better load/empty/error UX |
| **Story detail** | Setup-only and generated paths; softer section empty states |
| **Status** | One shared label system for cards, detail, and create flow |
| **Create flow** | Navigation guards; warmer step copy and button labels |
| **Errors** | User-safe messages for load, save, delete, auth, generation, migration |
| **Account / storage UI** | Teacher-facing storage badge and sign-in copy |
| **QA** | Repeatable manual checklist for releases |

---

## 4. What intentionally did not change

| Area | Why unchanged |
|------|----------------|
| **Storage architecture** | Still `pages → hooks → storyStorageApi / story-storage → resolveStoryStorageAdapter() → local \| supabase` |
| **AI generation pipeline** | Same `storyGenerationService` + providers; default remains **mock** (`VITE_GENERATION_MODE=mock`) |
| **Story actions bar AI slot** | **Story ideas** still coming soon — not wired to generation |
| **Legacy `/projects/*` routes** | Separate story-projects flow; not part of Phase 8 polish |
| **Database schema** | Status derived from existing fields; no new tables or columns |
| **Export / print** | Create flow **Export story** still logs only; no detail export |
| **Story memory, guidance, validation panels** | Scaffolded modules not mounted on dashboard pages |
| **Autosave while editing** | Manual save on detail edit only |
| **Server-side AI API** | No backend route; OpenAI key still env-based for dev AI mode only |

Phase 7’s originally suggested “Phase 8 = AI-assisted detail actions” was **deferred**. Phase 8 prioritized teacher UX and release confidence instead.

---

## 5. Known limitations

### Teacher workflow

| Limitation | Detail |
|------------|--------|
| **Editing** | No autosave; no add/remove pages; lesson plan read-only on detail |
| **Export** | Not implemented from detail; create export is a stub |
| **Duplicate** | Title suffix `(Copy)` only |
| **Sample story** | Demo block on Stories page — not in the library; not deletable |
| **Create preview** | Successful generate often auto-saves and jumps to detail; preview step mainly for save retry or loaded drafts |

### AI generation (not production-ready)

| Limitation | Detail |
|------------|--------|
| **Default mode** | **Mock** — reliable for demos and QA, not unique AI output |
| **AI mode** | `VITE_GENERATION_MODE=ai` calls OpenAI from the **browser** with `VITE_OPENAI_API_KEY` — suitable for dev/testing only |
| **No server boundary** | No deployed `POST /api/story-generation`; secrets and rate limits are not production-grade |
| **Fallback** | AI failures fall back to mock inside the service — teachers may not know output was not from AI |
| **Detail AI** | Regenerate / simplify / expand not implemented |

Do **not** ship AI mode to classrooms without a server-side provider and product review.

### Supabase auth & cloud storage (working, not “complete”)

| Limitation | Detail |
|------------|--------|
| **Feature flag** | Cloud storage requires `VITE_ENABLE_SUPABASE_STORIES=true` plus env URL/key |
| **Sign-in UX** | Settings account panel; header sign-in/out — no full password reset / org admin flows |
| **Local ↔ cloud** | Sign out → new saves local again; account stories stay in cloud; no automatic merge |
| **Migration** | Optional **copy to account**; local copies remain; dismiss per fingerprint; not a full sync product |
| **Conflict** | Last-write-wins; no multi-device merge or offline queue |
| **Ops** | No monitoring, backup runbooks, or RLS audit documented in-app |

Cloud CRUD works when configured and signed in (see [phase-4-cloud-storage-testing.md](./phase-4-cloud-storage-testing.md)), but treat it as **beta infrastructure**, not finished SaaS storage.

---

## 6. Architecture (unchanged)

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard UI (Create, Stories, Detail, Settings)           │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Hooks (create state, useStoryDetail, useStoryEditor, …)    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  storyStorageApi / story-storage.ts                         │
│  storyGenerationService (mock | AI + fallback)                │
└───────────────────────────┬─────────────────────────────────┘
                            │
              resolveStoryStorageAdapter()
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
   localStorage                          Supabase (flag + session)
```

Phase 8 additions sit mostly in **UI copy**, **route/error guards**, **status helpers**, and **navigation guards** — not new persistence or provider layers.

---

## 7. Recommended Phase 9 direction

Pick based on product priority; all assume Phase 8 QA checklist passes on target env.

### Option A — AI & guidance (extends Phase 7 roadmap)

1. Mount **`StorySuggestionsPanel`** on detail (validation + teacher guidance)
2. Wire first **Story ideas** action (e.g. regenerate one page) behind **`StoryActionsBar`**
3. Pass **`buildStoryContext`** into generation/regenerate services
4. Add **server-side** story generation API — move OpenAI off the client

### Option B — Classroom output

1. **Export / print** from detail (PDF or printable HTML)
2. Optional **read-aloud** or presentation layout for story pages
3. Debounced **autosave** while editing

### Option C — Cloud hardening

1. Stronger sign-in flows (reset password, session expiry copy)
2. Migration improvements (progress, conflict messaging)
3. Automated tests for adapter resolver and CRUD happy paths

**Practical default:** **Option A (step 4 first)** if real AI is the goal — server boundary before more teacher-facing AI buttons. **Option B** if mock stories are enough for pilots and teachers need printouts.

---

## 8. Key files (Phase 8)

| Area | Path |
|------|------|
| Stories dashboard | `app/pages/StoriesPage.tsx` |
| Create flow state | `app/pages/create-story/useCreateStoryPageState.ts` |
| Create navigation guards | `features/stories/lib/createStoryNavigation.ts` |
| Create nav hook | `features/stories/hooks/useCreateStoryNavigationGuard.ts` |
| Story status | `features/stories/utils/storyStatus.ts` |
| Status badge | `features/stories/components/StoryStatusBadge.tsx` |
| Detail load | `features/stories/api/storyStorageApi.ts` (`fetchStoryForDetail`) |
| Detail page | `features/stories/pages/StoryDetailPage.tsx` |
| Route / teacher errors | `features/story-generator/lib/story-route-guards.ts` |
| Storage status UI | `features/story-generator/lib/storage/storageStatus.ts` |
| Migration prompt | `app/components/LocalStoryMigrationPrompt.tsx` |
| QA checklist | `docs/phase-8-qa-checklist.md` |

---

## Related docs

- [phase-8-qa-checklist.md](./phase-8-qa-checklist.md)
- [phase-7-progress.md](./phase-7-progress.md)
- [story-detail-flow.md](./story-detail-flow.md)
- [story-generation-flow.md](./story-generation-flow.md)
- [phase-5-progress.md](./phase-5-progress.md)
- [phase-4-auth-and-cloud-storage.md](./phase-4-auth-and-cloud-storage.md)
- [phase-4-cloud-storage-testing.md](./phase-4-cloud-storage-testing.md)
- [architecture.md](./architecture.md)

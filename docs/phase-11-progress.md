# Phase 11 — Progress

Dedicated **story editing layer** for the dashboard app — separate from generation preview and read-only detail view. Teachers edit pages, vocabulary, and illustration notes on `/dashboard/stories/:storyId/edit` with autosave, version snapshots, pre-save validation, a toolbar, and edit/preview mode switching.

**Phase 11 is complete for the core editor feature set.**

Phase 11 did **not** change storage adapters, Supabase schema, auth, or migration logic. Persistence still flows through `storyStorageApi` → active adapter. Version history is **in-memory** unless a `StoryVersionStore` is wired later.

---

## 1. Current status

Teachers can:

- Open **Edit story** from the library (`/dashboard/stories/:storyId/edit`)
- Edit story content page-by-page with inline card validation
- See **autosave status** (unsaved / saving / saved / error) and **Save** manually
- **Undo changes** back to the last persisted baseline (with confirm)
- **Restore previous versions** from in-session snapshots
- Switch between **Edit mode** and **Preview mode** without losing scroll position or unsaved work
- Use a sticky **editing toolbar** (Save, Undo, Restore version, mode toggle, Exit editing)
- Leave editing with unsaved-change guards (`beforeunload` + confirm dialogs)

**Legacy path:** `StoryDetailPage` still supports inline edit via `StoryEditForm` and explicit Save — no autosave or version history on that path yet.

**Build:** `npm run build` passes after Phase 11.

---

## 2. Completed systems

| System | Summary | Key paths |
|--------|---------|-----------|
| **Editing session** | Clones generated output into a mutable working copy; baseline recoverable via `restoreOriginal()` | `useStoryEditor`, `createEditorSession`, `StoryEditorPage` |
| **Page card editor** | One active page editor at a time; per-field validation before commit | `EditableStoryPagesEditor`, `EditableStoryPageCard`, `useEditablePageCardState` |
| **Autosave** | Debounced, serialized writes through validated persist | `useStoryAutosave`, `StoryAutosaveStatus` |
| **Pre-save validation** | Blocking checks before any persist (manual or autosave) | `validateStoryForSave`, `persistValidatedStoryEdits` |
| **Version history** | Snapshots before major edits; restore replaces working copy | `useStoryVersionHistory`, `StoryVersionList`, `storyVersionUtils` |
| **Editing toolbar** | Dumb UI; actions wired via hook | `StoryEditingToolbar`, `useStoryEditingToolbar` |
| **Edit / preview switching** | Both panels stay mounted; scroll preserved per mode | `useStoryEditorViewMode`, `StoryEditorViewSwitcher`, `StoryEditorModeToggle` |
| **Route** | Dedicated edit page re-exported as `StoryEditPage` | `router.tsx`, `src/app/pages/StoryEditPage.tsx` |

---

## 3. Editing architecture

### Layer separation

```
Generation / create preview          Read-only detail
        │                                    │
        └──────────►  story-editor  ◄────────┘
                         │
              useStoryEditor (session)
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
  EditableStoryPages   Autosave      Version history
       Editor          hook            (in-memory)
         │               │               │
         └───────────────┴───────────────┘
                         │
              persistValidatedStoryEdits
                         │
                 storyStorageApi → adapter
```

### Session model (`StoryEditorSession`)

- **`originalGenerated`** — baseline loaded at session start (last successful persist after autosave/manual save via `markPersisted`)
- **`editable`** — working copy passed to edit components; never mutated in place (clone on apply)
- **`revision`** — increments on each commit; drives autosave debounce
- **`isDirty`** — `editable` differs from `originalGenerated` (`storyContentEqual`)

### UI composition rules

- **Toolbar stays dumb** — `StoryEditingToolbar` receives props only; `useStoryEditingToolbar` owns save/undo/exit/mode handlers
- **Pages do not call adapters directly** — all writes go through `persistValidatedStoryEdits`
- **Preview is not the generation preview** — edit preview uses `StoryReadOnlyView` with a snapshot taken when entering preview mode

### Edit page layout

1. `PageHeader` + validation/error banners
2. `StoryEditingToolbar` (sticky)
3. `StoryEditorViewSwitcher`
   - **Edit panel** — `StoryVersionList` + `EditableStoryPagesEditor`
   - **Preview panel** — `StoryReadOnlyView` (snapshot)

---

## 4. Autosave behavior

**Hook:** `useStoryAutosave`  
**Default debounce:** `1500 ms` (`STORY_EDITOR_AUTOSAVE_DEBOUNCE_MS`)

| Behavior | Detail |
|----------|--------|
| **Trigger** | Runs when `isDirty` and `revision` changes, after debounce |
| **Serialization** | Saves chained via internal promise queue — no overlapping adapter writes |
| **Skip unchanged** | Normalizes content and compares to last successful persist; skips if equal |
| **Manual save** | `flushSave()` cancels debounce timer and persists immediately |
| **On success** | `markPersisted()` syncs session baseline; status → `saved` or `pending` if user edited during save |
| **On validation failure** | Throws `StorySaveValidationFailure`; status → `error`; page shows inline warning (no adapter call) |
| **On adapter error** | Status → `error`; page shows classified load/save error |
| **Navigation** | `cancelScheduledSave()` called before exit to avoid save-after-leave races |
| **Teacher labels** | `idle` (hidden), `pending` → “Unsaved changes”, `saving` → “Saving…”, `saved` → “Saved”, `error` → “Failed to save” |

Manual **Save** in the toolbar also validates, shows feedback toast, reloads detail data, and navigates back to the story detail page.

---

## 5. Versioning model

**Scope:** Per-story, in-session (React state). Optional `StoryVersionStore` interface exists for future localStorage/Supabase persistence — **not mounted** in Phase 11.

| Concept | Behavior |
|---------|----------|
| **Cap** | Max **10** entries (`DEFAULT_STORY_VERSION_LIMIT`); newest first |
| **Seed** | One `session-open` snapshot when editor loads (if history empty) |
| **Capture triggers** | `before-page-edit` (before card commit), `before-restore` (before version restore) |
| **Dedup** | Content hash (`createStoryContentHash`) — identical snapshot to latest is skipped |
| **Restore** | Replaces working copy via `replaceEditable()`; does not delete history entries |
| **No-op restore** | Skipped when selected version matches current content (`wouldRestoreChangeContent`) |
| **Confirm** | Unsaved edits require confirm before restore |
| **Toolbar “Restore version”** | Switches to edit mode and scrolls to `#story-version-history` |

### Version reasons

| Reason | Label use |
|--------|-----------|
| `session-open` | When you opened the editor |
| `before-page-edit` | Before page edit (includes page number in label) |
| `before-restore` | Before version restore |
| `manual-checkpoint` | Reserved for future explicit checkpoints |

---

## 6. Validation rules

Validation is **pure** (`storyValidation.ts`) — no UI or adapter imports. Used by `persistValidatedStoryEdits` for both autosave and manual save.

### Pre-save (story-level) — blocking

| Code | Rule | Default |
|------|------|---------|
| `missing_page_text` | Every page must have non-empty trimmed text | On |
| `page_too_long` | Page word count ≤ **250** | `maxPageWords: 250` |
| `empty_flashcard` | Each card needs word + definition (or fully empty row flagged) | On |
| `duplicate_vocabulary` | Normalized vocabulary words must be unique | On |
| `missing_image_prompt` | Every page needs a non-empty illustration prompt | On |

Helpers: `validateStoryForSave`, `assertStoryValidForSave`, `getStorySaveValidationMessages`, `StorySaveValidationFailure`.

**Not yet wired:** `assertStoryValidForSave` in the AI generation pipeline (generation can still produce content that fails save until teacher fixes it).

### Per-page card (inline) — before commit

| Field | Rule |
|-------|------|
| Teaching focus | Max **200** characters |
| Page text | Required; min **1** word |
| Illustration prompt | Required; max **2000** characters |
| Continuity note | Max **500** characters |
| Flashcards (page 1 only) | Word and definition required per card |

Card validation lives in `validateEditablePageCard.ts` — separate from story-level save validation.

---

## 7. Known limitations

| Area | Limitation |
|------|------------|
| **Version persistence** | History lost on full page reload or new tab; no `StoryVersionStore` implementation shipped |
| **Dual edit paths** | Dedicated edit page has autosave + versions; **detail inline edit** still uses legacy `StoryEditForm` without autosave/version UI |
| **Preview freshness** | Preview shows snapshot from last **enter preview** — not live-updated while staying in edit mode (by design, reduces rerenders) |
| **Scroll alignment** | Edit vs preview layouts differ; scroll is restored per mode on `window`, not per-page anchor |
| **Generation validation** | AI output is not validated at generation time |
| **Export / print** | Still disabled (“coming soon”) — unchanged from Phase 10 |
| **Story suggestions / analytics** | Still not mounted — unchanged from Phase 10 |
| **E2E tests** | No automated tests for edit → autosave → restore → preview flows |
| **Cloud conflict** | No multi-device merge; last write wins via existing adapter behavior |

---

## 8. Next phase suggestions

Pick based on product priority:

### Option A — Persist version history (recommended for editor trust)

1. Implement `StoryVersionStore` (localStorage first, optional Supabase table)
2. Survive reload and reopen from library
3. Teacher-facing copy for “versions saved on this device”

*Best if teachers need undo across sessions.*

### Option B — Unify edit experience

1. Redirect detail **Edit pages** to `/edit` route (or mount full editor on detail)
2. Retire or thin `StoryEditForm` inline path
3. Shared toolbar + preview on one surface

*Best if two edit UX paths cause confusion.*

### Option C — Classroom output (Phase 10 carryover)

1. Export / print PDF or printable HTML from detail or preview mode
2. Wire disabled Export buttons

*Best if deliverables for class are the top ask.*

### Option D — Quality & pipeline hardening

1. Wire `assertStoryValidForSave` after AI generation (with teacher-friendly fix hints)
2. E2E tests: create → save → edit → autosave → validation block → restore
3. Mount `StorySuggestionsPanel` on edit or detail

*Best before wider classroom pilot.*

**Practical default:** **Option A** or **B** — completes the editing investment from Phase 11; export can parallel if needed.

---

## 9. Changed / new files (Phase 11)

### Feature module — `src/features/story-editor/`

| Area | Files |
|------|-------|
| Page | `StoryEditorPage.tsx` |
| Hooks | `useStoryEditor.ts`, `useStoryAutosave.ts`, `useStoryVersionHistory.ts`, `useStoryEditingToolbar.ts`, `useStoryEditorViewMode.ts`, `useEditablePageCardState.ts` |
| Components | `EditableStoryPageCard.tsx`, `EditableStoryPagesEditor.tsx`, `StoryEditingToolbar.tsx`, `StoryEditorModeToggle.tsx`, `StoryEditorViewSwitcher.tsx`, `StoryAutosaveStatus.tsx`, `StoryVersionList.tsx` |
| Types | `storyEditor.types.ts`, `editablePage.types.ts`, `storyVersion.types.ts` |
| Utils | `createEditorSession.ts`, `cloneEditableStory.ts`, `storyContentEqual.ts`, `applyPageCommit.ts`, `applyStoryEditorMutations.ts`, `validateEditablePageCard.ts`, `storyVersionUtils.ts`, `storyAutosaveStatus.ts`, `countStoryWords.ts` |

### Stories feature integration

| File | Change |
|------|--------|
| `src/features/stories/utils/storyValidation.ts` | Pre-save validation rules |
| `src/features/stories/api/storyStorageApi.ts` | `persistValidatedStoryEdits` |
| `src/features/stories/pages/StoryDetailPage.tsx` | Validated save on inline edit |
| `src/features/stories/hooks/useStoryEditor.ts` | Re-export shim to `story-editor` |
| `src/app/pages/StoryEditPage.tsx` | Re-export `StoryEditorPage` |
| `src/app/router.tsx` | `/dashboard/stories/:storyId/edit` route |

---

## Related docs

- [phase-10-progress.md](./phase-10-progress.md) — UX polish before editor work
- [phase-8-progress.md](./phase-8-progress.md) — storage and auth foundations
- [story-detail-flow.md](./story-detail-flow.md) — detail read/edit routing
- [story-generation-flow.md](./story-generation-flow.md) — create vs edit boundaries

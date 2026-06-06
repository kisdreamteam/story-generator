# Phase 7 — Progress

Story detail, editing, actions, and storage operations for saved dashboard stories.

**Phase 7 is complete through 7.4** for local and cloud adapters.

---

## 1. Current status

Teachers can:

- Open a saved story at `/dashboard/stories/:storyId`
- Edit generated pages, flashcards, and image prompts inline
- Save changes without losing setup or project identity
- Duplicate a story as a new draft
- Delete local or cloud stories (with confirmation)
- Navigate away safely when edits are unsaved

All persistence goes through the adapter layer — no direct storage access from UI.

---

## 2. Completed work

### Phase 7.1 — Story detail architecture

- **`StoryDetailPage`** — orchestration-only page
- **`useStoryDetail`** — load via `fetchStoryWithGeneratedContent`
- **`StoryDetailLoadGuard`** — loading, not-found, auth, and error shells
- **Presentational components** — `StoryHeader`, `StoryMetadata`, `StoryPages`, `StoryFlashcards`, `StoryImagePrompts`
- **Route guards** — `isValidStoryRouteId`, `classifyStoryLoadError`, `storyNotFoundPresentation`

See [story-detail-flow.md](./story-detail-flow.md).

### Phase 7.2 — Inline editing system

- **`useStoryEditor`** — clone, dirty tracking, field updaters, restore
- **`StoryEditForm`** — editable pages, flashcards, prompts
- **Inline edit mode** on detail page (replaces separate edit screen)
- **`/edit` route** — redirects to `?edit=1`
- **`useUnsavedStoryChanges`** — route blocker, `beforeunload`, story-id switch guard
- **`persistStoryEdits`** + **`mergeGeneratedStoryUpdate`** — save without overwriting setup/`createdAt`

See [editing-system.md](./editing-system.md).

### Phase 7.3 — Story actions bar

- **`StoryActionsBar`** — reusable, configurable actions via props
- Actions: Edit, Save, Cancel, Duplicate, Delete, AI placeholder (coming soon)
- Responsive layout — management actions vs workflow actions
- Wired on `StoryDetailPage`; reusable on future pages

### Phase 7.4 — Duplicate and delete

- **`buildDuplicatedStoryProject`** — clones content + continuity metadata; new id and timestamps
- **`duplicateStory`** API — save copy, navigate to new story
- **`deleteStory`** API — adapter-only delete for local and cloud
- **`confirmDeleteStory`** — shared confirmation dialog
- **`classifyStoryDeleteError`** — user-safe delete failures
- **Supabase delete** — resolves `draft-*` → UUID, verifies ownership, clears sync mappings
- **Stories list** — delete enabled for all non-mock stories

---

## 3. Architecture summary

```
┌─────────────────────────────────────────────────────────────┐
│  UI (StoryDetailPage, StoriesPage)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Hooks (useStoryDetail, useStoryEditor, useUnsaved…)        │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  storyStorageApi (features/stories/api/)                    │
│  fetch | persistStoryEdits | duplicateStory | deleteStory   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  story-storage.ts → resolveStoryStorageAdapter()            │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
    ┌───────────▼──────────┐      ┌───────────▼──────────────┐
    │ localStoryStorage    │      │ supabaseStoryStorage     │
    │ Adapter              │      │ Adapter                  │
    └──────────────────────┘      └──────────────────────────┘
```

Generation and create flows use the same storage boundary. Detail/edit never call AI providers.

---

## 4. Storage update flow

| Operation | API | Adapter method | Merge / notes |
|-----------|-----|----------------|---------------|
| Load detail | `fetchStoryWithGeneratedContent` | `loadDraftWithGeneratedStory` | Returns `{ draft, generatedStory }` |
| Save edits | `persistStoryEdits` | `updateStory` | `mergeGeneratedStoryUpdate` preserves identity + setup |
| Duplicate | `duplicateStory` | `saveStoryDraft` | New project via `buildDuplicatedStoryProject` |
| Delete | `deleteStory` | `deleteStoryDraft` | Local filter or cloud row delete + cascade |
| Initial save (generation) | `persistGeneratedStory` | `saveStoryDraft` | `buildProjectWithGeneratedStory` |

**Edit save invariant:** `id`, `createdAt`, and `setup` on the existing project are never replaced by edited generated content.

---

## 5. Adapter responsibilities

### `StoryStorageAdapter` / `StoryStorageAdapterAsync`

Defined in `features/story-generator/lib/storage/StoryStorageAdapter.ts`.

| Method | Local | Supabase |
|--------|-------|----------|
| `getStoryDrafts` | Read `localStorage` array | Query `story_projects` for owner |
| `getStoryDraft` | Find by id | Single row + children |
| `loadDraftWithGeneratedStory` | Draft + `generatedStoryFromProject` | Same mapping from rows |
| `saveStoryDraft` | Upsert in array | Upsert project + replace child rows |
| `updateStory` | Merge + save | Load, merge, save |
| `deleteStoryDraft` | Remove from array | Delete project (cascade children) |
| `clearStoryDrafts` | Clear key | Delete all for owner |

### Resolver (`resolveStoryStorageAdapter`)

- **Local** — default; also when Supabase flag off or user unsigned
- **Supabase** — when `VITE_ENABLE_SUPABASE_STORIES=true`, env configured, user signed in

### Id mapping (cloud only)

- Local `draft-*` ids map to cloud UUIDs in `sessionStorage` and `localStoryMigrationMap`
- Duplicate creates a **new** draft id — no mapping copied
- Delete clears mappings for the deleted local id when applicable

**UI rule:** Pages import `storyStorageApi` or `story-storage` public API — never adapters directly except migration utilities.

---

## 6. Future AI integration notes

Scaffolding exists for post-save and in-detail AI features. **None are wired to the detail page yet.**

| Module | Location | Intended use |
|--------|----------|--------------|
| **AI actions placeholder** | `StoryActionsBar` key `ai` | Regenerate page, simplify text, expand vocabulary |
| **Story context** | `features/story-context/` | `buildStoryContext()` — setup + continuity + memory for prompts |
| **Story memory** | `features/story-memory/` | Vocabulary/theme tracking per story id |
| **Story continuity** | `features/story-continuity/` | Series profiles for Nina & Nino catalog |
| **Story validation** | `features/story-validation/` | Post-generation/edit warnings (non-blocking) |
| **Teacher guidance** | `features/story-guidance/` | `buildTeacherGuidance()`, `StorySuggestionsPanel` |

### Recommended integration path (Phase 8+)

```
StoryDetailPage
  → StoryActionsBar (ai enabled)
  → useStoryAiActions (new hook — not implemented)
  → storyGenerationService or dedicated regenerate service
  → validateGeneratedStory / validateGeneratedStoryOutput
  → persistStoryEdits (partial page update)
  → extractStoryMemory + saveStoryMemory (after save/generate)
```

**Boundaries to preserve**

- UI → service/hook → provider — never provider from components
- AI regenerate should merge like manual edit (`updateStory`), not replace setup
- Pass `buildStoryContext({ setup, excludeStoryId })` into generation input for continuity
- Show validation warnings in `StorySuggestionsPanel` without blocking save

`StoryActionsBar` already supports `comingSoon` and per-action `hidden`/`disabled` for gradual rollout.

---

## 7. Limitations

| Area | Limitation |
|------|------------|
| **Editing** | No autosave; no add/remove pages; setup read-only on detail |
| **Duplicate** | Title suffix `(Copy)` only; no branch/fork metadata |
| **Delete** | Mock sample on Stories list cannot be deleted; no soft-delete/archive |
| **Memory** | `StoryMemory` not updated on save/edit/duplicate yet |
| **AI** | Actions bar placeholder only; no regenerate or inline AI |
| **Guidance** | `StorySuggestionsPanel` not mounted on detail/create |
| **Context** | `buildStoryContext` not passed into `storyGenerationService` yet |
| **Conflict** | Last-write-wins; no multi-device merge |
| **Export** | Not available from detail page |

---

## 8. Suggested next phase

**Phase 8 — AI-assisted detail actions**

1. Wire `StorySuggestionsPanel` on detail (validation + guidance)
2. Implement first AI action (e.g. regenerate single page) behind `StoryActionsBar`
3. Call `buildStoryContext` from generation/regenerate services
4. Persist story memory after generation and manual save
5. Optional debounced autosave while editing

---

## 9. Key files

| Area | Path |
|------|------|
| Detail page | `features/stories/pages/StoryDetailPage.tsx` |
| Storage API | `features/stories/api/storyStorageApi.ts` |
| Load hook | `features/stories/hooks/useStoryDetail.ts` |
| Editor hook | `features/stories/hooks/useStoryEditor.ts` |
| Unsaved guards | `features/stories/hooks/useUnsavedStoryChanges.ts` |
| Actions bar | `features/stories/components/StoryActionsBar.tsx` |
| Duplicate builder | `features/stories/utils/duplicateStoryProject.ts` |
| Merge on save | `features/story-generator/lib/storage/mergeStoryUpdate.ts` |
| Adapters | `features/story-generator/lib/storage/*` |
| Route guards | `features/story-generator/lib/story-route-guards.ts` |

---

## Related docs

- [story-detail-flow.md](./story-detail-flow.md)
- [editing-system.md](./editing-system.md)
- [story-generation-flow.md](./story-generation-flow.md)
- [phase-5-progress.md](./phase-5-progress.md)
- [phase-4-progress.md](./phase-4-progress.md)
- [architecture.md](./architecture.md)

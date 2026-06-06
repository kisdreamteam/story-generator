# Editing System

How teachers edit generated story content after save, and how changes persist without corrupting setup or project identity.

---

## Overview

Editing is **inline on the story detail page**. There is no separate edit screen.

| Mode | URL | UI |
|------|-----|-----|
| View | `/dashboard/stories/:storyId` | Read-only pages, flashcards, prompts |
| Edit | Same URL, or `?edit=1` on entry | `StoryEditForm` + save/cancel actions |

The legacy route `/dashboard/stories/:storyId/edit` redirects to `?edit=1`, which the detail page reads once and then strips from the URL.

---

## Architecture

```
StoryDetailPage
  ├── useStoryDetail          → source data from storage (immutable in UI)
  ├── useStoryEditor          → working copy (clone of generatedStory)
  ├── useUnsavedStoryChanges  → block navigation when dirty
  └── handlers
        ├── handleEnterEditMode
        ├── handleCancelEditing  → restoreOriginal()
        └── handleSaveChanges    → persistStoryEdits() → updateStory()
```

**Separation of concerns**

- **`useStoryEditor`** holds edit state only — it does not save.
- **The page** calls `persistStoryEdits()` on save.
- **Storage** merges content via `mergeGeneratedStoryUpdate()` — identity and setup stay intact.

---

## `useStoryEditor`

Location: `features/stories/hooks/useStoryEditor.ts`

| Export | Purpose |
|--------|---------|
| `originalStory` | Immutable snapshot from storage |
| `editedStory` | Working clone for the form |
| `isDirty` | JSON equality check vs original |
| `updatePageText` | Page text + recalculated word counts |
| `updateFlashcard` | Partial flashcard patch by index |
| `updateImagePrompt` | Partial prompt patch by page number |
| `restoreOriginal` | Reset clone (Cancel) |

**Options**

- `{ enabled: false }` — default on detail page until user clicks **Edit**. Prevents cloning until edit mode starts.
- `{ enabled: true }` — clone on mount (used when edit is always on).

Cloning uses `cloneGeneratedStory()` (structured clone via JSON). The hook never mutates `originalStory` or the object returned from `useStoryDetail`.

---

## Editable fields

`StoryEditForm` exposes:

- **Story pages** — `text` per page (word counts recomputed on change)
- **Flashcards** — word, simple definition, example sentence
- **Image prompts** — prompt text, continuity reminder

**Not editable in Phase 7**

- Teacher setup (`StorySetupInput`) — preserved on save; change requires create flow or future setup editor
- Title/summary at project level — updated indirectly when generated content title changes on save
- Page count structure — no add/remove page in edit mode

---

## Save flow

```
User clicks Save
  → withRecalculatedWordCounts(editedStory)
  → persistStoryEdits(draft.id, normalizedStory)   [storyStorageApi]
  → updateStory(id, generatedStory)                  [story-storage]
  → adapter.updateStory
  → mergeGeneratedStoryUpdate(existing, generatedStory)
  → attachGeneratedStoryToProject
  → adapter.saveStoryDraft (local) or upsert + child rows (supabase)
  → useStoryDetail.reload()
  → exit edit mode
```

### What `mergeGeneratedStoryUpdate` preserves

| Field | On save |
|-------|---------|
| `id` | Unchanged |
| `createdAt` | Unchanged |
| `setup` | Unchanged |
| `planReview` | Unchanged |
| Theme, age, language, lesson goal, vocabulary, setting, characters | Unchanged (from existing project) |
| `storyPages`, `flashcards`, `imagePrompts`, `generatedStory` | Updated from edited content |
| `updatedAt` | Set by `attachGeneratedStoryToProject` |

Setup metadata used for **generation continuity** is never overwritten by content edits.

---

## Cancel flow

```
User clicks Cancel
  → restoreOriginal()     (re-clone from sourceStory)
  → setIsEditing(false)
  → isDirty becomes false
```

No storage call. Unsaved guards release.

---

## Unsaved change protection

`useUnsavedStoryChanges` (`features/stories/hooks/useUnsavedStoryChanges.ts`) activates when `isEditing && isDirty`.

| Trigger | Behavior |
|---------|----------|
| In-app navigation | React Router `useBlocker` + confirm dialog |
| Browser refresh / close | `beforeunload` warning |
| Story id change in URL | Confirm or revert navigation to previous story |

Helpers in `features/stories/lib/unsavedStoryChanges.ts` keep messaging consistent.

The hook does **not** perform saves — it only warns.

---

## UI feedback

| State | UI |
|-------|-----|
| Editing | `StoryDetailModeBanner` — amber “Editing” banner |
| Dirty | Banner notes unsaved changes |
| Saving | Save button shows “Saving…”, actions disabled |
| Save error | `ErrorState` with `classifyStoryLoadError()` |
| Success | Exit edit mode, `reload()` refreshes read-only view |

---

## Storage adapter responsibilities (edit path)

Both adapters implement `updateStory(id, generatedStory)`:

### Local

1. Load existing draft from `localStorage`
2. `mergeGeneratedStoryUpdate`
3. Write back to `story-drafts` key

### Supabase

1. `requireUserId()` — auth gate
2. Load project row + child rows
3. `mergeGeneratedStoryUpdate`
4. Upsert project + replace child rows (`story_pages`, `story_flashcards`, `story_image_prompts`)

UI code does not branch on adapter type.

---

## Limitations

- No autosave — edits are lost if the tab closes without save (except `beforeunload` warning)
- No optimistic UI — save waits for adapter round-trip
- No concurrent edit detection — last write wins
- No version history or undo beyond Cancel within a session
- Setup fields are read-only on detail; editing setup requires reopening create flow or future work

---

## Future work

- **Setup editing** on detail or dedicated setup panel
- **Autosave** (debounced) while editing generated content
- **Regenerate page / section** via AI actions bar (see [phase-7-progress.md](./phase-7-progress.md))
- **Validation warnings** on save using `validateGeneratedStory()` from `features/story-validation/`
- **Story memory update** after save (`extractStoryMemory` + `saveStoryMemory`)

---

## Related docs

- [story-detail-flow.md](./story-detail-flow.md) — load, actions, duplicate, delete
- [phase-7-progress.md](./phase-7-progress.md) — Phase 7 scope and AI placeholders
- [phase-4-supabase-schema.md](./phase-4-supabase-schema.md) — normalized child tables for edits

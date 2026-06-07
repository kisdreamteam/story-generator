# Editing System

How teachers edit generated story content after save, and how changes persist without corrupting setup or project identity.

---

## Overview

Editing uses **two labeled surfaces** — pick the one that matches the task.

| Surface | Label | Where | Best for |
|---------|-------|-------|----------|
| **Quick edit** | Quick edit | Story detail (inline toggle) | Page text, flashcards, illustration prompts |
| **Advanced editor** | Advanced editor | `/dashboard/stories/:storyId/edit` | Add/remove/move pages, preview toggle, version history restore |

| Mode | URL | UI |
|------|-----|-----|
| View | `/dashboard/stories/:storyId` | Read-only pages, flashcards, prompts |
| Quick edit | Same URL, or `?edit=1` on entry | `StoryEditForm` + save/cancel |
| Advanced editor | `/dashboard/stories/:storyId/edit` | `StoryPageByPageEditor` + history panel |

Deep link `?edit=1` on the detail page opens **Quick edit** once, then strips the query param.

---

## Architecture

### Quick edit (detail page)

```
StoryDetailPage
  ├── useStoryDetail          → source data from storage
  ├── useStoryEditor          → working copy (clone of generatedStory)
  ├── useStoryDirtyState      → block navigation when dirty
  └── handlers
        ├── handleEnterEditMode     (Quick edit)
        ├── handleOpenAdvancedEditor → navigate to /edit
        ├── handleCancelEditing     → restoreOriginal()
        └── handleSaveChanges       → persistValidatedStoryEdits()
```

### Advanced editor

```
StoryEditorPage (/edit)
  ├── useStoryDetail
  ├── StoryEditor + StoryPageByPageEditor
  ├── StoryHistoryPanel       → restore prior snapshots
  └── saveStoryEditorChanges  → persistValidatedStoryEdits()
```

**Separation of concerns**

- Editor hooks hold edit state only — they do not save.
- Pages call `persistValidatedStoryEdits()` on save.
- Storage merges via `mergeGeneratedStoryUpdate()` — identity and setup stay intact.

---

## Save flow

```
User clicks Save
  → withRecalculatedWordCounts(editedStory)
  → appendStoryHistorySnapshotBeforeSave(id)   [before overwrite]
  → persistValidatedStoryEdits(id, story, baseline)
  → updateStory → mergeGeneratedStoryUpdate (version++)
  → reload / exit edit mode
```

### What `mergeGeneratedStoryUpdate` preserves

| Field | On save |
|-------|---------|
| `id`, `createdAt`, `setup`, `planReview` | Unchanged |
| Theme, age, language, lesson goal, etc. | Unchanged |
| `storyPages`, `flashcards`, `imagePrompts`, `generatedStory` | Updated |
| `version` | Incremented |
| `updatedAt` | Refreshed |

---

## Version history

- Snapshots stored in browser `localStorage` (max 10 per story)
- Recorded **before** each validated save when content changed
- Restore only in **Advanced editor** — replaces working copy (confirms if dirty)

See [domain-3-story-workspace.md](./domain-3-story-workspace.md) for full versioning policy.

---

## Unsaved change protection

`useStoryDirtyState` activates when editing and dirty:

| Trigger | Behavior |
|---------|----------|
| In-app navigation | React Router blocker + confirm |
| Browser refresh / close | `beforeunload` warning |

---

## Storage adapter responsibilities

Both adapters implement `updateStory(id, generatedStory)`. UI does not branch on adapter type.

---

## Limitations

- Snapshot history is browser-local (not cloud-backed in V1)
- Quick edit has no add/remove page — use Advanced editor
- Last write wins unless conflict baseline detects stale save

---

## Related docs

- [domain-3-story-workspace.md](./domain-3-story-workspace.md) — library, lifecycle, versioning
- [story-detail-flow.md](./story-detail-flow.md) — detail load and actions

# Story Detail Flow

How saved stories are loaded, displayed, and acted on in the dashboard.

**Route:** `/dashboard/stories/:storyId`

**Advanced editor route:** `/dashboard/stories/:storyId/edit` — full editor with version history (does **not** redirect to detail).

**Quick edit deep link:** `/dashboard/stories/:storyId?edit=1` — opens inline edit once, then strips the query param.

---

## Architecture

Story detail follows the same storage boundary as generation and create flows:

```
StoryDetailPage
  → useStoryDetail              (load + error states)
  → useStoryEditor              (edit working copy — optional)
  → useStoryDirtyState          (navigation guards while editing)
  → storyStorageApi             (features/stories/api/)
  → story-storage.ts            (features/story-generator/lib/)
  → resolveStoryStorageAdapter()
  → localStoryStorageAdapter | supabaseStoryStorageAdapter
```

---

## Page composition

| Component | Role |
|-----------|------|
| `StoryDetailLoadGuard` | Loading / error / empty shells |
| `StoryDetailModeBanner` | Read vs Quick edit mode |
| `StoryActionsBar` | Quick edit, Advanced editor, save, duplicate, archive, delete |
| `StoryDetailNav` | Back, Quick edit, Advanced editor, Read, Roleplay |
| `StoryHeader` | Title, status, version, summary, counts |
| `StoryEditForm` | Inline quick edit fields |

In **read mode**, read-only sections render. In **Quick edit**, `StoryEditForm` replaces read-only blocks.

---

## Actions

| Action | When | Behavior |
|--------|------|----------|
| **Quick edit** | Read mode | Enables inline edit |
| **Advanced editor** | Read mode | Navigates to `/edit` |
| **Save changes** | Quick edit | `persistValidatedStoryEdits` |
| **Duplicate** | Read mode | New copy → detail |
| **Archive** | Read mode | Hides from default library |
| **Delete** | Read mode | Confirms, deletes, redirects to list |

---

## Duplicate flow

```
duplicateStory(sourceId)
  → buildDuplicatedStoryProject (version: 0)
  → saveStoryDraft
  → navigate to /dashboard/stories/:newId
```

**Not copied:** version history, classroom assignments, image generation records.

---

## API surface (`storyStorageApi.ts`)

| Function | Purpose |
|----------|---------|
| `fetchStoryForDetail(id)` | Load for detail or edit routes |
| `persistValidatedStoryEdits(id, story, baseline?)` | Save with validation + history snapshot |
| `duplicateStory(sourceId)` | Clone story or plan |
| `archiveStory(id)` / `unarchiveStory(id)` | Hide / restore in library |
| `deleteStory(id)` | Remove story and related local data |

---

## Related docs

- [domain-3-story-workspace.md](./domain-3-story-workspace.md) — library, lifecycle, versioning
- [editing-system.md](./editing-system.md) — Quick edit vs Advanced editor

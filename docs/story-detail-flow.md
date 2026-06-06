# Story Detail Flow

How saved stories are loaded, displayed, and acted on in the dashboard.

**Route:** `/dashboard/stories/:storyId`

**Legacy edit route:** `/dashboard/stories/:storyId/edit` redirects to `?edit=1` on the detail page.

---

## Architecture

Story detail follows the same storage boundary as generation and create flows:

```
StoryDetailPage
  → useStoryDetail              (load + error states)
  → useStoryEditor              (edit working copy — optional)
  → useUnsavedStoryChanges      (navigation guards while editing)
  → storyStorageApi             (features/stories/api/)
  → story-storage.ts            (features/story-generator/lib/)
  → resolveStoryStorageAdapter()
  → localStoryStorageAdapter | supabaseStoryStorageAdapter
```

**Rules**

| Layer | Responsibility | Must not |
|-------|----------------|----------|
| **Page** | Orchestration, action handlers, mode toggles | Call providers, read `localStorage` directly |
| **Hooks** | Load state, editor clone, unsaved guards | Persist to storage |
| **storyStorageApi** | Feature-facing read/write/delete/duplicate | Choose adapter implementation |
| **story-storage + adapters** | Persistence, id mapping, RLS | Import React or UI |

Pages and hooks never import Supabase or touch `localStorage` keys directly.

---

## Load flow

```
useParams(storyId)
  → isValidStoryRouteId?  → invalid-id presentation
  → fetchStoryWithGeneratedContent(id)
      → loadDraftWithGeneratedStory (adapter)
      → { draft: StoryProject, generatedStory: GeneratedStory }
  → null?  → not-found presentation (signed-in vs local copy)
  → error? → classifyStoryLoadError()
  → ready   → render detail UI
```

`StoryDetailLoadGuard` wraps the page and handles:

- Auth loading
- Loading spinner
- Invalid id / not found / auth errors
- **Back to stories** navigation

`generatedStory` comes from the adapter. If `project.generatedStory` is missing but pages exist, `generatedStoryFromProject()` rebuilds a preview object from stored child rows.

---

## Page composition

`StoryDetailPage` is orchestration-only. Presentational pieces live under `features/stories/components/story-detail/`:

| Component | Role |
|-----------|------|
| `StoryDetailLoadGuard` | Loading / error / empty shells |
| `StoryDetailModeBanner` | Amber banner when editing or dirty |
| `StoryActionsBar` | Configurable actions (edit, save, cancel, duplicate, delete, AI placeholder) |
| `StoryHeader` | Title, status badge, summary, word counts |
| `StoryMetadata` | Dates, theme, setup review sections |
| `StoryPages` | Read-only page list |
| `StoryFlashcards` | Read-only flashcards |
| `StoryImagePrompts` | Read-only illustration prompts |
| `StoryEditForm` | Inline edit fields (pages, flashcards, prompts) |

In **view mode**, read-only sections render. In **edit mode**, `StoryEditForm` replaces the read-only blocks inside a bordered container.

---

## Actions

`StoryActionsBar` accepts a configurable `actions` array. On the detail page:

| Action | View mode | Edit mode | Behavior |
|--------|-----------|-----------|----------|
| **Edit** | Visible | Hidden | Enables inline edit mode |
| **Save** | Hidden | Visible | Persists edits via adapter |
| **Cancel** | Hidden | Visible | Restores clone, exits edit mode |
| **Duplicate** | Visible | Hidden | Creates new draft, navigates to copy |
| **Delete** | Visible | Hidden | Confirms, deletes via adapter, redirects to list |
| **AI actions** | Visible (disabled) | Hidden | Placeholder for future AI toolbar |

Confirmation copy for delete lives in `confirmDeleteStory()`.

---

## Duplicate flow

```
duplicateStory(sourceId)          [storyStorageApi]
  → loadDraftWithGeneratedStory
  → buildDuplicatedStoryProject   (new id, new timestamps)
  → saveStoryDraft
  → navigate to /dashboard/stories/:newId
```

**Copied:** setup, plan review, pages, flashcards, image prompts, continuity metadata (theme, characters, vocabulary, etc.)

**Not copied:** `id`, `createdAt`, cloud sync mappings (`draft-*` → UUID)

---

## Delete flow

```
confirmDeleteStory(title)
  → deleteStory(id)               [storyStorageApi]
  → deleteStoryDraft              [adapter]
  → navigate to /dashboard/stories
```

Failures use `classifyStoryDeleteError()` — user stays on the detail page with a dismissible error.

Local and cloud deletes both go through the active adapter. Cloud delete resolves `draft-*` ids to stored UUIDs when mappings exist and clears session/migration mappings afterward.

---

## API surface (`storyStorageApi.ts`)

| Function | Purpose |
|----------|---------|
| `fetchStoryWithGeneratedContent(id)` | Load draft + generated content for detail |
| `persistStoryEdits(id, generatedStory)` | Save inline edits |
| `duplicateStory(sourceId)` | Clone story as new draft |
| `deleteStory(id)` | Remove story via active adapter |

Feature pages should prefer this module over importing `story-storage.ts` directly.

---

## Error and auth behavior

Route guards live in `features/story-generator/lib/story-route-guards.ts`:

- **`isValidStoryRouteId`** — allows `draft-*` and UUID shapes
- **`classifyStoryLoadError`** — load/save failures (auth, network, permission)
- **`classifyStoryDeleteError`** — delete-specific messaging
- **`storyNotFoundPresentation`** — different copy when signed in vs local-only

When `VITE_ENABLE_SUPABASE_STORIES=true` and the user is signed in, loads and deletes target cloud rows. Otherwise the local adapter is used.

---

## Related docs

- [editing-system.md](./editing-system.md) — inline edit mode, save merge, unsaved guards
- [phase-7-progress.md](./phase-7-progress.md) — Phase 7 status and future work
- [phase-4-auth-and-cloud-storage.md](./phase-4-auth-and-cloud-storage.md) — adapter selection
- [story-generation-flow.md](./story-generation-flow.md) — generation → detail handoff

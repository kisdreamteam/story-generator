import type { GeneratedStory } from '@/features/stories/types'
import {
  appendStoryHistorySnapshotBeforeSave,
  deleteStoryHistory,
  loadStoryHistory,
  saveStoryHistory,
} from '@/features/story-history'
import type { StoryHistory } from '@/features/story-history'
import type { StoryRevisionHistory } from '../types/storyRevision.types'
import {
  createStoryRevisionHistory,
  normalizeStoryRevisionHistory,
} from '../utils/storyRevisionUtils'

function toRevisionHistory(history: StoryHistory): StoryRevisionHistory {
  return {
    storyId: history.storyId,
    maxRevisions: history.maxEntries,
    revisions: history.entries.map((entry) => ({
      id: entry.id,
      storyId: entry.storyId,
      revisionAt: entry.recordedAt,
      storyCreatedAt: entry.storyCreatedAt,
      storyUpdatedAt: entry.storyUpdatedAt,
      contentHash: entry.contentHash,
      label: entry.label,
      snapshot: entry.snapshot,
    })),
  }
}

function toStoryHistory(history: StoryRevisionHistory): StoryHistory {
  return {
    storyId: history.storyId,
    maxEntries: history.maxRevisions,
    entries: history.revisions.map((revision) => ({
      id: revision.id,
      storyId: revision.storyId,
      recordedAt: revision.revisionAt,
      storyCreatedAt: revision.storyCreatedAt,
      storyUpdatedAt: revision.storyUpdatedAt,
      contentHash: revision.contentHash,
      label: revision.label,
      snapshot: revision.snapshot,
    })),
  }
}

/** @deprecated Prefer loadStoryHistory from @/features/story-history */
export async function loadStoryRevisionHistory(storyId: string): Promise<StoryRevisionHistory> {
  if (!storyId) {
    return createStoryRevisionHistory('')
  }

  const loaded = await loadStoryHistory(storyId)
  return normalizeStoryRevisionHistory(storyId, toRevisionHistory(loaded))
}

/** @deprecated Prefer saveStoryHistory from @/features/story-history */
export async function saveStoryRevisionHistory(history: StoryRevisionHistory): Promise<void> {
  if (!history.storyId) return

  await saveStoryHistory(toStoryHistory(history))
}

/**
 * Snapshot the currently persisted generated story before a save overwrites it.
 * @deprecated Prefer appendStoryHistorySnapshotBeforeSave from @/features/story-history
 */
export async function appendRevisionSnapshotBeforeSave(storyId: string): Promise<void> {
  return appendStoryHistorySnapshotBeforeSave(storyId)
}

/** @deprecated Prefer deleteStoryHistory from @/features/story-history */
export async function deleteStoryRevisions(storyId: string): Promise<void> {
  return deleteStoryHistory(storyId)
}

/** @deprecated Prefer appendStoryHistorySnapshotBeforeSave from @/features/story-history */
export async function persistStoryWithRevisionSnapshot(
  storyId: string,
  generatedStory: GeneratedStory,
  persist: (id: string, story: GeneratedStory) => Promise<unknown>,
): Promise<unknown> {
  await appendStoryHistorySnapshotBeforeSave(storyId)
  return persist(storyId, generatedStory)
}

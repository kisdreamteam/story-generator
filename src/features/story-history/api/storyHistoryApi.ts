import { loadDraftWithGeneratedStory } from '@/features/story-generator'
import type { StoryHistory } from '../types/storyHistory.types'
import {
  createStoryHistory,
  normalizeStoryHistory,
  snapshotStoryHistoryBeforeSave,
} from '../lib/storyHistoryUtils'
import { getStoryHistoryStore, resolveStoryHistoryStore } from '../storage/resolveStoryHistoryStore'

export async function loadStoryHistory(storyId: string): Promise<StoryHistory> {
  if (!storyId) {
    return createStoryHistory('')
  }

  await resolveStoryHistoryStore()
  const loaded = await getStoryHistoryStore().load(storyId)
  return normalizeStoryHistory(storyId, loaded)
}

export async function saveStoryHistory(history: StoryHistory): Promise<void> {
  if (!history.storyId) return

  await resolveStoryHistoryStore()
  await getStoryHistoryStore().save(history)
}

/**
 * Snapshot the currently persisted generated story before a save overwrites it.
 * No-op when the story is missing or content is unchanged from the latest entry.
 */
export async function appendStoryHistorySnapshotBeforeSave(storyId: string): Promise<void> {
  if (!storyId) return

  const loaded = await loadDraftWithGeneratedStory(storyId)
  if (!loaded) return

  const history = await loadStoryHistory(storyId)
  const result = snapshotStoryHistoryBeforeSave(history, {
    snapshot: loaded.generatedStory,
    storyCreatedAt: loaded.draft.createdAt,
    storyUpdatedAt: loaded.draft.updatedAt,
  })

  if (result.skippedDuplicate) return

  await saveStoryHistory(result.history)
}

export async function deleteStoryHistory(storyId: string): Promise<void> {
  if (!storyId) return

  await resolveStoryHistoryStore()
  await getStoryHistoryStore().deleteForStory(storyId)
}

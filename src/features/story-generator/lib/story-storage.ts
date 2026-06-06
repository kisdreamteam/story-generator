import type { StoryProject } from '../types/story-generator.types'
import type { LoadDraftWithGeneratedStoryResult } from './storage/StoryStorageAdapter'
import { resolveStoryStorageAdapter } from './storage/resolveStoryStorageAdapter'
import { STORY_DRAFTS_STORAGE_KEY } from './storage/localStoryStorageAdapter'

export { STORY_DRAFTS_STORAGE_KEY }

/**
 * Public async story storage API.
 * Delegates to resolveStoryStorageAdapter() — local by default; Supabase when explicitly enabled + authenticated.
 */

export async function saveStoryDraft(project: StoryProject): Promise<StoryProject> {
  const adapter = await resolveStoryStorageAdapter()
  return adapter.saveStoryDraft(project)
}

export async function getStoryDrafts(): Promise<StoryProject[]> {
  const adapter = await resolveStoryStorageAdapter()
  return adapter.getStoryDrafts()
}

export async function getStoryDraft(id: string): Promise<StoryProject | null> {
  const adapter = await resolveStoryStorageAdapter()
  return adapter.getStoryDraft(id)
}

export async function deleteStoryDraft(id: string): Promise<void> {
  const adapter = await resolveStoryStorageAdapter()
  await adapter.deleteStoryDraft(id)
}

export async function clearStoryDrafts(): Promise<void> {
  const adapter = await resolveStoryStorageAdapter()
  await adapter.clearStoryDrafts()
}

export async function loadDraftWithGeneratedStory(
  id: string,
): Promise<LoadDraftWithGeneratedStoryResult | null> {
  const adapter = await resolveStoryStorageAdapter()
  return adapter.loadDraftWithGeneratedStory(id)
}

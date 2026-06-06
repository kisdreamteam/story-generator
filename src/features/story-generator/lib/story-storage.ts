import type { GeneratedStory, StoryProject } from '../types/story-generator.types'
import type { LoadDraftWithGeneratedStoryResult } from './storage/StoryStorageAdapter'
import { hasGeneratedStoryContent } from '@/features/stories/utils'
import { productAnalytics } from '@/shared/lib/analytics'
import { localStoryStorageAdapterAsync } from './storage/localStoryStorageAdapter'
import { resolveStoryStorageAdapter } from './storage/resolveStoryStorageAdapter'
import { runWithCloudFallback } from '@/shared/lib/connection/runWithCloudFallback'
import { STORY_DRAFTS_STORAGE_KEY } from './storage/localStoryStorageAdapter'

export { STORY_DRAFTS_STORAGE_KEY }

function trackStoryPersistence(project: StoryProject): void {
  if (hasGeneratedStoryContent(project)) {
    productAnalytics.storyCreated({
      storyId: project.id,
      pageCount: project.pageCount,
      totalWordCount: project.generatedStory?.totalWordCount,
      source: 'create_flow',
    })
    return
  }

  productAnalytics.draftSaved({
    storyId: project.id,
    pageCount: project.pageCount,
    source: 'create_flow',
  })
}

export async function saveStoryDraft(project: StoryProject): Promise<StoryProject> {
  const adapter = await resolveStoryStorageAdapter()

  let saved: StoryProject

  if (adapter === localStoryStorageAdapterAsync) {
    saved = await adapter.saveStoryDraft(project)
  } else {
    saved = await runWithCloudFallback({
      label: 'Save story plan',
      cloud: () => adapter.saveStoryDraft(project),
      local: () => localStoryStorageAdapterAsync.saveStoryDraft(project),
      retryCloud: () => adapter.saveStoryDraft(project),
    })
  }

  trackStoryPersistence(saved)
  return saved
}

export async function updateStory(id: string, generatedStory: GeneratedStory): Promise<StoryProject> {
  const adapter = await resolveStoryStorageAdapter()

  if (adapter === localStoryStorageAdapterAsync) {
    return adapter.updateStory(id, generatedStory)
  }

  return runWithCloudFallback({
    label: 'Save story changes',
    cloud: () => adapter.updateStory(id, generatedStory),
    local: () => localStoryStorageAdapterAsync.updateStory(id, generatedStory),
    retryCloud: () => adapter.updateStory(id, generatedStory),
  })
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

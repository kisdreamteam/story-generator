import type { GeneratedStory, StoryProject, StorySetupInput } from '../types/story-generator.types'
import { attachGeneratedStoryToProject } from '@/features/stories/utils/attachGeneratedStoryToProject'
import { createDraftProjectFromSetup } from '@/features/stories/utils/createDraftProjectFromSetup'
import { loadDraftById } from './load-draft'

/** Build and merge a project with generated output before persisting. */
export async function buildProjectWithGeneratedStory(
  setupData: StorySetupInput,
  generatedStory: GeneratedStory,
  options?: { activeDraftId?: string | null; createdAt?: string | null },
): Promise<StoryProject> {
  const activeDraftId = options?.activeDraftId

  const baseProject = activeDraftId
    ? (await loadDraftById(activeDraftId)) ??
      createDraftProjectFromSetup(setupData, {
        id: activeDraftId,
        createdAt: options?.createdAt ?? undefined,
      })
    : createDraftProjectFromSetup(setupData)

  return attachGeneratedStoryToProject(baseProject, generatedStory)
}

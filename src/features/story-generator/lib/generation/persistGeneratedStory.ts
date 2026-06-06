import type { StoryProject, StorySetupInput } from '../../types/story-generator.types'
import { buildProjectWithGeneratedStory } from '../save-generated-story'
import type { GeneratedStoryOutput } from './types'

export interface PersistGeneratedStoryOptions {
  activeDraftId?: string | null
  createdAt?: string | null
  saveDraft: (project: StoryProject) => Promise<StoryProject>
}

/** Build a project from setup + generated output and persist via story-storage. */
export async function persistGeneratedStory(
  setupData: StorySetupInput,
  generatedStory: GeneratedStoryOutput,
  options: PersistGeneratedStoryOptions,
): Promise<StoryProject> {
  const project = await buildProjectWithGeneratedStory(setupData, generatedStory, {
    activeDraftId: options.activeDraftId,
    createdAt: options.createdAt,
  })

  return options.saveDraft(project)
}

import { attachGeneratedStoryToProject } from '@/features/stories/utils/attachGeneratedStoryToProject'
import { withStoryLifecycleStatus } from '@/features/stories/utils/storyLifecycleStatus'
import type { GeneratedStory, StoryProject } from '../../types/story-generator.types'

/** Merge edited generated content into an existing project without changing identity or setup. */
export function mergeGeneratedStoryUpdate(
  existing: StoryProject,
  generatedStory: GeneratedStory,
): StoryProject {
  const withContent = attachGeneratedStoryToProject(existing, generatedStory)

  const now = new Date().toISOString()

  const merged: StoryProject = {
    ...withContent,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now,
    version: (existing.version ?? 0) + 1,
    setup: existing.setup,
    planReview: existing.planReview,
    theme: existing.theme,
    ageRange: existing.ageRange,
    language: existing.language,
    lessonGoal: existing.lessonGoal,
    vocabularyWords: existing.vocabularyWords,
    setting: existing.setting,
    characters: existing.characters,
    generationMetadata: existing.generationMetadata,
  }

  if (existing.lifecycleStatus === 'completed') {
    return merged
  }

  return withStoryLifecycleStatus(merged, 'edited')
}

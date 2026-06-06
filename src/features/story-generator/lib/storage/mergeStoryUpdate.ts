import { attachGeneratedStoryToProject } from '@/features/stories/utils/attachGeneratedStoryToProject'
import type { GeneratedStory, StoryProject } from '../../types/story-generator.types'

/** Merge edited generated content into an existing project without changing identity or setup. */
export function mergeGeneratedStoryUpdate(
  existing: StoryProject,
  generatedStory: GeneratedStory,
): StoryProject {
  const withContent = attachGeneratedStoryToProject(existing, generatedStory)

  return {
    ...withContent,
    id: existing.id,
    createdAt: existing.createdAt,
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
}

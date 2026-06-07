import type { GeneratedStory, StoryGenerationMetadata, StoryProject } from '../types'
import { withStoryLifecycleStatus } from './storyLifecycleStatus'

/** Merge generated output into a StoryProject before saving to localStorage. */
export function attachGeneratedStoryToProject(
  project: StoryProject,
  generatedStory: GeneratedStory,
  generationMetadata?: StoryGenerationMetadata,
): StoryProject {
  const merged: StoryProject = {
    ...project,
    title: generatedStory.title || project.title,
    pageCount: generatedStory.storyPages.length || project.pageCount,
    storyPages: generatedStory.storyPages,
    flashcards: generatedStory.flashcards,
    imagePrompts: generatedStory.imagePrompts,
    generatedStory,
    generationMetadata: generationMetadata ?? project.generationMetadata,
    updatedAt: new Date().toISOString(),
    version: project.version ?? 0,
  }

  if (project.lifecycleStatus === 'completed') {
    return merged
  }

  return withStoryLifecycleStatus(merged, 'generated')
}

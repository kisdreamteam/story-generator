import type { GeneratedStory, StoryProject } from '../types'

/** Merge generated output into a StoryProject before saving to localStorage. */
export function attachGeneratedStoryToProject(
  project: StoryProject,
  generatedStory: GeneratedStory,
): StoryProject {
  return {
    ...project,
    title: generatedStory.title || project.title,
    pageCount: generatedStory.storyPages.length || project.pageCount,
    storyPages: generatedStory.storyPages,
    flashcards: generatedStory.flashcards,
    imagePrompts: generatedStory.imagePrompts,
    generatedStory,
    updatedAt: new Date().toISOString(),
  }
}

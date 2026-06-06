import type { GeneratedStory, StoryProject } from '../types/story-generator.types'
import { getStoryStatusLabelForProject } from '@/features/stories/utils/storyStatus'

export function hasGeneratedStoryContent(project: StoryProject): boolean {
  return Boolean(project.generatedStory) || project.storyPages.length > 0
}

/** Use saved generatedStory or rebuild a preview object from stored pages. */
export function generatedStoryFromProject(project: StoryProject): GeneratedStory | null {
  if (project.generatedStory) {
    return project.generatedStory
  }

  if (project.storyPages.length === 0) {
    return null
  }

  const totalWordCount = project.storyPages.reduce((sum, page) => sum + page.wordCount, 0)

  return {
    title: project.title,
    summary: project.lessonGoal || project.theme,
    storyPages: project.storyPages,
    flashcards: project.flashcards,
    imagePrompts: project.imagePrompts,
    totalWordCount,
    generatedAt: project.updatedAt,
  }
}

/** Status badge text for a story card. Pass `mockSample` for the demo project. */
export function getStoryProjectStatusLabel(
  project: StoryProject,
  options?: { mockSample?: boolean },
): string {
  return getStoryStatusLabelForProject(project, options)
}

/** Primary card action label for a local saved project. */
export function getStoryProjectActionLabel(project: StoryProject): string {
  return hasGeneratedStoryContent(project) ? 'View story' : 'Continue editing'
}

export type DraftLoadKind = 'missing' | 'no-setup' | 'generated' | 'setup-only'

/** Classify a loaded draft for create-flow routing. */
export function classifyDraftLoad(draft: StoryProject | null): DraftLoadKind {
  if (!draft) return 'missing'
  if (generatedStoryFromProject(draft)) return 'generated'
  if (!draft.setup) return 'no-setup'
  return 'setup-only'
}

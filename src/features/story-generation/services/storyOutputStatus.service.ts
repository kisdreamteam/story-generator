import type { StoryGenerationOutput } from '../types'
import type { ValidationResult } from '../validation.types'

export function getStoryOutputError(
  story: StoryGenerationOutput | null | undefined,
  validation: ValidationResult,
): string | null {
  if (!story) {
    return 'Story output is missing. Go back to setup and generate your story again.'
  }

  if (!validation.isValid) {
    return 'Story output is incomplete or invalid. Go back to setup and generate your story again.'
  }

  if (!story.title?.trim()) {
    return 'Story title is missing from the output.'
  }

  if (story.pages.length === 0) {
    return 'No story pages were found for this project.'
  }

  return null
}

export function isStoryOutputReady(
  story: StoryGenerationOutput | null | undefined,
  validation: ValidationResult,
): boolean {
  return getStoryOutputError(story, validation) === null
}

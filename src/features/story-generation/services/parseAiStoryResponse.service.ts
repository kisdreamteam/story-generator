import type { StoryGenerationInput, StoryGenerationOutput } from '../types'
import { parseAiStoryResponseToGeneratedStory } from '../parsers'

/**
 * Parses raw JSON from the backend/AI provider into StoryGenerationOutput.
 * Used after requestAiStoryGeneration() returns rawText — never parses direct provider calls from the browser.
 * Returns null when parsing fails or required fields are missing.
 */
export function parseAiStoryResponse(
  rawContent: string,
  input: StoryGenerationInput,
): StoryGenerationOutput | null {
  const result = parseAiStoryResponseToGeneratedStory(rawContent, {
    expectedPageCount: input.pageCount,
  })

  if (!result.ok) {
    return null
  }

  const story = result.story

  return {
    projectId: input.projectId,
    generatedAt: story.generatedAt,
    title: story.title,
    summary: story.summary,
    pages: story.storyPages,
    flashcards: story.flashcards,
    imagePrompts: story.imagePrompts,
    totalWordCount: story.totalWordCount,
  }
}

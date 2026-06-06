import type { PartialAIGenerationOutput } from '@/shared/ai/recovery'
import { mapAIResultToGeneratedStoryOutput } from '../adapters/aiStoryOutputMapping'
import type { GeneratedStoryOutput } from '../types'

/** Build a recoverable output snapshot without full validation — for partial failures. */
export function buildPartialGeneratedStoryOutput(
  partial: PartialAIGenerationOutput,
): GeneratedStoryOutput {
  return mapAIResultToGeneratedStoryOutput(
    partial.story,
    partial.flashcards,
    partial.imagePrompts,
  )
}

export function partialOutputFromGeneratedStory(
  output: GeneratedStoryOutput,
  stage: PartialAIGenerationOutput['stage'],
): PartialAIGenerationOutput {
  return {
    story: {
      title: output.title,
      summary: output.summary,
      storyPages: output.storyPages,
      totalWordCount: output.totalWordCount,
      generatedAt: output.generatedAt,
    },
    flashcards: output.flashcards,
    imagePrompts: output.imagePrompts,
    stage,
  }
}

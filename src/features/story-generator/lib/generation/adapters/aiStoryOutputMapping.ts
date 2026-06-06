import type {
  AIImagePromptOutput,
  AIStoryCoreOutput,
  AIStoryFlashcardOutput,
  AIStoryGenerationInput,
} from '@/shared/ai'
import type {
  GeneratedFlashcardOutput,
  GeneratedImagePromptOutput,
  GeneratedStoryCoreOutput,
  GeneratedStoryOutput,
  StoryGenerationInput,
} from '../types'

export function mapStoryGenerationInputToAI(input: StoryGenerationInput): AIStoryGenerationInput {
  return { setup: input.setup }
}

export function mapAIStoryCoreToGenerated(story: AIStoryCoreOutput): GeneratedStoryCoreOutput {
  return {
    title: story.title,
    summary: story.summary,
    storyPages: story.storyPages,
    totalWordCount: story.totalWordCount,
    generatedAt: story.generatedAt,
  }
}

export function mapAIFlashcardsToGenerated(flashcards: AIStoryFlashcardOutput[]): GeneratedFlashcardOutput[] {
  return flashcards.map((card) => ({
    word: card.word,
    simpleDefinition: card.simpleDefinition,
    exampleSentence: card.exampleSentence,
  }))
}

export function mapAIImagePromptsToGenerated(prompts: AIImagePromptOutput[]): GeneratedImagePromptOutput[] {
  return prompts.map((prompt) => ({
    pageNumber: prompt.pageNumber,
    prompt: prompt.prompt,
    continuityReminder: prompt.continuityReminder,
  }))
}

export function mapAIResultToGeneratedStoryOutput(
  story: AIStoryCoreOutput,
  flashcards: AIStoryFlashcardOutput[],
  imagePrompts: AIImagePromptOutput[],
): GeneratedStoryOutput {
  return {
    ...mapAIStoryCoreToGenerated(story),
    flashcards: mapAIFlashcardsToGenerated(flashcards),
    imagePrompts: mapAIImagePromptsToGenerated(imagePrompts),
  }
}

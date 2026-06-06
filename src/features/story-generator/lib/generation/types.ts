import type { StorySetupInput } from '@/features/stories/types'
import type { StoryGenerationMetadata } from '@/shared/ai/metadata'

/** Teacher setup passed into the generation boundary. */
export interface StoryGenerationInput {
  setup: StorySetupInput
}

export interface GeneratedStoryPageOutput {
  pageNumber: number
  text: string
  wordCount: number
  teachingFocus: string
}

export interface GeneratedFlashcardOutput {
  word: string
  simpleDefinition: string
  exampleSentence: string
}

export interface GeneratedImagePromptOutput {
  pageNumber: number
  prompt: string
  continuityReminder: string
}

/** Core story text returned by generateStory(). */
export interface GeneratedStoryCoreOutput {
  title: string
  summary: string
  storyPages: GeneratedStoryPageOutput[]
  totalWordCount: number
  generatedAt: string
}

/** Full assembled generation result for the UI and storage layer. */
export interface GeneratedStoryOutput {
  title: string
  summary: string
  storyPages: GeneratedStoryPageOutput[]
  flashcards: GeneratedFlashcardOutput[]
  imagePrompts: GeneratedImagePromptOutput[]
  totalWordCount: number
  generatedAt: string
  /** Captured when generation completes — persisted with the saved story. */
  generationMetadata?: StoryGenerationMetadata
}

export type { StoryGenerationMetadata }

export function storyGenerationInputFromSetup(setup: StorySetupInput): StoryGenerationInput {
  return { setup }
}

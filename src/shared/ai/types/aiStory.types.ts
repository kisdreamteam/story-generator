import type { StorySetupInput } from '@/features/stories/types'

/** Teacher setup passed into the AI generation boundary. */
export interface AIStoryGenerationInput {
  setup: StorySetupInput
}

export interface AIStoryPageOutput {
  pageNumber: number
  text: string
  wordCount: number
  teachingFocus: string
}

export interface AIStoryFlashcardOutput {
  word: string
  simpleDefinition: string
  exampleSentence: string
}

export interface AIImagePromptOutput {
  pageNumber: number
  prompt: string
  continuityReminder: string
}

/** Core story text returned by generateStory(). */
export interface AIStoryCoreOutput {
  title: string
  summary: string
  storyPages: AIStoryPageOutput[]
  totalWordCount: number
  generatedAt: string
}

/** Story text and vocabulary from a single generateStory() call. */
export interface AIStoryGenerationResult {
  story: AIStoryCoreOutput
  flashcards: AIStoryFlashcardOutput[]
}

export interface AIStoryValidationResult {
  isValid: boolean
  errors: string[]
}

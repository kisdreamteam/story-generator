import type { StorySetupInput } from '@/features/stories/types'

/** Teacher setup passed into the AI generation boundary. */
export interface AIGenerationInput {
  setup: StorySetupInput
}

export interface AIProviderOptions {
  signal?: AbortSignal
}

export interface AIStoryPageOutput {
  pageNumber: number
  text: string
  wordCount: number
  teachingFocus: string
}

export interface AIFlashcardOutput {
  word: string
  simpleDefinition: string
  exampleSentence: string
}

export interface AIImagePromptOutput {
  pageNumber: number
  prompt: string
  continuityReminder: string
}

/** Core story text returned by {@link AIProvider.generateStory}. */
export interface AIStoryOutput {
  title: string
  summary: string
  storyPages: AIStoryPageOutput[]
  totalWordCount: number
  generatedAt: string
}

export interface AIValidationResult {
  isValid: boolean
  errors: string[]
}

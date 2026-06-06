import type {
  AIFlashcardOutput,
  AIGenerationInput,
  AIImagePromptOutput,
  AIProviderOptions,
  AIStoryOutput,
  AIValidationResult,
} from './types'

/** Pluggable AI generation backend — story, flashcards, and image prompts. */
export interface AIProvider {
  readonly id: string
  validateInput(input: AIGenerationInput): AIValidationResult
  generateStory(
    input: AIGenerationInput,
    options?: AIProviderOptions,
  ): Promise<AIStoryOutput>
  generateFlashcards(
    input: AIGenerationInput,
    story: AIStoryOutput,
    options?: AIProviderOptions,
  ): Promise<AIFlashcardOutput[]>
  generateImagePrompts(
    input: AIGenerationInput,
    story: AIStoryOutput,
    options?: AIProviderOptions,
  ): Promise<AIImagePromptOutput[]>
}

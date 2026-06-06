import type {
  AIImagePromptOutput,
  AIStoryCoreOutput,
  AIStoryGenerationInput,
  AIStoryGenerationResult,
  AIStoryValidationResult,
} from './aiStory.types'

export interface AIStoryProviderOptions {
  signal?: AbortSignal
}

/** Pluggable AI backend — UI and storage never import concrete providers. */
export interface AIStoryProvider {
  readonly id: string
  validateInput(input: AIStoryGenerationInput): AIStoryValidationResult
  generateStory(
    input: AIStoryGenerationInput,
    options?: AIStoryProviderOptions,
  ): Promise<AIStoryGenerationResult>
  generateImages(
    input: AIStoryGenerationInput,
    story: AIStoryCoreOutput,
    options?: AIStoryProviderOptions,
  ): Promise<AIImagePromptOutput[]>
}

import type {
  GeneratedFlashcardOutput,
  GeneratedStoryCoreOutput,
  StoryGenerationInput,
} from './types'

export interface StoryGenerationProviderOptions {
  signal?: AbortSignal
}

/** Provider contract for story text generation — image work lives in image-generation. */
export interface StoryGenerationProvider {
  generateStory(
    input: StoryGenerationInput,
    options?: StoryGenerationProviderOptions,
  ): Promise<GeneratedStoryCoreOutput>
  generateFlashcards(
    input: StoryGenerationInput,
    story: GeneratedStoryCoreOutput,
    options?: StoryGenerationProviderOptions,
  ): Promise<GeneratedFlashcardOutput[]>
}

import type {
  GeneratedStoryCoreOutput,
  StoryGenerationInput,
} from '../generation/types'

/** Re-export — shared shape for story and image boundaries. */
export type { GeneratedImagePromptOutput } from '../generation/types'

/** Input for image prompt and image asset generation. */
export interface ImageGenerationInput {
  storyInput: StoryGenerationInput
  story: GeneratedStoryCoreOutput
}

export interface GeneratedImageOutput {
  pageNumber: number
  imageUrl: string | null
  status: 'prompt_only' | 'generated'
}

export interface ImageGenerationProviderOptions {
  signal?: AbortSignal
}

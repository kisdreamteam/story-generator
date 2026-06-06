import { getMockAIImagePrompts } from '@/shared/ai'
import { throwIfAborted } from '../generation/runtime/generationAbort'
import type { ImageGenerationProvider } from './imageGenerationProvider'
import type {
  GeneratedImageOutput,
  GeneratedImagePromptOutput,
  ImageGenerationInput,
  ImageGenerationProviderOptions,
} from './types'

/** Static mock prompts used by the dashboard flow today. */
export function getMockImagePrompts(): GeneratedImagePromptOutput[] {
  return getMockAIImagePrompts()
}

export const mockImageGenerationProvider: ImageGenerationProvider = {
  async generateImagePrompts(
    _input: ImageGenerationInput,
    options?: ImageGenerationProviderOptions,
  ): Promise<GeneratedImagePromptOutput[]> {
    throwIfAborted(options?.signal)
    return getMockImagePrompts()
  },

  async generateImages(
    _input: ImageGenerationInput,
    prompts: GeneratedImagePromptOutput[],
    options?: ImageGenerationProviderOptions,
  ): Promise<GeneratedImageOutput[]> {
    throwIfAborted(options?.signal)

    return prompts.map((prompt) => ({
      pageNumber: prompt.pageNumber,
      imageUrl: null,
      status: 'prompt_only',
    }))
  },
}

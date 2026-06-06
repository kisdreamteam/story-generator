import type { GeneratedImagePromptOutput } from './types'
import { mockImageGenerationProvider } from './mockImageGenerationProvider'
import type { ImageGenerationProvider } from './imageGenerationProvider'
import type {
  GeneratedImageOutput,
  ImageGenerationInput,
  ImageGenerationProviderOptions,
} from './types'

let pendingPromptSeed: GeneratedImagePromptOutput[] | null = null

/**
 * Allows a story provider to pass parsed prompts into the image boundary
 * without the story orchestration layer knowing provider details.
 */
export function seedImagePromptsFromStoryContract(prompts: GeneratedImagePromptOutput[]): void {
  pendingPromptSeed = prompts
}

function consumePromptSeed(): GeneratedImagePromptOutput[] | null {
  const seed = pendingPromptSeed
  pendingPromptSeed = null
  return seed
}

function getImageGenerationProvider(): ImageGenerationProvider {
  return {
    async generateImagePrompts(input, options) {
      const seeded = consumePromptSeed()

      if (seeded) {
        return seeded
      }

      return mockImageGenerationProvider.generateImagePrompts(input, options)
    },

    async generateImages(input, prompts, options) {
      return mockImageGenerationProvider.generateImages(input, prompts, options)
    },
  }
}

/** Generate illustration prompts for a story through the active image provider. */
export async function generateImagePrompts(
  input: ImageGenerationInput,
  options?: ImageGenerationProviderOptions,
): Promise<GeneratedImagePromptOutput[]> {
  const provider = getImageGenerationProvider()
  return provider.generateImagePrompts(input, options)
}

/** Generate illustration assets for a story (mock: prompt-only placeholders). */
export async function generateImages(
  input: ImageGenerationInput,
  prompts: GeneratedImagePromptOutput[],
  options?: ImageGenerationProviderOptions,
): Promise<GeneratedImageOutput[]> {
  const provider = getImageGenerationProvider()
  return provider.generateImages(input, prompts, options)
}

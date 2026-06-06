import type {
  GeneratedImageOutput,
  GeneratedImagePromptOutput,
  ImageGenerationInput,
  ImageGenerationProviderOptions,
} from './types'

/** Image provider contract — no provider-specific logic here. */
export interface ImageGenerationProvider {
  generateImagePrompts(
    input: ImageGenerationInput,
    options?: ImageGenerationProviderOptions,
  ): Promise<GeneratedImagePromptOutput[]>
  generateImages(
    input: ImageGenerationInput,
    prompts: GeneratedImagePromptOutput[],
    options?: ImageGenerationProviderOptions,
  ): Promise<GeneratedImageOutput[]>
}

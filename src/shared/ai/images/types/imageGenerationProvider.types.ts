import type {
  ImageAssetRecord,
  ImageGenerationProviderOptions,
  ImageGenerationRequestContext,
  ImagePromptRecord,
} from './imageGeneration.types'

/** Pluggable image backend — no concrete provider wired yet. */
export interface AIImageGenerationProvider {
  readonly id: string
  generateSingle(
    context: ImageGenerationRequestContext,
    prompt: ImagePromptRecord,
    options?: ImageGenerationProviderOptions,
  ): Promise<ImageAssetRecord>
  generateBatch(
    context: ImageGenerationRequestContext,
    prompts: ImagePromptRecord[],
    options?: ImageGenerationProviderOptions,
  ): Promise<ImageAssetRecord[]>
  /** Reserved for future collage workflows. */
  generateCollage?(
    context: ImageGenerationRequestContext,
    prompts: ImagePromptRecord[],
    options?: ImageGenerationProviderOptions,
  ): Promise<ImageAssetRecord>
}

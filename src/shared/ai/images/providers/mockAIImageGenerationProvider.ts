import { throwIfAborted } from '../../runtime/aiProviderAbort'
import {
  ImageAssetStatus,
  ImageGenerationMode,
  type ImageAssetMetadata,
  type ImageAssetRecord,
  type ImageGenerationProviderOptions,
  type ImageGenerationRequestContext,
  type ImagePromptRecord,
} from '../types'
import type { AIImageGenerationProvider } from '../types/imageGenerationProvider.types'

function createAssetId(): string {
  return `img-asset-${crypto.randomUUID()}`
}

function buildPromptOnlyAsset(
  context: ImageGenerationRequestContext,
  prompt: ImagePromptRecord,
  metadata: Partial<ImageAssetMetadata> = {},
): ImageAssetRecord {
  const now = new Date().toISOString()

  return {
    id: createAssetId(),
    storyId: context.storyId,
    pageNumber: prompt.pageNumber,
    promptId: prompt.id,
    status: ImageAssetStatus.PROMPT_ONLY,
    imageUrl: null,
    metadata: {
      provider: 'mock',
      model: null,
      collageLayout: context.collageLayout,
      ...metadata,
    },
    createdAt: now,
    updatedAt: now,
  }
}

/** Architecture stub — returns prompt-only placeholders, no remote image calls. */
export const mockAIImageGenerationProvider: AIImageGenerationProvider = {
  id: 'mock',

  async generateSingle(
    context,
    prompt,
    options?: ImageGenerationProviderOptions,
  ): Promise<ImageAssetRecord> {
    throwIfAborted(options?.signal)
    return buildPromptOnlyAsset(context, prompt)
  },

  async generateBatch(
    context,
    prompts,
    options?: ImageGenerationProviderOptions,
  ): Promise<ImageAssetRecord[]> {
    throwIfAborted(options?.signal)
    return prompts.map((prompt) => buildPromptOnlyAsset(context, prompt))
  },

  async generateCollage(
    context,
    prompts,
    options?: ImageGenerationProviderOptions,
  ): Promise<ImageAssetRecord> {
    throwIfAborted(options?.signal)

    const primaryPrompt = prompts[0]
    if (!primaryPrompt) {
      throw new Error('Collage generation requires at least one prompt.')
    }

    return buildPromptOnlyAsset(context, primaryPrompt, {
      collageLayout: context.collageLayout ?? 'grid-auto',
      format: 'collage-placeholder',
    })
  },
}

export type ImageGenerationModeHandler = {
  generateSingle?: AIImageGenerationProvider['generateSingle']
  generateBatch?: AIImageGenerationProvider['generateBatch']
  generateCollage?: AIImageGenerationProvider['generateCollage']
}

/** Reserved export for future collage routing — currently delegates to mock collage stub. */
export function resolveImageGenerationModeHandler(
  provider: AIImageGenerationProvider,
  mode: ImageGenerationMode,
): ImageGenerationModeHandler {
  if (mode === ImageGenerationMode.SINGLE) {
    return {
      generateSingle: provider.generateSingle.bind(provider),
    }
  }

  if (mode === ImageGenerationMode.COLLAGE && provider.generateCollage) {
    return {
      generateCollage: provider.generateCollage.bind(provider),
    }
  }

  return {
    generateBatch: provider.generateBatch.bind(provider),
  }
}

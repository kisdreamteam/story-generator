import type {
  ImageGenerationAdapter,
  ImageGenerationAdapterOptions,
  ImageGenerationAdapterRequest,
  ImageGenerationAdapterResult,
} from './imageGenerationAdapter.types'
import { IMAGE_GENERATION_ADAPTER_NOT_CONNECTED_MESSAGE } from './imageGenerationAdapter.types'

function validateRequest(
  request: ImageGenerationAdapterRequest,
): ImageGenerationAdapterResult | null {
  if (!request.storyId.trim()) {
    return { ok: false, code: 'VALIDATION', errorMessage: 'Story id is required for image generation.' }
  }

  if (!Number.isInteger(request.pageNumber) || request.pageNumber < 1) {
    return { ok: false, code: 'VALIDATION', errorMessage: 'Page number must be a positive integer.' }
  }

  if (!request.prompt.trim()) {
    return { ok: false, code: 'VALIDATION', errorMessage: 'Illustration prompt is required.' }
  }

  return null
}

/**
 * Placeholder for the future production illustration backend.
 * Validates prompts but does not call any external provider yet.
 *
 * When wired, use a backend client (never browser provider secrets) similar to
 * {@link requestStoryGenerationFromBackend} in story generation.
 */
export const realImageGenerationAdapter: ImageGenerationAdapter = {
  kind: 'real',
  id: 'openai',

  async generateImage(
    request: ImageGenerationAdapterRequest,
    _options?: ImageGenerationAdapterOptions,
  ): Promise<ImageGenerationAdapterResult> {
    const validationError = validateRequest(request)

    if (validationError) {
      return validationError
    }

    return {
      ok: false,
      code: 'PROVIDER',
      errorMessage: IMAGE_GENERATION_ADAPTER_NOT_CONNECTED_MESSAGE,
    }
  },
}

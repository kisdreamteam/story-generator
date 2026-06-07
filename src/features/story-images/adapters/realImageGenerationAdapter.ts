import {
  ImageGenerationBackendError,
  isImageGenerationBackendError,
  requestImageGenerationFromBackend,
  toImageGenerationBackendErrorFromResponse,
} from '../api/imageGenerationBackend.client'
import type {
  ImageGenerationAdapter,
  ImageGenerationAdapterOptions,
  ImageGenerationAdapterRequest,
  ImageGenerationAdapterResult,
} from './imageGenerationAdapter.types'

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
 * Real illustration adapter — single page via POST /api/image-generation.
 * Provider failures throw {@link ImageGenerationBackendError} for service-layer fallback.
 */
export const realImageGenerationAdapter: ImageGenerationAdapter = {
  kind: 'real',
  id: 'openai',

  async generateImage(
    request: ImageGenerationAdapterRequest,
    options?: ImageGenerationAdapterOptions,
  ): Promise<ImageGenerationAdapterResult> {
    const validationError = validateRequest(request)

    if (validationError) {
      return validationError
    }

    try {
      const backendResponse = await requestImageGenerationFromBackend(request, {
        signal: options?.signal,
      })

      if (!backendResponse.ok || !backendResponse.imageUrl?.trim()) {
        throw toImageGenerationBackendErrorFromResponse(backendResponse)
      }

      return {
        ok: true,
        imageUrl: backendResponse.imageUrl,
        generatedAt: backendResponse.generatedAt ?? new Date().toISOString(),
      }
    } catch (error) {
      if (isImageGenerationBackendError(error)) {
        throw error
      }

      throw new ImageGenerationBackendError(
        'UNKNOWN',
        error instanceof Error ? error.message : 'Image generation request failed.',
        { cause: error },
      )
    }
  },
}

export { ImageGenerationBackendError, isImageGenerationBackendError } from '../api/imageGenerationBackend.client'

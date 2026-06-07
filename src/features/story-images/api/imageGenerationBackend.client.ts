import type { ImageGenerationAdapterRequest } from '../adapters/imageGenerationAdapter.types'
import {
  getImageGenerationApiUrl,
  getImageGenerationModelName,
  getImageGenerationProviderId,
} from './imageGenerationBackend.config'
import type {
  ImageGenerationBackendRequest,
  ImageGenerationBackendResponse,
} from './imageGenerationBackend.types'
import { IMAGE_GENERATION_BACKEND_NOT_CONNECTED_MESSAGE } from './imageGenerationBackend.types'

export type ImageGenerationBackendErrorCode =
  | 'VALIDATION'
  | 'PROVIDER'
  | 'ABORTED'
  | 'NETWORK'
  | 'UNKNOWN'

export class ImageGenerationBackendError extends Error {
  readonly code: ImageGenerationBackendErrorCode

  constructor(code: ImageGenerationBackendErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ImageGenerationBackendError'
    this.code = code
  }
}

export function isImageGenerationBackendError(error: unknown): error is ImageGenerationBackendError {
  return error instanceof ImageGenerationBackendError
}

export interface RequestImageGenerationFromBackendOptions {
  signal?: AbortSignal
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new ImageGenerationBackendError('ABORTED', 'Image generation request was cancelled.', {
      cause: signal.reason,
    })
  }
}

function buildBackendRequest(request: ImageGenerationAdapterRequest): ImageGenerationBackendRequest {
  return {
    storyId: request.storyId,
    pageNumber: request.pageNumber,
    prompt: request.prompt,
    continuityReminder: request.continuityReminder,
    provider: getImageGenerationProviderId(),
    model: getImageGenerationModelName(),
  }
}

function mapFetchFailure(error: unknown): ImageGenerationBackendError {
  if (error instanceof ImageGenerationBackendError) {
    return error
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ImageGenerationBackendError('ABORTED', 'Image generation request was cancelled.', {
      cause: error,
    })
  }

  if (error instanceof TypeError) {
    return new ImageGenerationBackendError('NETWORK', 'Image generation API is unreachable.', {
      cause: error,
    })
  }

  return new ImageGenerationBackendError(
    'UNKNOWN',
    'Image generation request failed.',
    { cause: error },
  )
}

/**
 * POST one page illustration prompt to our backend. Never calls an image provider from the browser.
 */
export async function requestImageGenerationFromBackend(
  request: ImageGenerationAdapterRequest,
  options: RequestImageGenerationFromBackendOptions = {},
): Promise<ImageGenerationBackendResponse> {
  throwIfAborted(options.signal)

  const backendRequest = buildBackendRequest(request)
  const apiUrl = getImageGenerationApiUrl()

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendRequest),
      signal: options.signal,
    })

    throwIfAborted(options.signal)

    let data: ImageGenerationBackendResponse

    try {
      data = (await response.json()) as ImageGenerationBackendResponse
    } catch {
      throw new ImageGenerationBackendError(
        'PROVIDER',
        `Image generation API returned an invalid response (${response.status}).`,
      )
    }

    if (!response.ok && data.ok !== false) {
      return {
        ok: false,
        errorMessage:
          data.errorMessage ??
          `Image generation API returned ${response.status}.`,
        provider: data.provider ?? backendRequest.provider,
        model: data.model ?? backendRequest.model,
      }
    }

    return data
  } catch (error) {
    throw mapFetchFailure(error)
  }
}

export function toImageGenerationBackendErrorFromResponse(
  response: ImageGenerationBackendResponse,
): ImageGenerationBackendError {
  const message =
    response.errorMessage?.trim() ||
    IMAGE_GENERATION_BACKEND_NOT_CONNECTED_MESSAGE

  return new ImageGenerationBackendError('PROVIDER', message)
}

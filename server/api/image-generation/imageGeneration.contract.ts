/**
 * Shared API contract for POST /api/image-generation.
 *
 * Keep in sync with:
 *   src/features/story-images/api/imageGenerationBackend.types.ts
 */

/** Single-page illustration request — no secret keys. */
export interface ImageGenerationBackendRequest {
  storyId: string
  pageNumber: number
  prompt: string
  continuityReminder?: string
  provider: string
  model: string
}

/** Response after the server calls the image provider with a secret key. */
export interface ImageGenerationBackendResponse {
  ok: boolean
  imageUrl?: string
  errorMessage?: string
  provider?: string
  model?: string
  generatedAt?: string
}

export const IMAGE_GENERATION_BACKEND_NOT_CONNECTED_MESSAGE =
  'Image generation API is not connected yet. Deploy the backend with a server-side provider key, or use mock mode.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** Validate a single-page image generation request body. */
export function validateImageGenerationBackendRequest(
  value: unknown,
): value is ImageGenerationBackendRequest {
  if (!isRecord(value)) {
    return false
  }

  return (
    readTrimmedString(value.storyId) !== null &&
    typeof value.pageNumber === 'number' &&
    Number.isInteger(value.pageNumber) &&
    value.pageNumber >= 1 &&
    readTrimmedString(value.prompt) !== null &&
    readTrimmedString(value.provider) !== null &&
    readTrimmedString(value.model) !== null
  )
}

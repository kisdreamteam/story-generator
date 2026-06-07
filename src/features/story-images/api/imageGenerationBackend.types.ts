/** Request body for POST /api/image-generation (single page). */
export interface ImageGenerationBackendRequest {
  storyId: string
  pageNumber: number
  prompt: string
  continuityReminder?: string
  provider: string
  model: string
}

/** Response from our backend after it calls the image provider with a server-side secret key. */
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

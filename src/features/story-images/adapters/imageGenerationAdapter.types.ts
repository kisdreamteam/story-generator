/** Adapter kind — resolved from environment configuration. */
export type ImageGenerationAdapterKind = 'mock' | 'real'

export type ImageGenerationAdapterErrorCode =
  | 'VALIDATION'
  | 'PROVIDER'
  | 'ABORTED'
  | 'NETWORK'
  | 'UNKNOWN'

/** Page illustration request — built from a story page image prompt. */
export interface ImageGenerationAdapterRequest {
  storyId: string
  pageNumber: number
  prompt: string
  continuityReminder?: string
}

export interface ImageGenerationAdapterOptions {
  signal?: AbortSignal
}

export interface ImageGenerationAdapterSuccess {
  ok: true
  imageUrl: string
  generatedAt: string
}

export interface ImageGenerationAdapterFailure {
  ok: false
  errorMessage: string
  code: ImageGenerationAdapterErrorCode
}

export type ImageGenerationAdapterResult =
  | ImageGenerationAdapterSuccess
  | ImageGenerationAdapterFailure

/**
 * Illustration generation boundary — orchestration depends on this interface only.
 * Concrete mock and real backends are wired through {@link resolveImageGenerationAdapter}.
 */
export interface ImageGenerationAdapter {
  readonly kind: ImageGenerationAdapterKind
  readonly id: string
  generateImage(
    request: ImageGenerationAdapterRequest,
    options?: ImageGenerationAdapterOptions,
  ): Promise<ImageGenerationAdapterResult>
}

export function isImageGenerationAdapterFailure(
  result: ImageGenerationAdapterResult,
): result is ImageGenerationAdapterFailure {
  return !result.ok
}

export const IMAGE_GENERATION_ADAPTER_NOT_CONNECTED_MESSAGE =
  'Image generation is not connected yet. Deploy the backend with a server-side provider key, or use mock mode.'

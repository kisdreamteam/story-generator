import { delay, throwIfAborted } from '@/shared/ai/runtime/aiProviderAbort'
import type {
  ImageGenerationAdapter,
  ImageGenerationAdapterFailure,
  ImageGenerationAdapterOptions,
  ImageGenerationAdapterRequest,
  ImageGenerationAdapterResult,
} from './imageGenerationAdapter.types'

const MOCK_IMAGE_GENERATION_MS = 400

function failure(
  code: ImageGenerationAdapterFailure['code'],
  errorMessage: string,
): ImageGenerationAdapterFailure {
  return { ok: false, code, errorMessage }
}

function validateRequest(request: ImageGenerationAdapterRequest): ImageGenerationAdapterFailure | null {
  if (!request.storyId.trim()) {
    return failure('VALIDATION', 'Story id is required for image generation.')
  }

  if (!Number.isInteger(request.pageNumber) || request.pageNumber < 1) {
    return failure('VALIDATION', 'Page number must be a positive integer.')
  }

  if (!request.prompt.trim()) {
    return failure('VALIDATION', 'Illustration prompt is required.')
  }

  return null
}

/** Deterministic inline SVG placeholder — no network or provider calls. */
export function buildMockStoryPageImageUrl(pageNumber: number): string {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">',
    '<rect width="800" height="600" fill="#f5f5f4"/>',
    '<rect x="48" y="48" width="704" height="504" rx="16" fill="#e7e5e4" stroke="#d6d3d1"/>',
    `<text x="400" y="290" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="#57534e">Page ${pageNumber}</text>`,
    '<text x="400" y="330" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="#78716c">Mock illustration</text>',
    '</svg>',
  ].join('')

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** Mock illustration adapter — returns a deterministic placeholder image URL. */
export const mockImageGenerationAdapter: ImageGenerationAdapter = {
  kind: 'mock',
  id: 'mock',

  async generateImage(
    request: ImageGenerationAdapterRequest,
    options?: ImageGenerationAdapterOptions,
  ): Promise<ImageGenerationAdapterResult> {
    const validationError = validateRequest(request)

    if (validationError) {
      return validationError
    }

    try {
      await delay(MOCK_IMAGE_GENERATION_MS, options?.signal)
      throwIfAborted(options?.signal)

      return {
        ok: true,
        imageUrl: buildMockStoryPageImageUrl(request.pageNumber),
        generatedAt: new Date().toISOString(),
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return failure('ABORTED', 'Image generation was cancelled.')
      }

      if (error instanceof Error && error.name === 'AbortError') {
        return failure('ABORTED', 'Image generation was cancelled.')
      }

      return failure(
        'UNKNOWN',
        error instanceof Error ? error.message : 'Mock image generation failed.',
      )
    }
  },
}

import {
  getMockImageGenerationAdapter,
  resolveImageGenerationAdapter,
} from '../adapters/resolveImageGenerationAdapter'
import { isImageGenerationBackendError } from '../adapters/realImageGenerationAdapter'
import type {
  ImageGenerationAdapter,
  ImageGenerationAdapterOptions,
  ImageGenerationAdapterRequest,
  ImageGenerationAdapterResult,
} from '../adapters/imageGenerationAdapter.types'
import type { GeneratedStory, StoryPage } from '@/features/stories/types'
import { isRealImageGenerationMode } from '@/shared/config/imageGenerationConfig'
import { StoryPageImageStatuses } from '../types/storyImage.types'
import {
  applyStoryPageImageFields,
  isStoryPageImageReady,
  resolvePageImagePromptText,
  snapshotStoryPageImageFields,
} from '../lib/storyPageImageGeneration.utils'

export interface GenerateStoryPageImageOptions {
  storyId: string
  story: GeneratedStory
  pageNumber: number
  /** When true, regenerates even if the page already has a ready illustration. */
  force?: boolean
  signal?: AbortSignal
  /** Called when the page enters the generating state (before the adapter runs). */
  onProgress?: (story: GeneratedStory) => void
}

export type GenerateStoryPageImageOutcome =
  | { status: 'skipped' }
  | { status: 'invalid'; errorMessage: string }
  | {
      status: 'success'
      story: GeneratedStory
      result: Extract<ImageGenerationAdapterResult, { ok: true }>
      usedMockFallback?: boolean
    }
  | { status: 'failed'; story: GeneratedStory; errorMessage: string }

function findStoryPage(story: GeneratedStory, pageNumber: number): StoryPage | null {
  return story.storyPages.find((page) => page.pageNumber === pageNumber) ?? null
}

function isAbortError(error: unknown): boolean {
  if (isImageGenerationBackendError(error) && error.code === 'ABORTED') {
    return true
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return true
  }

  return error instanceof Error && error.name === 'AbortError'
}

function isAdapterValidationOrAbortFailure(
  result: ImageGenerationAdapterResult,
): result is Extract<ImageGenerationAdapterResult, { ok: false }> {
  return !result.ok && (result.code === 'VALIDATION' || result.code === 'ABORTED')
}

async function runAdapterGenerateImage(
  adapter: ImageGenerationAdapter,
  request: ImageGenerationAdapterRequest,
  options?: ImageGenerationAdapterOptions,
): Promise<ImageGenerationAdapterResult> {
  return adapter.generateImage(request, options)
}

async function generateImageWithOptionalFallback(
  request: ImageGenerationAdapterRequest,
  options?: ImageGenerationAdapterOptions,
): Promise<{ result: Extract<ImageGenerationAdapterResult, { ok: true }>; usedMockFallback: boolean }> {
  const adapter = await resolveImageGenerationAdapter()

  if (!isRealImageGenerationMode()) {
    const result = await runAdapterGenerateImage(adapter, request, options)

    if (!result.ok) {
      throw result
    }

    return { result, usedMockFallback: false }
  }

  try {
    const result = await runAdapterGenerateImage(adapter, request, options)

    if (!result.ok) {
      throw result
    }

    return { result, usedMockFallback: false }
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'ok' in error &&
      isAdapterValidationOrAbortFailure(error as ImageGenerationAdapterResult)
    ) {
      throw error
    }

    console.warn(
      '[Story Images] Real image adapter failed; using mock placeholder.',
      error instanceof Error ? error.message : error,
    )

    const mockAdapter = getMockImageGenerationAdapter()
    const fallbackResult = await runAdapterGenerateImage(mockAdapter, request, options)

    if (!fallbackResult.ok) {
      throw fallbackResult
    }

    return { result: fallbackResult, usedMockFallback: true }
  }
}

/** Generate one page illustration through the image adapter boundary. */
export async function generateStoryPageImage(
  options: GenerateStoryPageImageOptions,
): Promise<GenerateStoryPageImageOutcome> {
  const { storyId, story, pageNumber, force = false, signal, onProgress } = options
  const page = findStoryPage(story, pageNumber)

  if (!page) {
    return { status: 'invalid', errorMessage: `Page ${pageNumber} was not found.` }
  }

  if (!force && isStoryPageImageReady(page, story.imagePrompts)) {
    return { status: 'skipped' }
  }

  const { prompt, continuityReminder } = resolvePageImagePromptText(page, story.imagePrompts)

  if (!prompt.trim()) {
    return {
      status: 'invalid',
      errorMessage: `Page ${pageNumber} needs an illustration prompt before generating an image.`,
    }
  }

  const previousFields = snapshotStoryPageImageFields(page)
  const hadReadyImage = isStoryPageImageReady(page, story.imagePrompts)

  let workingStory = applyStoryPageImageFields(story, pageNumber, {
    imageStatus: StoryPageImageStatuses.GENERATING,
    imageError: undefined,
  })
  onProgress?.(workingStory)

  const adapterRequest: ImageGenerationAdapterRequest = {
    storyId,
    pageNumber,
    prompt,
    continuityReminder,
  }

  try {
    const { result, usedMockFallback } = await generateImageWithOptionalFallback(adapterRequest, {
      signal,
    })

    return {
      status: 'success',
      story: applyStoryPageImageFields(workingStory, pageNumber, {
        imagePrompt: prompt,
        imageStatus: StoryPageImageStatuses.READY,
        imageUrl: result.imageUrl,
        imageGeneratedAt: result.generatedAt,
        imageError: undefined,
      }),
      result,
      usedMockFallback,
    }
  } catch (error) {
    if (isAbortError(error)) {
      workingStory = applyStoryPageImageFields(workingStory, pageNumber, {
        ...previousFields,
        imageStatus: StoryPageImageStatuses.NONE,
      })

      return {
        status: 'failed',
        story: workingStory,
        errorMessage: 'Image generation was cancelled.',
      }
    }

    const adapterFailure =
      typeof error === 'object' &&
      error !== null &&
      'ok' in error &&
      (error as ImageGenerationAdapterResult).ok === false
        ? (error as Extract<ImageGenerationAdapterResult, { ok: false }>)
        : null

    const errorMessage =
      adapterFailure?.errorMessage ??
      (error instanceof Error ? error.message : 'Image generation failed.')

    if (force && hadReadyImage) {
      workingStory = applyStoryPageImageFields(workingStory, pageNumber, {
        ...previousFields,
      })
    } else {
      workingStory = applyStoryPageImageFields(workingStory, pageNumber, {
        imagePrompt: prompt,
        imageStatus: StoryPageImageStatuses.FAILED,
        imageError: errorMessage,
        imageUrl: undefined,
        imageGeneratedAt: undefined,
      })
    }

    return {
      status: 'failed',
      story: workingStory,
      errorMessage,
    }
  }
}

export async function generateMissingStoryPageImages(options: {
  storyId: string
  story: GeneratedStory
  signal?: AbortSignal
  onPageProgress?: (pageNumber: number, story: GeneratedStory) => void
  onPageComplete?: (pageNumber: number, story: GeneratedStory) => void
}): Promise<{
  story: GeneratedStory
  generated: number[]
  failed: Array<{ pageNumber: number; errorMessage: string }>
  skipped: number[]
  mockFallbackPages: number[]
}> {
  const pagesToGenerate = options.story.storyPages.filter(
    (page) => !isStoryPageImageReady(page, options.story.imagePrompts),
  )

  let workingStory = options.story
  const generated: number[] = []
  const failed: Array<{ pageNumber: number; errorMessage: string }> = []
  const skipped: number[] = []
  const mockFallbackPages: number[] = []

  for (const page of pagesToGenerate) {
    if (options.signal?.aborted) {
      break
    }

    const outcome = await generateStoryPageImage({
      storyId: options.storyId,
      story: workingStory,
      pageNumber: page.pageNumber,
      force: false,
      signal: options.signal,
      onProgress: (nextStory) => {
        workingStory = nextStory
        options.onPageProgress?.(page.pageNumber, nextStory)
      },
    })

    if (outcome.status === 'skipped') {
      skipped.push(page.pageNumber)
      continue
    }

    if (outcome.status === 'invalid') {
      failed.push({ pageNumber: page.pageNumber, errorMessage: outcome.errorMessage })
      continue
    }

    workingStory = outcome.story
    options.onPageComplete?.(page.pageNumber, workingStory)

    if (outcome.status === 'success') {
      generated.push(page.pageNumber)
      if (outcome.usedMockFallback) {
        mockFallbackPages.push(page.pageNumber)
      }
      continue
    }

    failed.push({ pageNumber: page.pageNumber, errorMessage: outcome.errorMessage })
  }

  return { story: workingStory, generated, failed, skipped, mockFallbackPages }
}

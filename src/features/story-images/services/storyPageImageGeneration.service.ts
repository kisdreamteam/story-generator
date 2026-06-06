import { resolveImageGenerationAdapter } from '../adapters/resolveImageGenerationAdapter'
import type { ImageGenerationAdapterResult } from '../adapters/imageGenerationAdapter.types'
import type { GeneratedStory, StoryPage } from '@/features/stories/types'
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
  | { status: 'success'; story: GeneratedStory; result: Extract<ImageGenerationAdapterResult, { ok: true }> }
  | { status: 'failed'; story: GeneratedStory; errorMessage: string }

function findStoryPage(story: GeneratedStory, pageNumber: number): StoryPage | null {
  return story.storyPages.find((page) => page.pageNumber === pageNumber) ?? null
}

/** Generate one page illustration through the mock adapter boundary. */
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

  const adapter = await resolveImageGenerationAdapter()
  const result = await adapter.generateImage(
    {
      storyId,
      pageNumber,
      prompt,
      continuityReminder,
    },
    { signal },
  )

  if (result.ok) {
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
    }
  }

  if (force && hadReadyImage) {
    workingStory = applyStoryPageImageFields(workingStory, pageNumber, {
      ...previousFields,
    })
  } else {
    workingStory = applyStoryPageImageFields(workingStory, pageNumber, {
      imagePrompt: prompt,
      imageStatus: StoryPageImageStatuses.FAILED,
      imageError: result.errorMessage,
      imageUrl: undefined,
      imageGeneratedAt: undefined,
    })
  }

  return {
    status: 'failed',
    story: workingStory,
    errorMessage: result.errorMessage,
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
}> {
  const pagesToGenerate = options.story.storyPages.filter(
    (page) => !isStoryPageImageReady(page, options.story.imagePrompts),
  )

  let workingStory = options.story
  const generated: number[] = []
  const failed: Array<{ pageNumber: number; errorMessage: string }> = []
  const skipped: number[] = []

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
      continue
    }

    failed.push({ pageNumber: page.pageNumber, errorMessage: outcome.errorMessage })
  }

  return { story: workingStory, generated, failed, skipped }
}

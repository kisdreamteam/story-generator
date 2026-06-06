import type { GeneratedStory, StoryImagePrompt, StoryPage } from '@/features/stories/types'
import { StoryPageImageStatuses, type StoryPageImageFields } from '../types/storyImage.types'
import { findImagePromptForPage } from './imagePromptReview.utils'
import { resolveStoryPageImageFields } from './storyImageDisplay'

export function isStoryPageImageReady(
  page: StoryPage,
  imagePrompts: StoryImagePrompt[] = [],
): boolean {
  const fields = resolveStoryPageImageFields(page, imagePrompts)
  return (
    fields.imageStatus === StoryPageImageStatuses.READY && Boolean(fields.imageUrl?.trim())
  )
}

export function listStoryPagesNeedingImages(
  story: GeneratedStory,
): StoryPage[] {
  return story.storyPages.filter((page) => !isStoryPageImageReady(page, story.imagePrompts))
}

export function countStoryPagesNeedingImages(story: GeneratedStory): number {
  return listStoryPagesNeedingImages(story).length
}

export function snapshotStoryPageImageFields(page: StoryPage): StoryPageImageFields {
  return {
    imagePrompt: page.imagePrompt,
    imageUrl: page.imageUrl,
    imageStatus: page.imageStatus,
    imageError: page.imageError,
    imageGeneratedAt: page.imageGeneratedAt,
  }
}

export function applyStoryPageImageFields(
  story: GeneratedStory,
  pageNumber: number,
  fields: Partial<StoryPageImageFields>,
): GeneratedStory {
  return {
    ...story,
    storyPages: story.storyPages.map((page) =>
      page.pageNumber === pageNumber ? { ...page, ...fields } : page,
    ),
  }
}

export function resolvePageImagePromptText(
  page: StoryPage,
  imagePrompts: StoryImagePrompt[],
): { prompt: string; continuityReminder: string } {
  const matched = findImagePromptForPage(imagePrompts, page.pageNumber)

  return {
    prompt: page.imagePrompt ?? matched?.prompt ?? '',
    continuityReminder: matched?.continuityReminder ?? '',
  }
}

export function haveStoryPageImagesChanged(
  left: GeneratedStory,
  right: GeneratedStory,
): boolean {
  if (left.storyPages.length !== right.storyPages.length) {
    return true
  }

  return left.storyPages.some((page) => {
    const other = right.storyPages.find((item) => item.pageNumber === page.pageNumber)
    if (!other) return true

    const leftFields = resolveStoryPageImageFields(page, left.imagePrompts)
    const rightFields = resolveStoryPageImageFields(other, right.imagePrompts)

    return (
      leftFields.imageUrl !== rightFields.imageUrl ||
      leftFields.imageStatus !== rightFields.imageStatus ||
      leftFields.imageError !== rightFields.imageError ||
      leftFields.imageGeneratedAt !== rightFields.imageGeneratedAt
    )
  })
}

export const IMAGE_STATUS_LABELS: Record<
  import('../types/storyImage.types').StoryPageImageStatus,
  string
> = {
  none: 'No image',
  queued: 'Queued',
  generating: 'Generating',
  ready: 'Ready',
  failed: 'Failed',
}

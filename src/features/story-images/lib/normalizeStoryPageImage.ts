import type { GeneratedStory, StoryImagePrompt, StoryPage } from '@/features/stories/types'
import {
  DEFAULT_STORY_PAGE_IMAGE_STATUS,
  StoryPageImageStatuses,
  type StoryPageImageData,
  type StoryPageImageFields,
  type StoryPageImageStatus,
} from '../types/storyImage.types'

const STORY_PAGE_IMAGE_STATUS_VALUES = new Set<string>(Object.values(StoryPageImageStatuses))

export function isStoryPageImageStatus(value: unknown): value is StoryPageImageStatus {
  return typeof value === 'string' && STORY_PAGE_IMAGE_STATUS_VALUES.has(value)
}

/** Map persisted storage / asset statuses onto page-level illustration status. */
export function mapStorageImageStatusToPageStatus(
  rawStatus: string | null | undefined,
  imageUrl?: string | null,
): StoryPageImageStatus {
  const normalized = rawStatus?.trim().toLowerCase()

  switch (normalized) {
    case StoryPageImageStatuses.QUEUED:
      return StoryPageImageStatuses.QUEUED
    case StoryPageImageStatuses.GENERATING:
    case 'running':
      return StoryPageImageStatuses.GENERATING
    case StoryPageImageStatuses.FAILED:
      return StoryPageImageStatuses.FAILED
    case StoryPageImageStatuses.READY:
    case 'generated':
      return imageUrl?.trim()
        ? StoryPageImageStatuses.READY
        : StoryPageImageStatuses.NONE
    case StoryPageImageStatuses.NONE:
      return StoryPageImageStatuses.NONE
    case 'prompt_only':
    default:
      return imageUrl?.trim() ? StoryPageImageStatuses.READY : StoryPageImageStatuses.NONE
  }
}

function readTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function readIsoTimestamp(value: unknown): string | undefined {
  const raw = readTrimmedString(value)

  if (!raw) {
    return undefined
  }

  const timestamp = Date.parse(raw)
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString()
}

function inferStoryPageImageStatus(fields: StoryPageImageFields): StoryPageImageStatus {
  if (fields.imageStatus && isStoryPageImageStatus(fields.imageStatus)) {
    return fields.imageStatus
  }

  if (fields.imageUrl?.trim()) {
    return StoryPageImageStatuses.READY
  }

  return DEFAULT_STORY_PAGE_IMAGE_STATUS
}

/** Normalize untrusted or legacy page image fields into a stable shape. */
export function normalizeStoryPageImageFields(
  fields: StoryPageImageFields = {},
): StoryPageImageData {
  const imageStatus = inferStoryPageImageStatus(fields)

  return {
    imagePrompt: readTrimmedString(fields.imagePrompt),
    imageUrl: readTrimmedString(fields.imageUrl),
    imageStatus,
    imageError:
      imageStatus === StoryPageImageStatuses.FAILED
        ? readTrimmedString(fields.imageError)
        : undefined,
    imageGeneratedAt:
      imageStatus === StoryPageImageStatuses.READY
        ? readIsoTimestamp(fields.imageGeneratedAt)
        : undefined,
  }
}

export function resolveStoryPageImageFields(
  page: StoryPage,
  imagePrompts: StoryImagePrompt[] = [],
): StoryPageImageData {
  const matchedPrompt = imagePrompts.find((prompt) => prompt.pageNumber === page.pageNumber)

  return normalizeStoryPageImageFields({
    imagePrompt: page.imagePrompt ?? matchedPrompt?.prompt,
    imageUrl: page.imageUrl,
    imageStatus: page.imageStatus,
    imageError: page.imageError,
    imageGeneratedAt: page.imageGeneratedAt,
  })
}

export interface StoryImagePromptStorageRow {
  page_number: number
  prompt_text: string
  image_url?: string | null
  status?: string | null
}

/** Merge illustration metadata from storage rows onto story pages without losing page text. */
export function mergeImagePromptRowsIntoStoryPages(
  pages: StoryPage[],
  promptRows: StoryImagePromptStorageRow[],
): StoryPage[] {
  if (promptRows.length === 0) {
    return pages.map((page) => ({
      ...page,
      ...normalizeStoryPageImageFields(page),
    }))
  }

  const promptsByPage = new Map(
    promptRows.map((row) => [row.page_number, row] as const),
  )

  return pages.map((page) => {
    const row = promptsByPage.get(page.pageNumber)
    const hasPageImageState =
      page.imageStatus !== undefined ||
      page.imageUrl !== undefined ||
      page.imagePrompt !== undefined ||
      page.imageError !== undefined ||
      page.imageGeneratedAt !== undefined

    if (hasPageImageState) {
      return {
        ...page,
        ...normalizeStoryPageImageFields(page),
      }
    }

    if (!row) {
      return {
        ...page,
        ...normalizeStoryPageImageFields(page),
      }
    }

    return {
      ...page,
      ...normalizeStoryPageImageFields({
        imagePrompt: row.prompt_text,
        imageUrl: row.image_url ?? undefined,
        imageStatus: mapStorageImageStatusToPageStatus(row.status, row.image_url),
      }),
    }
  })
}

/** Normalize image fields on every page while preserving story content. */
export function normalizeGeneratedStoryPageImages(story: GeneratedStory): GeneratedStory {
  const storyPages = mergeImagePromptRowsIntoStoryPages(story.storyPages, [])

  return {
    ...story,
    storyPages,
  }
}

/** Default image payload for a page before generation is requested. */
export function createDefaultStoryPageImageData(
  imagePrompt?: string,
): StoryPageImageData {
  return normalizeStoryPageImageFields({
    imagePrompt,
    imageStatus: DEFAULT_STORY_PAGE_IMAGE_STATUS,
  })
}

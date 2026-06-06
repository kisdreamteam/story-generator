/** Per-page illustration pipeline status for story pages. */
export const StoryPageImageStatuses = {
  NONE: 'none',
  QUEUED: 'queued',
  GENERATING: 'generating',
  READY: 'ready',
  FAILED: 'failed',
} as const

export type StoryPageImageStatus =
  (typeof StoryPageImageStatuses)[keyof typeof StoryPageImageStatuses]

/** Optional image fields attached to a generated story page. */
export interface StoryPageImageFields {
  /** Illustration prompt for this page. */
  imagePrompt?: string
  /** Resolved illustration URL when ready. */
  imageUrl?: string
  /** Pipeline status for this page's illustration. */
  imageStatus?: StoryPageImageStatus
  /** Teacher-safe error detail when status is failed. */
  imageError?: string
  /** ISO timestamp when the illustration was generated. */
  imageGeneratedAt?: string
}

/**
 * Normalized per-page image payload — status is always resolved for UI and pipelines.
 * Other fields remain optional until image generation runs.
 */
export interface StoryPageImageData extends StoryPageImageFields {
  imageStatus: StoryPageImageStatus
}

export type StoryImageViewState = 'ready' | 'placeholder' | 'queued' | 'generating' | 'failed'

export interface StoryImageDisplayModel {
  viewState: StoryImageViewState
  imageUrl?: string
  imagePrompt?: string
  statusLabel?: string
  imageError?: string
  imageGeneratedAt?: string
}

export const DEFAULT_STORY_PAGE_IMAGE_STATUS = StoryPageImageStatuses.NONE

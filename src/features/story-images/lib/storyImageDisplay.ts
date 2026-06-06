import {
  StoryPageImageStatuses,
  type StoryImageDisplayModel,
  type StoryPageImageFields,
} from '../types'
import { normalizeStoryPageImageFields, resolveStoryPageImageFields } from './normalizeStoryPageImage'

export function resolveStoryImageViewState(
  imageUrl?: string,
  imageStatus?: StoryPageImageFields['imageStatus'],
): StoryImageDisplayModel['viewState'] {
  if (imageStatus === StoryPageImageStatuses.FAILED) {
    return 'failed'
  }

  if (imageStatus === StoryPageImageStatuses.GENERATING) {
    return 'generating'
  }

  if (imageStatus === StoryPageImageStatuses.QUEUED) {
    return 'queued'
  }

  if (imageUrl && (!imageStatus || imageStatus === StoryPageImageStatuses.READY)) {
    return 'ready'
  }

  return 'placeholder'
}

const STATUS_LABELS: Record<
  Exclude<StoryImageDisplayModel['viewState'], 'ready' | 'placeholder'>,
  string
> = {
  queued: 'Illustration queued',
  generating: 'Generating illustration',
  failed: 'Illustration unavailable',
}

export function buildStoryImageDisplayModel(
  fields: StoryPageImageFields,
): StoryImageDisplayModel {
  const normalized = normalizeStoryPageImageFields(fields)
  const viewState = resolveStoryImageViewState(normalized.imageUrl, normalized.imageStatus)

  return {
    viewState,
    imageUrl: normalized.imageUrl,
    imagePrompt: normalized.imagePrompt,
    imageError: normalized.imageError,
    imageGeneratedAt: normalized.imageGeneratedAt,
    statusLabel:
      viewState === 'failed'
        ? normalized.imageError ?? STATUS_LABELS.failed
        : viewState === 'queued' || viewState === 'generating'
          ? STATUS_LABELS[viewState]
          : undefined,
  }
}

export { resolveStoryPageImageFields, normalizeStoryPageImageFields }

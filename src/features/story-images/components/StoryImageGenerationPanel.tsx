import { AppButton, SectionCard } from '@/shared/components'
import { resolveStoryPageImageFields } from '../lib/storyImageDisplay'
import { IMAGE_STATUS_LABELS } from '../lib/storyPageImageGeneration.utils'
import { StoryPageImageStatuses } from '../types/storyImage.types'

export interface StoryImageGenerationPanelProps {
  missingCount: number
  isGenerating: boolean
  lastError?: string | null
  onGenerateMissing: () => void
  onSave?: () => void
  canSave?: boolean
  isSaving?: boolean
  readyCount: number
  failedCount: number
  totalPages: number
}

export function StoryImageGenerationPanel({
  missingCount,
  isGenerating,
  lastError,
  onGenerateMissing,
  onSave,
  canSave = false,
  isSaving = false,
  readyCount,
  failedCount,
  totalPages,
}: StoryImageGenerationPanelProps) {
  const generateLabel =
    missingCount === 0
      ? 'All page images ready'
      : missingCount === 1
        ? 'Generate 1 missing image'
        : `Generate ${missingCount} missing images`

  return (
    <SectionCard
      title="Illustrations"
      description="Generate classroom-ready page images from your saved prompts. Ready images are kept."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-700">
            {readyCount}/{totalPages} ready
          </span>
          {missingCount > 0 ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-900 ring-1 ring-amber-200">
              {missingCount} missing
            </span>
          ) : null}
          {failedCount > 0 ? (
            <span className="rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-800 ring-1 ring-red-200">
              {failedCount} failed
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <AppButton
            type="button"
            onClick={onGenerateMissing}
            disabled={isGenerating || missingCount === 0}
            fullWidth
            className="sm:w-auto"
          >
            {isGenerating ? 'Generating images…' : generateLabel}
          </AppButton>
          {onSave ? (
            <AppButton
              type="button"
              variant="secondary"
              onClick={onSave}
              disabled={!canSave || isSaving || isGenerating}
              fullWidth
              className="sm:w-auto"
            >
              {isSaving ? 'Saving…' : 'Save illustrations'}
            </AppButton>
          ) : null}
        </div>

        {lastError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {lastError}
          </p>
        ) : null}
      </div>
    </SectionCard>
  )
}

export function StoryPageImageStatusBadge({
  pageNumber,
  page,
  imagePrompts,
  isGenerating = false,
}: {
  pageNumber: number
  page: import('@/features/stories/types').StoryPage
  imagePrompts: import('@/features/stories/types').StoryImagePrompt[]
  isGenerating?: boolean
}) {
  const fields = resolveStoryPageImageFields(page, imagePrompts)
  const status = isGenerating ? StoryPageImageStatuses.GENERATING : fields.imageStatus
  const label = IMAGE_STATUS_LABELS[status ?? StoryPageImageStatuses.NONE]

  const tone =
    status === StoryPageImageStatuses.READY
      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
      : status === StoryPageImageStatuses.FAILED
        ? 'bg-red-50 text-red-800 ring-red-200'
        : status === StoryPageImageStatuses.GENERATING
          ? 'bg-brand-50 text-brand-800 ring-brand-200'
          : status === StoryPageImageStatuses.QUEUED
            ? 'bg-sky-50 text-sky-800 ring-sky-200'
            : 'bg-stone-100 text-stone-700 ring-stone-200'

  return (
    <span
      className={['rounded-full px-2.5 py-1 text-[11px] font-medium ring-1', tone].join(' ')}
      aria-label={`Page ${pageNumber} image status: ${label}`}
    >
      {label}
    </span>
  )
}

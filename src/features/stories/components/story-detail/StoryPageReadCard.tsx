import { memo } from 'react'
import { AppButton, AppCard } from '@/shared/components'
import {
  StoryImage,
  StoryPageImageStatusBadge,
} from '@/features/story-images'
import { resolveStoryPageImageFields } from '@/features/story-images/lib/storyImageDisplay'
import { displayDetailValue } from '../../utils/storyDetailView'
import type { StoryImagePrompt, StoryPage } from '../../types'

interface StoryPageReadCardProps {
  page: StoryPage
  imagePrompts?: StoryImagePrompt[]
  isGenerating?: boolean
  onRegenerate?: () => void
  showImageActions?: boolean
}

/**
 * One read-only story page — memoized so parent re-renders (e.g. detail header state)
 * do not re-render every page card when page content is unchanged.
 */
export const StoryPageReadCard = memo(function StoryPageReadCard({
  page,
  imagePrompts = [],
  isGenerating = false,
  onRegenerate,
  showImageActions = false,
}: StoryPageReadCardProps) {
  const imageFields = resolveStoryPageImageFields(page, imagePrompts)
  const canRegenerate = showImageActions && Boolean(onRegenerate)

  return (
    <AppCard padding="md" className="border-stone-200 bg-white">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            Page {page.pageNumber}
          </span>
          {showImageActions ? (
            <StoryPageImageStatusBadge
              pageNumber={page.pageNumber}
              page={page}
              imagePrompts={imagePrompts}
              isGenerating={isGenerating}
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canRegenerate ? (
            <AppButton
              type="button"
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={isGenerating}
              onClick={onRegenerate}
            >
              {isGenerating ? 'Generating…' : 'Regenerate image'}
            </AppButton>
          ) : null}
          <span className="text-xs text-stone-500">{page.wordCount} words</span>
        </div>
      </div>
      <StoryImage
        {...imageFields}
        alt={`Illustration for page ${page.pageNumber}`}
        className="mb-4"
      />
      <p className="whitespace-pre-line text-base leading-[1.75] text-stone-900">{page.text}</p>
      <div className="mt-4 rounded-lg border border-stone-100 bg-stone-50/80 px-3 py-2.5">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Teaching focus</p>
        <p className="mt-1 text-sm leading-relaxed text-stone-700">
          {displayDetailValue(page.teachingFocus, 'No teaching focus noted for this page.')}
        </p>
      </div>
    </AppCard>
  )
})

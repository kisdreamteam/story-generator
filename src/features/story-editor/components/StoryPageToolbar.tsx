import { AppButton } from '@/shared/components'
import { MIN_STORY_PAGE_COUNT } from '../utils/storyPageListMutations'

export interface StoryPageToolbarProps {
  currentPageNumber: number
  totalPages: number
  canMoveUp: boolean
  canMoveDown: boolean
  disabled?: boolean
  onAddPage: () => void
  onRemovePage: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  className?: string
}

export function StoryPageToolbar({
  currentPageNumber,
  totalPages,
  canMoveUp,
  canMoveDown,
  disabled = false,
  onAddPage,
  onRemovePage,
  onMoveUp,
  onMoveDown,
  className = '',
}: StoryPageToolbarProps) {
  const canRemove = totalPages > MIN_STORY_PAGE_COUNT

  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Page actions"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-stone-800">
          Page {currentPageNumber}{' '}
          <span className="font-normal text-stone-500">of {totalPages}</span>
        </p>
        <p className="text-xs text-stone-500">Reorder, add, or remove pages in your story.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={onMoveUp}
          disabled={disabled || !canMoveUp}
          fullWidth
          className="sm:w-auto"
        >
          Move up
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={onMoveDown}
          disabled={disabled || !canMoveDown}
          fullWidth
          className="sm:w-auto"
        >
          Move down
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={onAddPage}
          disabled={disabled}
          fullWidth
          className="sm:w-auto"
        >
          Add page
        </AppButton>
        <AppButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemovePage}
          disabled={disabled || !canRemove}
          fullWidth
          className="sm:w-auto"
        >
          Remove page
        </AppButton>
      </div>
    </div>
  )
}

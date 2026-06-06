import { AppButton } from '@/shared/components'

export interface StoryPageNavigationProps {
  currentPageNumber: number
  currentIndex: number
  totalPages: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
  disabled?: boolean
  className?: string
}

export function StoryPageNavigation({
  currentPageNumber,
  currentIndex,
  totalPages,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  disabled = false,
  className = '',
}: StoryPageNavigationProps) {
  if (totalPages === 0) {
    return null
  }

  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Page navigation"
    >
      <p className="text-center text-sm font-medium text-stone-800 sm:text-left">
        Page {currentPageNumber}{' '}
        <span className="font-normal text-stone-500">
          ({currentIndex + 1} of {totalPages})
        </span>
      </p>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
        <AppButton
          type="button"
          variant="secondary"
          onClick={onPrevious}
          disabled={disabled || !canGoPrevious}
          fullWidth
          className="sm:w-auto"
        >
          Previous
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          onClick={onNext}
          disabled={disabled || !canGoNext}
          fullWidth
          className="sm:w-auto"
        >
          Next
        </AppButton>
      </div>
    </div>
  )
}

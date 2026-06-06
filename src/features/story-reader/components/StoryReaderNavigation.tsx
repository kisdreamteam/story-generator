import { AppButton } from '@/shared/components'

interface StoryReaderNavigationProps {
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
  nextLabel?: string
  disabled?: boolean
}

export function StoryReaderNavigation({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  nextLabel = 'Next',
  disabled = false,
}: StoryReaderNavigationProps) {
  return (
    <nav
      aria-label="Story reader navigation"
      className="grid grid-cols-2 gap-3 sm:flex sm:justify-between"
    >
      <AppButton
        type="button"
        variant="secondary"
        fullWidth
        className="sm:min-w-36"
        onClick={onPrevious}
        disabled={!canGoPrevious || disabled}
      >
        Previous
      </AppButton>
      <AppButton
        type="button"
        fullWidth
        className="sm:min-w-36"
        onClick={onNext}
        disabled={!canGoNext || disabled}
      >
        {nextLabel}
      </AppButton>
    </nav>
  )
}

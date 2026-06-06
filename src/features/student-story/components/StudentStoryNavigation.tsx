import { AppButton } from '@/shared/components'

interface StudentStoryNavigationProps {
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
  nextLabel?: string
}

export function StudentStoryNavigation({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  nextLabel = 'Next',
}: StudentStoryNavigationProps) {
  return (
    <nav
      aria-label="Story navigation"
      className="grid grid-cols-2 gap-3 sm:gap-4"
    >
      <AppButton
        type="button"
        variant="secondary"
        fullWidth
        className="min-h-14 text-lg"
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        Previous
      </AppButton>
      <AppButton
        type="button"
        fullWidth
        className="min-h-14 text-lg"
        onClick={onNext}
        disabled={!canGoNext}
      >
        {nextLabel}
      </AppButton>
    </nav>
  )
}

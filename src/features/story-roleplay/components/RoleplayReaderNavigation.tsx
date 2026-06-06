import { AppButton } from '@/shared/components'

interface RoleplayReaderNavigationProps {
  canGoPrevious: boolean
  canGoNext: boolean
  progressLabel: string
  progressPercent: number
  onPrevious: () => void
  onNext: () => void
}

export function RoleplayReaderNavigation({
  canGoPrevious,
  canGoNext,
  progressLabel,
  progressPercent,
  onPrevious,
  onNext,
}: RoleplayReaderNavigationProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 text-sm text-stone-600">
        <span className="font-medium">{progressLabel}</span>
        <span>{progressPercent}%</span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Roleplay progress"
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <nav aria-label="Roleplay line navigation" className="grid grid-cols-2 gap-3 sm:gap-4">
        <AppButton
          type="button"
          variant="secondary"
          fullWidth
          className="min-h-14 text-base sm:text-lg"
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          Previous
        </AppButton>
        <AppButton
          type="button"
          fullWidth
          className="min-h-14 text-base sm:text-lg"
          onClick={onNext}
          disabled={!canGoNext}
        >
          Next
        </AppButton>
      </nav>
    </div>
  )
}

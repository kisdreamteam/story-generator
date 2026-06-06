import { AppButton } from '@/shared/components'

interface StoryDetailNavProps {
  onBack: () => void
  onContinueInCreator?: () => void
  /** Defaults to "Open in creator" */
  continueLabel?: string
}

export function StoryDetailNav({
  onBack,
  onContinueInCreator,
  continueLabel = 'Open in creator',
}: StoryDetailNavProps) {
  return (
    <nav aria-label="Story navigation" className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
      <AppButton type="button" variant="ghost" onClick={onBack} fullWidth className="sm:w-auto">
        ← Your stories
      </AppButton>
      {onContinueInCreator && (
        <AppButton
          type="button"
          variant="secondary"
          onClick={onContinueInCreator}
          fullWidth
          className="sm:w-auto"
        >
          {continueLabel}
        </AppButton>
      )}
    </nav>
  )
}

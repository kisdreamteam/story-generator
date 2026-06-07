import { AppButton } from '@/shared/components'
import { panelShellClass } from '@/shared/styles/surfaceClasses'

interface StoryOutputActionsProps {
  onSaveStory: () => void
  onViewStory: () => void
  onEditStory: () => void
  onStartOver: () => void
  storySaved?: boolean
  isSavingStory?: boolean
  isBusy?: boolean
}

export function StoryOutputActions({
  onSaveStory,
  onViewStory,
  onEditStory,
  onStartOver,
  storySaved = false,
  isSavingStory = false,
  isBusy = false,
}: StoryOutputActionsProps) {
  const primaryLabel = isSavingStory
    ? 'Saving to Your stories…'
    : storySaved
      ? 'Open in Your stories'
      : 'Save to Your stories'

  return (
    <div className={`${panelShellClass} space-y-3 p-4 shadow-sm sm:p-5`}>
      {!storySaved && !isSavingStory && (
        <p className="text-sm leading-relaxed text-stone-600">
          Your story is ready to read. Save it to Your stories so you can open, edit, or print it
          later.
        </p>
      )}

      {storySaved && (
        <p className="text-sm leading-relaxed text-stone-600">
          Saved to Your stories. Open it for Quick edit on the detail page, or Advanced editor for
          structure and version history.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <AppButton
          type="button"
          onClick={storySaved ? onViewStory : onSaveStory}
          disabled={isBusy}
          fullWidth
          className="sm:w-auto"
        >
          {primaryLabel}
        </AppButton>
        <div className="flex gap-2">
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={onEditStory}
            disabled={!storySaved || isBusy}
            fullWidth
            className="sm:w-auto"
          >
            Advanced editor
          </AppButton>
          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onStartOver}
            disabled={isBusy}
            fullWidth
            className="sm:ml-auto sm:w-auto"
          >
            Start over
          </AppButton>
        </div>
      </div>
    </div>
  )
}

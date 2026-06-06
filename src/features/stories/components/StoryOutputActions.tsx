import { AppButton } from '../../../shared/components'

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
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      {!storySaved && !isSavingStory && (
        <p className="text-sm leading-relaxed text-stone-600">
          Your story is ready to read. Save it to Your stories so you can open, edit, or print it
          later.
        </p>
      )}

      {storySaved && (
        <p className="text-sm leading-relaxed text-stone-600">
          Saved to Your stories. Open it anytime or edit individual pages, vocabulary, and illustration
          notes.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <AppButton
          type="button"
          onClick={storySaved ? onViewStory : onSaveStory}
          disabled={isBusy}
          fullWidth
          className="sm:w-auto"
        >
          {primaryLabel}
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          onClick={onEditStory}
          disabled={!storySaved || isBusy}
          fullWidth
          className="sm:w-auto"
        >
          Edit pages
        </AppButton>
        <AppButton
          type="button"
          variant="ghost"
          onClick={onStartOver}
          disabled={isBusy}
          fullWidth
          className="sm:ml-auto sm:w-auto"
        >
          Start over
        </AppButton>
      </div>
    </div>
  )
}

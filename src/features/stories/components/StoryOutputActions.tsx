import { AppButton } from '../../../shared/components'

interface StoryOutputActionsProps {
  onSaveStory: () => void
  onViewStory: () => void
  onEditStory: () => void
  onExportStory: () => void
  onStartOver: () => void
  storySaved?: boolean
}

export function StoryOutputActions({
  onSaveStory,
  onViewStory,
  onEditStory,
  onExportStory,
  onStartOver,
  storySaved = false,
}: StoryOutputActionsProps) {
  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      {storySaved && (
        <p className="text-sm text-brand-700" role="status">
          Story saved. Open it from your stories list anytime.
        </p>
      )}
      <p className="text-xs text-stone-500">Edit and export are mock actions for now.</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <AppButton type="button" onClick={storySaved ? onViewStory : onSaveStory}>
          {storySaved ? 'View story' : 'Save story'}
        </AppButton>
        <AppButton type="button" variant="secondary" onClick={onEditStory} disabled={!storySaved}>
          Edit story
        </AppButton>
        <AppButton type="button" variant="secondary" onClick={onExportStory}>
          Export story
        </AppButton>
        <AppButton type="button" variant="ghost" onClick={onStartOver} className="sm:ml-auto">
          Start over
        </AppButton>
      </div>
    </div>
  )
}

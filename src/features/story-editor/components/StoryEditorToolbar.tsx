import { AppButton } from '@/shared/components'
import { formatStoryDate } from '@/features/stories/utils/storyFormat'
import { StoryUnsavedIndicator } from './StoryUnsavedIndicator'

export interface StoryEditorToolbarProps {
  hasUnsavedChanges: boolean
  isSaving: boolean
  isSavingCopy?: boolean
  canSave: boolean
  canSaveAsCopy?: boolean
  onSaveChanges: () => void
  onSaveAsCopy?: () => void
  onCancel: () => void
  createdAtLabel?: string
  updatedAtLabel?: string
  className?: string
}

export function StoryEditorToolbar({
  hasUnsavedChanges,
  isSaving,
  isSavingCopy = false,
  canSave,
  canSaveAsCopy = false,
  onSaveChanges,
  onSaveAsCopy,
  onCancel,
  createdAtLabel,
  updatedAtLabel,
  className = '',
}: StoryEditorToolbarProps) {
  const isBusy = isSaving || isSavingCopy
  const showTimestamps = Boolean(createdAtLabel || updatedAtLabel)

  return (
    <div
      role="toolbar"
      aria-label="Story editor actions"
      className={[
        'sticky top-0 z-10 flex flex-col gap-3 rounded-xl border border-stone-200 bg-white/95 p-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <StoryUnsavedIndicator visible={hasUnsavedChanges} />
          {!hasUnsavedChanges ? (
            <span className="text-xs text-stone-500">Edits stay in memory until you save.</span>
          ) : null}
        </div>
        {showTimestamps ? (
          <p className="text-xs text-stone-500">
            {createdAtLabel ? <>Created {createdAtLabel}</> : null}
            {createdAtLabel && updatedAtLabel ? <> · </> : null}
            {updatedAtLabel ? <>Last saved {updatedAtLabel}</> : null}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
        <AppButton
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isBusy}
          fullWidth
          className="sm:w-auto"
        >
          Cancel
        </AppButton>
        {onSaveAsCopy ? (
          <AppButton
            type="button"
            variant="secondary"
            onClick={onSaveAsCopy}
            disabled={!canSaveAsCopy || isBusy}
            fullWidth
            className="sm:w-auto"
          >
            {isSavingCopy ? 'Saving copy…' : 'Save as copy'}
          </AppButton>
        ) : null}
        <AppButton
          type="button"
          onClick={onSaveChanges}
          disabled={!canSave || isBusy}
          fullWidth
          className={onSaveAsCopy ? 'col-span-2 sm:col-span-1 sm:w-auto' : 'sm:w-auto'}
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </AppButton>
      </div>
    </div>
  )
}

/** Format ISO timestamps for the editor toolbar. */
export function formatStoryEditorTimestamp(iso: string | undefined): string | undefined {
  if (!iso?.trim()) return undefined
  return formatStoryDate(iso)
}

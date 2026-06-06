import { AppButton } from '@/shared/components'
import type { StoryAutosaveStatus as StoryAutosaveStatusValue } from '../utils/storyAutosaveStatus'
import type { StoryEditorViewMode } from '../hooks/useStoryEditorViewMode'
import { StoryAutosaveStatus } from './StoryAutosaveStatus'
import { StoryEditorModeToggle } from './StoryEditorModeToggle'
import { StoryUnsavedIndicator } from './StoryUnsavedIndicator'

export interface StoryEditingToolbarProps {
  autosaveStatus: StoryAutosaveStatusValue
  hasUnsavedChanges?: boolean
  mode: StoryEditorViewMode
  onModeChange: (mode: StoryEditorViewMode) => void
  isSaving: boolean
  canSave: boolean
  canUndo: boolean
  canRestoreVersion: boolean
  onSave: () => void
  onUndo: () => void
  onRestoreVersion: () => void
  onExit: () => void
  className?: string
}

export function StoryEditingToolbar({
  autosaveStatus,
  hasUnsavedChanges = false,
  mode,
  onModeChange,
  isSaving,
  canSave,
  canUndo,
  canRestoreVersion,
  onSave,
  onUndo,
  onRestoreVersion,
  onExit,
  className = '',
}: StoryEditingToolbarProps) {
  const isPreviewMode = mode === 'preview'

  return (
    <div
      role="toolbar"
      aria-label="Story editing actions"
      className={[
        'sticky top-0 z-10 rounded-xl border border-stone-200 bg-white/95 p-3 shadow-sm backdrop-blur-sm sm:p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StoryAutosaveStatus status={autosaveStatus} />
        <StoryUnsavedIndicator visible={hasUnsavedChanges} />
        {isPreviewMode ? (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200">
            Previewing edits
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <StoryEditorModeToggle
          mode={mode}
          onModeChange={onModeChange}
          disabled={isSaving}
          className="sm:order-first"
        />

        <AppButton
          type="button"
          onClick={onSave}
          disabled={!canSave}
          fullWidth
          className="sm:order-last sm:w-auto"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </AppButton>

        <div className="grid grid-cols-2 gap-2 sm:order-2 sm:flex sm:flex-wrap sm:gap-2">
          <AppButton
            type="button"
            variant="secondary"
            onClick={onUndo}
            disabled={!canUndo}
            fullWidth
            className="sm:w-auto"
          >
            Undo changes
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            onClick={onRestoreVersion}
            disabled={!canRestoreVersion}
            fullWidth
            className="sm:w-auto"
          >
            Restore version
          </AppButton>
          <AppButton
            type="button"
            variant="ghost"
            onClick={onExit}
            disabled={isSaving}
            fullWidth
            className="col-span-2 sm:col-span-1 sm:w-auto"
          >
            Exit editing
          </AppButton>
        </div>
      </div>
    </div>
  )
}

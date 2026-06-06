import { AppButton } from '@/shared/components'

interface StoryDetailNavProps {
  onBack: () => void
  onViewStory?: () => void
  onContinueEditing?: () => void
  onReadStory?: () => void
  onRoleplay?: () => void
  /** When true, story plan only — label becomes "Open creator". */
  isSetupOnly?: boolean
  continueEditingActive?: boolean
}

export function StoryDetailNav({
  onBack,
  onViewStory,
  onContinueEditing,
  onReadStory,
  onRoleplay,
  isSetupOnly = false,
  continueEditingActive = false,
}: StoryDetailNavProps) {
  const showPreviewStory = Boolean(onViewStory) && continueEditingActive
  const showEditAction = Boolean(onContinueEditing) && !continueEditingActive
  const editLabel = isSetupOnly ? 'Open creator' : 'Edit pages'

  return (
    <nav aria-label="Story navigation" className="flex w-full flex-col gap-2 sm:w-auto">
      <AppButton type="button" variant="ghost" onClick={onBack} fullWidth className="sm:w-auto">
        ← Your stories
      </AppButton>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {showPreviewStory ? (
          <AppButton type="button" variant="primary" onClick={onViewStory} className="col-span-2 sm:col-span-1">
            Preview story
          </AppButton>
        ) : null}
        {showEditAction ? (
          <AppButton type="button" variant="secondary" onClick={onContinueEditing} className="col-span-2 sm:col-span-1">
            {editLabel}
          </AppButton>
        ) : null}
        {onReadStory ? (
          <AppButton type="button" onClick={onReadStory}>
            Read story
          </AppButton>
        ) : null}
        {onRoleplay ? (
          <AppButton type="button" variant="secondary" onClick={onRoleplay}>
            Roleplay
          </AppButton>
        ) : null}
      </div>
    </nav>
  )
}

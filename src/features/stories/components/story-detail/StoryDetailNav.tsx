import { AppButton } from '@/shared/components'

interface StoryDetailNavProps {
  onBack: () => void
  onViewStory?: () => void
  onContinueEditing?: () => void
  onOpenAdvancedEditor?: () => void
  onReadStory?: () => void
  onRoleplay?: () => void
  /** When true, story plan only — label matches library card action. */
  isSetupOnly?: boolean
  continueEditingActive?: boolean
}

export function StoryDetailNav({
  onBack,
  onViewStory,
  onContinueEditing,
  onOpenAdvancedEditor,
  onReadStory,
  onRoleplay,
  isSetupOnly = false,
  continueEditingActive = false,
}: StoryDetailNavProps) {
  const showPreviewStory = Boolean(onViewStory) && continueEditingActive
  const showQuickEdit = Boolean(onContinueEditing) && !continueEditingActive && !isSetupOnly
  const showContinuePlan = Boolean(onContinueEditing) && !continueEditingActive && isSetupOnly
  const showAdvancedEditor = Boolean(onOpenAdvancedEditor) && !continueEditingActive && !isSetupOnly
  const showReadStory = Boolean(onReadStory) && !continueEditingActive
  const showSecondaryRow = showQuickEdit || showAdvancedEditor || Boolean(onRoleplay)

  return (
    <nav aria-label="Story navigation" className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <AppButton type="button" variant="ghost" size="sm" onClick={onBack} fullWidth className="sm:w-auto">
        ← Your stories
      </AppButton>

      {showPreviewStory ? (
        <AppButton type="button" variant="primary" onClick={onViewStory} fullWidth className="sm:w-auto">
          Preview story
        </AppButton>
      ) : null}

      {showReadStory ? (
        <AppButton type="button" variant="primary" onClick={onReadStory} fullWidth className="sm:w-auto">
          Read story
        </AppButton>
      ) : null}

      {showContinuePlan ? (
        <AppButton
          type="button"
          variant="primary"
          onClick={onContinueEditing}
          fullWidth
          className="sm:w-auto"
        >
          Continue editing
        </AppButton>
      ) : null}

      {showSecondaryRow ? (
        <div className="flex w-full gap-2 sm:w-auto">
          {showQuickEdit ? (
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={onContinueEditing}
              fullWidth
              className="sm:w-auto"
            >
              Quick edit
            </AppButton>
          ) : null}
          {showAdvancedEditor ? (
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenAdvancedEditor}
              fullWidth
              className="sm:w-auto"
            >
              Advanced editor
            </AppButton>
          ) : null}
          {onRoleplay ? (
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRoleplay}
              fullWidth
              className="sm:w-auto"
            >
              Roleplay
            </AppButton>
          ) : null}
        </div>
      ) : null}
    </nav>
  )
}

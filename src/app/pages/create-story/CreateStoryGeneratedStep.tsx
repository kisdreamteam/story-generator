import { useCallback } from 'react'
import { AppButton, ErrorState, SaveStatusIndicator } from '@/shared/components'
import type { SaveStatus } from '@/shared/lib/autosave/saveStatus'
import {
  useGenerationFailureState,
  useGenerationStatus,
  useIsGenerating,
  useStoryWorkflowActions,
} from '@/features/story-generator'
import { useImagePromptReview } from '@/features/story-images'
import {
  StoryEmptyState,
  StoryGenerationLoading,
  StoryGenerationRecovery,
  StoryOutputActions,
  StoryReadOnlyView,
  StoryStatusBadge,
  type GeneratedStory,
  type StorySetupInput,
} from '@/features/stories'
import { getCreateFlowStoryStatusLabel } from '@/features/stories/utils/storyStatus'

interface CreateStoryGeneratedStepProps {
  generatedStory: GeneratedStory | null
  setupData: StorySetupInput | null
  storySaved: boolean
  saveError: string | null
  isSavingStory?: boolean
  isMutating?: boolean
  isRetrying?: boolean
  showStartOverInHeader: boolean
  onSaveStory: () => void
  onViewStory: () => void
  onEditStory: () => void
  onStartOver: () => void
  onBackToReview: () => void
  onRetryGeneration?: () => void
  onCancelGeneration?: () => void
  onDismissRecovery?: () => void
  saveStatus?: SaveStatus
}

export function CreateStoryGeneratedStep({
  generatedStory,
  setupData,
  storySaved,
  saveError,
  isSavingStory = false,
  isMutating = false,
  isRetrying = false,
  showStartOverInHeader,
  onSaveStory,
  onViewStory,
  onEditStory,
  onStartOver,
  onBackToReview,
  onRetryGeneration,
  onCancelGeneration,
  onDismissRecovery,
  saveStatus = 'idle',
}: CreateStoryGeneratedStepProps) {
  const isGenerating = useIsGenerating()
  const generationStatus = useGenerationStatus()
  const failureState = useGenerationFailureState()
  const { setGeneratedStory } = useStoryWorkflowActions()

  const handlePromptsChange = useCallback(
    (prompts: GeneratedStory['imagePrompts']) => {
      if (!generatedStory) return
      setGeneratedStory({ ...generatedStory, imagePrompts: prompts })
    },
    [generatedStory, setGeneratedStory],
  )

  const imagePromptReview = useImagePromptReview(generatedStory, {
    onPromptsChange: handlePromptsChange,
  })

  const showRecovery =
    isGenerating ||
    generationStatus === 'error' ||
    Boolean(failureState.message) ||
    failureState.cancelled

  const statusLabel = getCreateFlowStoryStatusLabel({
    step: 'generated',
    hasGeneratedStory: Boolean(generatedStory),
    storySaved,
  })
  const isBusy = isGenerating || isSavingStory || isMutating || isRetrying
  const showPartialPreview = Boolean(generatedStory) && failureState.hasPartialContent

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-1 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">Your new story</h2>
            {statusLabel && !isGenerating ? <StoryStatusBadge label={statusLabel} /> : null}
            {!isGenerating ? <SaveStatusIndicator status={saveStatus} /> : null}
          </div>
          <p className="text-sm leading-relaxed text-stone-600">
            {isGenerating
              ? 'Hang tight — we are writing your pages, vocabulary cards, and illustration notes from your plan.'
              : generatedStory
                ? showPartialPreview
                  ? 'We kept the story content generated so far. Retry to finish, edit your plan, or save this draft.'
                  : storySaved
                    ? 'Open it from Your stories anytime.'
                    : 'Read through everything below, then save to Your stories.'
                : 'Your story plan is still here. Go back to review if you want to change anything before generating.'}
          </p>
        </div>
        {showStartOverInHeader && (
          <AppButton
            type="button"
            variant="ghost"
            onClick={onStartOver}
            disabled={isBusy}
            className="self-start"
          >
            Start over
          </AppButton>
        )}
      </div>

      {showRecovery ? (
        <StoryGenerationRecovery
          failureKind={failureState.kind}
          message={failureState.message ?? ''}
          canRetry={failureState.canRetry}
          hasPartialContent={failureState.hasPartialContent}
          cancelled={failureState.cancelled}
          isGenerating={isGenerating}
          isRetrying={isRetrying}
          onRetry={onRetryGeneration}
          onEditPlan={setupData ? onBackToReview : undefined}
          onCancel={onCancelGeneration}
          onDismiss={onDismissRecovery}
        />
      ) : null}

      {saveError && (
        <ErrorState
          variant="inline"
          tone="warning"
          title="Could not save your story"
          description={saveError}
        />
      )}

      {isGenerating ? (
        <StoryGenerationLoading />
      ) : generatedStory ? (
        <>
          <StoryOutputActions
            onSaveStory={onSaveStory}
            onViewStory={onViewStory}
            onEditStory={onEditStory}
            onStartOver={onStartOver}
            storySaved={storySaved}
            isSavingStory={isSavingStory}
            isBusy={isBusy}
          />
          <StoryReadOnlyView
            story={generatedStory}
            showUnsavedHint={!storySaved}
            savedToLibrary={storySaved}
            imagePromptReview={{
              prompts: imagePromptReview.prompts,
              originalPrompts: imagePromptReview.baseline,
              onPromptChange: imagePromptReview.updatePrompt,
              onResetPage: imagePromptReview.resetPage,
              onResetAll: imagePromptReview.resetAll,
              isPageModified: imagePromptReview.isPageModified,
              isDirty: imagePromptReview.isDirty,
              disabled: isBusy,
            }}
          />
        </>
      ) : (
        <StoryEmptyState
          title={
            generationStatus === 'error'
              ? 'Story creation did not finish'
              : 'Your story is not ready yet'
          }
          description={
            generationStatus === 'error'
              ? 'Your story plan is still here. Edit your plan and try again, or save your plan and return later.'
              : 'Generate your story from the review step to see pages here.'
          }
          hints={
            generationStatus === 'error'
              ? [
                  'Save your story plan first if you need a break.',
                  'Try simplifying vocabulary or events if creation keeps failing.',
                ]
              : undefined
          }
          actionLabel={setupData ? 'Edit story plan' : undefined}
          onAction={setupData ? onBackToReview : undefined}
        />
      )}
    </div>
  )
}

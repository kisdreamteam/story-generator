import { AppButton } from '@/shared/components'
import { useGenerationErrors, useGenerationStatus, useIsGenerating } from '@/features/story-generator'
import {
  StoryEmptyState,
  StoryGenerationLoading,
  StoryOutputActions,
  StoryReadOnlyView,
  type GeneratedStory,
  type StorySetupInput,
} from '@/features/stories'

interface CreateStoryGeneratedStepProps {
  generatedStory: GeneratedStory | null
  setupData: StorySetupInput | null
  storySaved: boolean
  saveError: string | null
  showStartOverInHeader: boolean
  onSaveStory: () => void
  onViewStory: () => void
  onEditStory: () => void
  onExportStory: () => void
  onStartOver: () => void
  onBackToReview: () => void
}

export function CreateStoryGeneratedStep({
  generatedStory,
  setupData,
  storySaved,
  saveError,
  showStartOverInHeader,
  onSaveStory,
  onViewStory,
  onEditStory,
  onExportStory,
  onStartOver,
  onBackToReview,
}: CreateStoryGeneratedStepProps) {
  const isGenerating = useIsGenerating()
  const generationStatus = useGenerationStatus()
  const generationErrors = useGenerationErrors()

  const generationError = generationStatus === 'error' ? generationErrors[0] : null

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Generated story preview</h2>
          <p className="mt-1 text-sm text-stone-600">
            {isGenerating
              ? 'Creating your story preview…'
              : generatedStory
                ? 'Review your story below, then save it to open the full story page.'
                : 'Confirm your story plan to generate a preview.'}
          </p>
        </div>
        {showStartOverInHeader && (
          <AppButton type="button" variant="ghost" onClick={onStartOver}>
            Start over
          </AppButton>
        )}
      </div>

      {generationError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {generationError}
        </p>
      )}

      {saveError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          {saveError}
        </p>
      )}

      {isGenerating ? (
        <StoryGenerationLoading />
      ) : generatedStory ? (
        <>
          <StoryOutputActions
            onSaveStory={onSaveStory}
            onViewStory={onViewStory}
            onEditStory={onEditStory}
            onExportStory={onExportStory}
            onStartOver={onStartOver}
            storySaved={storySaved}
          />
          <StoryReadOnlyView story={generatedStory} />
        </>
      ) : (
        <StoryEmptyState
          title={generationError ? 'Story generation failed' : 'No story generated yet'}
          description={
            generationError
              ? 'Go back to review and try again. Mock mode still works when AI is unavailable.'
              : 'Confirm your story plan to create a preview.'
          }
          actionLabel={setupData ? 'Back to review' : undefined}
          onAction={setupData ? onBackToReview : undefined}
        />
      )}
    </div>
  )
}

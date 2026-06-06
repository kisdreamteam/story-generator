import { PageHeader } from '@/shared/components'
import {
  StoryCreationProgress,
  StorySetupForm,
  StorySetupReview,
  type StoryCreationStep,
} from '@/features/stories'
import { useGeneratedStory, useIsGenerating } from '@/features/story-generator'
import { CreateStoryGeneratedStep } from './create-story/CreateStoryGeneratedStep'
import { useCreateStoryPageState } from './create-story/useCreateStoryPageState'

export function CreateStoryPage() {
  const {
    step,
    setupData,
    formValues,
    formKey,
    draftSaved,
    draftLoadWarning,
    storySaved,
    saveError,
    showGeneratedPreview,
    handleFormSubmit,
    handleBackToEdit,
    handleSaveDraft,
    handleConfirm,
    handleStartOver,
    handleBackToReview,
    handleSaveStory,
    handleViewStory,
    handleEditStory,
    handleExportStory,
  } = useCreateStoryPageState()

  const generatedStory = useGeneratedStory()
  const isGenerating = useIsGenerating()

  const pageDescription =
    step === 'form'
      ? 'Plan your Nina & Nino story. Fill in the sections below — nothing is sent to AI yet.'
      : step === 'review'
        ? 'Review your story plan before moving on to generation.'
        : isGenerating
          ? 'Creating your story preview…'
          : generatedStory
            ? 'Your story preview is ready.'
            : 'Confirm your story plan to generate a preview.'

  const progressStep: StoryCreationStep =
    step === 'form' ? 'setup' : step === 'review' ? 'review' : 'generated'

  return (
    <>
      <PageHeader title="Create Story" description={pageDescription} />

      <div className="mb-6">
        <StoryCreationProgress currentStep={progressStep} />
      </div>

      {step === 'form' && (
        <>
          {draftLoadWarning && (
            <p
              className="mx-auto mb-4 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              role="status"
            >
              {draftLoadWarning}
            </p>
          )}
          <StorySetupForm key={formKey} initialValues={formValues} onSubmit={handleFormSubmit} />
        </>
      )}

      {step === 'review' && setupData && (
        <StorySetupReview
          setupData={setupData}
          onBack={handleBackToEdit}
          onConfirm={handleConfirm}
          onSaveDraft={handleSaveDraft}
          draftSaved={draftSaved}
        />
      )}

      {step === 'generated' && (
        <CreateStoryGeneratedStep
          generatedStory={generatedStory}
          setupData={setupData}
          storySaved={storySaved}
          saveError={saveError}
          showStartOverInHeader={!showGeneratedPreview}
          onSaveStory={handleSaveStory}
          onViewStory={handleViewStory}
          onEditStory={handleEditStory}
          onExportStory={handleExportStory}
          onStartOver={handleStartOver}
          onBackToReview={handleBackToReview}
        />
      )}
    </>
  )
}

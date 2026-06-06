import { AppButton, ErrorState, LoadingStoryPage, PageHeader, SaveStatusIndicator } from '@/shared/components'
import {
  StoryCreationProgress,
  StorySetupForm,
  StorySetupReview,
  type StoryCreationStep,
} from '@/features/stories'
import { TeacherTemplatePanel } from '@/features/teacher-templates'
import { useGeneratedStory, useIsGenerating } from '@/features/story-generator'
import { CreateStoryGeneratedStep } from './create-story/CreateStoryGeneratedStep'
import { useCreateStoryPageState } from './create-story/useCreateStoryPageState'

export function CreateStoryPage() {
  const {
    step,
    setupData,
    formValues,
    liveFormValues,
    formKey,
    draftSaved,
    draftLoadWarning,
    draftSaveError,
    isDraftLoading,
    sessionRestored,
    dismissSessionRestored,
    saveStatus,
    isSavingDraft,
    isSavingStory,
    isConfirming,
    isRetryingGeneration,
    storySaved,
    saveError,
    showGeneratedPreview,
    handleFormSubmit,
    handleFormValuesChange,
    handleApplyTemplate,
    handleSaveTemplate,
    handleDeleteTemplate,
    templateSummaries,
    templatesLoading,
    isSavingTemplate,
    templateError,
    selectedTemplateId,
    handleBackToEdit,
    handleSaveDraft,
    handleConfirm,
    handleStartOver,
    handleBackToReview,
    handleRetryGeneration,
    handleCancelGeneration,
    handleDismissRecovery,
    handleSaveStory,
    handleViewStory,
    handleEditStory,
    handleExportStory,
  } = useCreateStoryPageState()

  const generatedStory = useGeneratedStory()
  const isGenerating = useIsGenerating()

  const pageDescription =
    step === 'form'
      ? 'Tell us about your lesson — we will turn it into a classroom story.'
      : step === 'review'
        ? 'Check your plan, save it for later, or generate your full story now.'
        : isGenerating
          ? 'Creating your story — please keep this tab open.'
          : generatedStory
            ? storySaved
              ? 'Your story is saved in Your stories. Open it anytime to read or edit.'
              : 'Read through your story, then save it to Your stories.'
            : 'Generate your story from the review step.'

  const progressStep: StoryCreationStep =
    step === 'form' ? 'setup' : step === 'review' ? 'review' : 'generated'

  if (isDraftLoading) {
    return (
      <>
        <PageHeader
          title="Create story"
          description="Loading your saved story plan from Your stories…"
        />
        <div className="mx-auto max-w-2xl px-1 sm:px-0">
          <LoadingStoryPage variant="draft" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Create story" description={pageDescription} />

      <div className="mb-6 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between sm:px-0">
        <StoryCreationProgress currentStep={progressStep} />
        <SaveStatusIndicator status={saveStatus} className="self-start sm:self-center" />
      </div>

      {sessionRestored && (
        <div className="mx-auto mb-4 flex max-w-2xl flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between sm:px-0">
          <ErrorState
            variant="inline"
            tone="info"
            description="We restored your in-progress work from this browser session."
          />
          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={dismissSessionRestored}
            className="self-start sm:self-center"
          >
            Dismiss
          </AppButton>
        </div>
      )}

      {step === 'form' && (
        <>
          {draftLoadWarning && (
            <div className="mx-auto mb-4 max-w-2xl px-1 sm:px-0">
              <ErrorState
                variant="inline"
                tone="warning"
                title="Story plan not found"
                description={draftLoadWarning}
              />
            </div>
          )}
          <div className="mx-auto mb-6 max-w-2xl px-1 sm:px-0">
            <TeacherTemplatePanel
              templates={templateSummaries}
              selectedTemplateId={selectedTemplateId}
              onApplyTemplate={handleApplyTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              formValues={liveFormValues}
              isLoading={templatesLoading}
              isSaving={isSavingTemplate}
              error={templateError}
              onSave={handleSaveTemplate}
            />
          </div>
          <StorySetupForm
            key={formKey}
            initialValues={formValues}
            onValuesChange={handleFormValuesChange}
            onSubmit={handleFormSubmit}
          />
        </>
      )}

      {step === 'review' && setupData && (
        <StorySetupReview
          setupData={setupData}
          draftSaved={draftSaved}
          onBack={handleBackToEdit}
          onConfirm={handleConfirm}
          onSaveDraft={handleSaveDraft}
          isSavingDraft={isSavingDraft}
          isConfirming={isConfirming}
          draftSaveError={draftSaveError}
          saveStatus={saveStatus}
        />
      )}

      {step === 'generated' && (
        <CreateStoryGeneratedStep
          generatedStory={generatedStory}
          setupData={setupData}
          storySaved={storySaved}
          saveError={saveError}
          isSavingStory={isSavingStory}
          isMutating={isConfirming}
          isRetrying={isRetryingGeneration}
          showStartOverInHeader={!showGeneratedPreview}
          onSaveStory={handleSaveStory}
          onViewStory={handleViewStory}
          onEditStory={handleEditStory}
          onExportStory={handleExportStory}
          onStartOver={handleStartOver}
          onBackToReview={handleBackToReview}
          onRetryGeneration={handleRetryGeneration}
          onCancelGeneration={handleCancelGeneration}
          onDismissRecovery={handleDismissRecovery}
          saveStatus={saveStatus}
        />
      )}
    </>
  )
}

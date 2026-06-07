import { AppButton, ErrorState, LoadingStoryPage, PageHeader, SaveStatusIndicator } from '@/shared/components'
import { dashboardPageShellClass } from '@/shared/styles/pageShellClasses'
import { insetPanelShellClass } from '@/shared/styles/surfaceClasses'
import {
  StoryCreationProgress,
  StorySetupForm,
  type StoryCreationStep,
} from '@/features/stories'
import { TeacherTemplatePanel } from '@/features/teacher-templates'
import { useGeneratedStory, useIsGenerating } from '@/features/story-generator'
import { GenerationProgressProvider } from '@/features/story-generation/GenerationProgressProvider'
import { CreateStoryGeneratedStep } from './create-story/CreateStoryGeneratedStep'
import { useCreateStoryPageState } from './create-story/useCreateStoryPageState'

export function CreateStoryPage() {
  return (
    <GenerationProgressProvider>
      <CreateStoryPageContent />
    </GenerationProgressProvider>
  )
}

function CreateStoryPageContent() {
  const {
    step,
    setupData,
    formValues,
    liveFormValues,
    formKey,
    draftLoadWarning,
    isDraftLoading,
    sessionRestored,
    dismissSessionRestored,
    saveStatus,
    isSavingStory,
    isConfirming,
    isRetryingGeneration,
    storySaved,
    saveError,
    showGeneratedPreview,
    handleFormSubmit,
    handleSavePlan,
    isSavingPlan,
    handleFormValuesChange,
    handleApplyTemplate,
    handleSaveTemplate,
    handleDeleteTemplate,
    templateSummaries,
    templatesLoading,
    isSavingTemplate,
    templateError,
    selectedTemplateId,
    handleStartOver,
    handleBackToReview,
    handleRetryGeneration,
    handleCancelGeneration,
    handleDismissRecovery,
    handleSaveStory,
    handleViewStory,
    handleEditStory,
  } = useCreateStoryPageState()

  const generatedStory = useGeneratedStory()
  const isGenerating = useIsGenerating()

  const pageDescription =
    step === 'form'
      ? 'Add the basics and generate a first draft — optional details stay collapsed until you need them.'
      : isGenerating
        ? 'Creating your story — please keep this tab open.'
        : generatedStory
          ? storySaved
            ? 'Your story is saved in Your stories. Open it anytime to read or edit.'
            : 'Review your draft, refine pages if needed, then save to Your stories.'
          : 'Generate your story from the create form.'

  const progressStep: StoryCreationStep =
    step === 'form'
      ? 'setup'
      : step === 'generated' && isGenerating
        ? 'review'
        : 'generated'

  if (isDraftLoading) {
    return (
      <>
        <PageHeader
          title="Create story"
          description="Loading your saved story plan from Your stories…"
        />
        <div className={dashboardPageShellClass}>
          <LoadingStoryPage variant="draft" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Create story" description={pageDescription} />

      <div className={`mb-6 ${dashboardPageShellClass} ${insetPanelShellClass} p-3 sm:p-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StoryCreationProgress currentStep={progressStep} />
          <SaveStatusIndicator status={saveStatus} className="self-start sm:self-center" />
        </div>
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
            <div className={`mb-4 ${dashboardPageShellClass}`}>
              <ErrorState
                variant="inline"
                tone="warning"
                title="Story plan not found"
                description={draftLoadWarning}
              />
            </div>
          )}
          <div className={`mb-6 ${dashboardPageShellClass}`}>
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
            onSavePlan={handleSavePlan}
            isGenerating={isGenerating || isConfirming}
            isSavingPlan={isSavingPlan}
          />
        </>
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

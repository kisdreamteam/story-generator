import { PageHeader } from '../../../shared/components'
import { SetupProgressIndicator } from '../components/SetupProgressIndicator'
import { SetupReviewPanel } from '../components/SetupReviewPanel'
import { StorySetupForm } from '../components/StorySetupForm'
import { useStorySetupForm } from '../hooks/useStorySetupForm'

export function StorySetupPage() {
  const form = useStorySetupForm()

  return (
    <>
      <PageHeader
        title={form.showReview ? 'Check your story plan' : 'Plan your story'}
        description={
          form.showReview
            ? `Review your choices for "${form.projectTitle}" before we create the story.`
            : `Tell us about your lesson for "${form.projectTitle}". Nina & Nino defaults are ready — change anything you like.`
        }
      />

      <div className="mb-6 mt-4">
        <SetupProgressIndicator currentStep={form.setupProgressStep} />
      </div>

      {form.showReview ? (
        <SetupReviewPanel
          sections={form.reviewSections}
          isSubmitting={form.isSubmitting}
          submitHelperText={form.submitHelperText}
          onBackToEdit={form.handleBackToEdit}
          onConfirmGenerate={form.handleConfirmGenerate}
        />
      ) : (
        <StorySetupForm
          storyPurpose={form.storyPurpose}
          onStoryPurposeChange={form.setStoryPurpose}
          storyTone={form.storyTone}
          onStoryToneChange={form.setStoryTone}
          mainEvents={form.mainEvents}
          onMainEventsChange={form.setMainEvents}
          wordsToInclude={form.wordsToInclude}
          onWordsToIncludeChange={form.setWordsToInclude}
          wordsToAvoid={form.wordsToAvoid}
          onWordsToAvoidChange={form.setWordsToAvoid}
          theme={form.theme}
          onThemeChange={form.setTheme}
          setting={form.setting}
          onSettingChange={form.setSetting}
          vocabularyFocus={form.vocabularyFocus}
          onVocabularyFocusChange={form.setVocabularyFocus}
          learningGoal={form.learningGoal}
          onLearningGoalChange={form.setLearningGoal}
          pageCount={form.pageCount}
          onPageCountChange={form.setPageCount}
          notes={form.notes}
          onNotesChange={form.setNotes}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          submitButtonLabel={form.submitButtonLabel}
          submitHelperText={form.submitHelperText}
          onSubmit={form.handleSubmit}
          onCancel={form.handleCancel}
        />
      )}
    </>
  )
}

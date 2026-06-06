import { PageHeader } from '../../../shared/components'
import { StorySetupForm } from '../components/StorySetupForm'
import { useStorySetupForm } from '../hooks/useStorySetupForm'

export function StorySetupPage() {
  const form = useStorySetupForm()

  return (
    <>
      <PageHeader
        title="Story Setup"
        description={`Configure "${form.projectTitle}" for the Nina & Nino series. Settings below use teacher-friendly defaults you can adjust.`}
      />

      <StorySetupForm
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
        isSubmitting={form.isSubmitting}
        submitButtonLabel={form.submitButtonLabel}
        submitHelperText={form.submitHelperText}
        onSubmit={form.handleSubmit}
        onCancel={form.handleCancel}
      />
    </>
  )
}

export interface StorySetupFormValues {
  theme: string
  setting: string
  vocabularyFocus: string
  learningGoal: string
  pageCount: string
  mainEvents: string
}

export type StorySetupFormErrors = Partial<Record<keyof StorySetupFormValues, string>>

export interface SetupReviewValues {
  storyPurpose: string
  storyTone: string
  theme: string
  setting: string
  vocabularyFocus: string
  learningGoal: string
  pageCount: string
  mainEvents: string
  wordsToInclude: string
  wordsToAvoid: string
  notes: string
}

export interface SetupReviewField {
  label: string
  value: string
  multiline?: boolean
}

export interface SetupReviewSection {
  title: string
  description?: string
  fields: SetupReviewField[]
  /** When set, renders a highlighted numbered list instead of field grid. */
  events?: string[]
}

export type SetupProgressStep = 'setup' | 'review' | 'generate'

export const setupProgressSteps: { id: SetupProgressStep; label: string }[] = [
  { id: 'setup', label: 'Setup' },
  { id: 'review', label: 'Review' },
  { id: 'generate', label: 'Generate' },
]

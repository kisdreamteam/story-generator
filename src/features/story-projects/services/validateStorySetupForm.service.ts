import type { StorySetupFormErrors, StorySetupFormValues } from '../types/storySetupForm.types'

export function validateStorySetupForm(values: StorySetupFormValues): StorySetupFormErrors {
  const errors: StorySetupFormErrors = {}

  if (!values.theme.trim()) {
    errors.theme = 'Please add a story theme so we know what the story is about.'
  }

  if (!values.setting.trim()) {
    errors.setting = 'Please add a setting so students know where the story happens.'
  }

  if (!values.vocabularyFocus.trim()) {
    errors.vocabularyFocus = 'Please tell us which vocabulary area this story should focus on.'
  }

  if (!values.learningGoal.trim()) {
    errors.learningGoal = 'Please add a learning goal so the story supports your lesson.'
  }

  if (!values.pageCount.trim()) {
    errors.pageCount = 'Please choose how many pages the story should have.'
  }

  const eventCount = values.mainEvents
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean).length

  if (eventCount === 0) {
    errors.mainEvents = 'Please add at least one event — write one per line.'
  }

  return errors
}

export function hasStorySetupFormErrors(errors: StorySetupFormErrors): boolean {
  return Object.keys(errors).length > 0
}

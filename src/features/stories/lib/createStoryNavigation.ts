import type { CreateStoryStep } from '@/features/story-generator/hooks/useCreateStoryDraftLoader'
import type { GeneratedStory, StorySetupInput } from '../types'
import {
  areStorySetupFormValuesEqual,
  type StorySetupFormValues,
} from '../utils/storySetupForm'

export const CREATE_STORY_ROUTE = '/dashboard/create'

export const CREATE_STORY_UNSAVED_SETUP_MESSAGE =
  'Your story plan is not saved yet. Leave without saving?'

export const CREATE_STORY_UNSAVED_GENERATED_MESSAGE =
  'Your story is not saved to Your stories yet. Leave without saving?'

export const CREATE_STORY_GENERATION_IN_PROGRESS_MESSAGE =
  'Your story is still being created. Leave now and you may lose progress.'

export interface CreateStoryNavigationInput {
  step: CreateStoryStep
  setupData: StorySetupInput | null
  generatedStory: GeneratedStory | null
  draftSaved: boolean
  storySaved: boolean
  formValues: StorySetupFormValues
  formBaseline: StorySetupFormValues
  isGenerating?: boolean
}

/** Whether leaving the create flow would discard meaningful unsaved teacher work. */
export function shouldWarnLeaveCreateStoryFlow(input: CreateStoryNavigationInput): boolean {
  if (input.isGenerating) {
    return true
  }

  if (input.storySaved) {
    return false
  }

  if (input.step === 'generated' && !input.generatedStory && !input.storySaved) {
    return true
  }

  if (input.generatedStory && !input.storySaved) {
    return true
  }

  if (input.step === 'review' && input.setupData && !input.draftSaved) {
    return true
  }

  if (input.step === 'form') {
    if (input.setupData && !input.draftSaved) {
      return true
    }

    if (!areStorySetupFormValuesEqual(input.formValues, input.formBaseline)) {
      return true
    }
  }

  return false
}

export function getCreateStoryLeaveMessage(input: {
  generatedStory: GeneratedStory | null
  storySaved: boolean
  isGenerating?: boolean
}): string {
  if (input.isGenerating) {
    return CREATE_STORY_GENERATION_IN_PROGRESS_MESSAGE
  }

  if (input.generatedStory && !input.storySaved) {
    return CREATE_STORY_UNSAVED_GENERATED_MESSAGE
  }

  return CREATE_STORY_UNSAVED_SETUP_MESSAGE
}

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

/** True when navigation exits the create-story page (not internal step changes). */
export function isLeavingCreateStoryRoute(currentPath: string, nextPath: string): boolean {
  return (
    normalizePath(currentPath) === CREATE_STORY_ROUTE &&
    normalizePath(nextPath) !== CREATE_STORY_ROUTE
  )
}

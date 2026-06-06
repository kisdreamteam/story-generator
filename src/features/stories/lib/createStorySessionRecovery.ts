import type { CreateStoryStep } from '@/features/story-generator/hooks/useCreateStoryDraftLoader'
import type { GeneratedStory, StorySetupInput } from '../types'
import type { StorySetupFormValues } from '../utils/storySetupForm'
import {
  shouldWarnLeaveCreateStoryFlow,
  type CreateStoryNavigationInput,
} from './createStoryNavigation'

export const CREATE_STORY_SESSION_STORAGE_KEY = 'nina-nino:create-story-session-v1'

export interface CreateStorySessionSnapshot {
  version: 1
  savedAt: string
  step: CreateStoryStep
  setupData: StorySetupInput | null
  generatedStory: GeneratedStory | null
  formValues: StorySetupFormValues
  formBaseline: StorySetupFormValues
  draftSaved: boolean
  storySaved: boolean
  activeDraftId: string | null
  createdAt: string | null
}

export function shouldPersistCreateStorySession(
  input: CreateStoryNavigationInput & { isGenerating: boolean },
): boolean {
  if (input.storySaved || input.isGenerating) {
    return false
  }

  return shouldWarnLeaveCreateStoryFlow(input)
}

export function readCreateStorySessionSnapshot(): CreateStorySessionSnapshot | null {
  if (typeof sessionStorage === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(CREATE_STORY_SESSION_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as CreateStorySessionSnapshot
    if (parsed?.version !== 1 || !parsed.savedAt || !parsed.step) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function writeCreateStorySessionSnapshot(snapshot: CreateStorySessionSnapshot): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  try {
    sessionStorage.setItem(CREATE_STORY_SESSION_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore quota and access errors — recovery is best-effort.
  }
}

export function clearCreateStorySessionSnapshot(): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  try {
    sessionStorage.removeItem(CREATE_STORY_SESSION_STORAGE_KEY)
  } catch {
    // Ignore storage errors.
  }
}

export function isRecoverableCreateStorySession(snapshot: CreateStorySessionSnapshot): boolean {
  return shouldWarnLeaveCreateStoryFlow({
    step: snapshot.step,
    setupData: snapshot.setupData,
    generatedStory: snapshot.generatedStory,
    draftSaved: snapshot.draftSaved,
    storySaved: snapshot.storySaved,
    formValues: snapshot.formValues,
    formBaseline: snapshot.formBaseline,
  })
}

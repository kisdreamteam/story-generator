import type { CreateStoryStep } from '@/features/story-generator/hooks/useCreateStoryDraftLoader'
import type { GeneratedStory, StorySetupInput } from '../types'
import type { StorySetupFormValues } from '../utils/storySetupForm'
import {
  clearCreateStorySessionSnapshot,
  isRecoverableCreateStorySession,
  readCreateStorySessionSnapshot,
  shouldPersistCreateStorySession,
  writeCreateStorySessionSnapshot,
  type CreateStorySessionSnapshot,
} from '../lib/createStorySessionRecovery'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface CreateStorySessionState {
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

export interface UseCreateStorySessionRecoveryOptions {
  draftId: string | null
  isDraftLoading: boolean
  isGenerating: boolean
  state: CreateStorySessionState
  onRestore: (snapshot: CreateStorySessionSnapshot) => void
}

export interface UseCreateStorySessionRecoveryResult {
  sessionRestored: boolean
  dismissSessionRestored: () => void
  clearSession: () => void
}

/**
 * Persists in-progress create-flow work to sessionStorage and restores it on refresh.
 * Skips when a ?draftId= load is in progress — saved drafts take precedence.
 */
export function useCreateStorySessionRecovery({
  draftId,
  isDraftLoading,
  isGenerating,
  state,
  onRestore,
}: UseCreateStorySessionRecoveryOptions): UseCreateStorySessionRecoveryResult {
  const [sessionRestored, setSessionRestored] = useState(false)
  const restoreAttemptedRef = useRef(false)

  const clearSession = useCallback(() => {
    clearCreateStorySessionSnapshot()
    setSessionRestored(false)
  }, [])

  useEffect(() => {
    if (restoreAttemptedRef.current || draftId || isDraftLoading) {
      return
    }

    restoreAttemptedRef.current = true

    const snapshot = readCreateStorySessionSnapshot()
    if (!snapshot || !isRecoverableCreateStorySession(snapshot)) {
      return
    }

    onRestore(snapshot)
    setSessionRestored(true)
  }, [draftId, isDraftLoading, onRestore])

  useEffect(() => {
    if (isDraftLoading || isGenerating) {
      return
    }

    const navigationInput = {
      step: state.step,
      setupData: state.setupData,
      generatedStory: state.generatedStory,
      draftSaved: state.draftSaved,
      storySaved: state.storySaved,
      formValues: state.formValues,
      formBaseline: state.formBaseline,
      isGenerating,
    }

    if (!shouldPersistCreateStorySession(navigationInput)) {
      clearCreateStorySessionSnapshot()
      return
    }

    writeCreateStorySessionSnapshot({
      version: 1,
      savedAt: new Date().toISOString(),
      step: state.step,
      setupData: state.setupData,
      generatedStory: state.generatedStory,
      formValues: state.formValues,
      formBaseline: state.formBaseline,
      draftSaved: state.draftSaved,
      storySaved: state.storySaved,
      activeDraftId: state.activeDraftId,
      createdAt: state.createdAt,
    })
  }, [
    isDraftLoading,
    isGenerating,
    state.step,
    state.setupData,
    state.generatedStory,
    state.formValues,
    state.formBaseline,
    state.draftSaved,
    state.storySaved,
    state.activeDraftId,
    state.createdAt,
  ])

  const dismissSessionRestored = useCallback(() => {
    setSessionRestored(false)
  }, [])

  return {
    sessionRestored,
    dismissSessionRestored,
    clearSession,
  }
}

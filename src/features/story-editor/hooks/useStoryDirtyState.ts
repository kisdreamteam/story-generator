import { useMemo } from 'react'
import type { StoryEditorState } from '../types/storyEditorState.types'
import { computeStoryHasChanges } from '../utils/computeStoryHasChanges'
import {
  useStoryNavigationBlocker,
  type UseStoryNavigationBlockerResult,
} from './useStoryNavigationBlocker'

export interface UseStoryDirtyStateOptions {
  originalState: StoryEditorState | null
  editorState: StoryEditorState | null
  enabled?: boolean
  /** When true (default), blocks dashboard route changes while dirty. */
  protectNavigation?: boolean
  storyId?: string | null
  message?: string
}

export interface UseStoryDirtyStateResult {
  originalState: StoryEditorState | null
  editorState: StoryEditorState | null
  hasChanges: boolean
  confirmLeave: UseStoryNavigationBlockerResult['confirmLeave']
  isNavigationBlocked: boolean
}

/**
 * Tracks editor dirty state and optionally guards in-app navigation.
 * Does not register browser `beforeunload` handlers.
 */
export function useStoryDirtyState({
  originalState,
  editorState,
  enabled = true,
  protectNavigation = true,
  storyId,
  message,
}: UseStoryDirtyStateOptions): UseStoryDirtyStateResult {
  const hasChanges = useMemo(
    () => computeStoryHasChanges(originalState, editorState, enabled),
    [originalState, editorState, enabled],
  )

  const { confirmLeave, isNavigationBlocked } = useStoryNavigationBlocker({
    shouldBlock: protectNavigation && hasChanges,
    storyId,
    message,
  })

  return {
    originalState,
    editorState,
    hasChanges,
    confirmLeave,
    isNavigationBlocked,
  }
}

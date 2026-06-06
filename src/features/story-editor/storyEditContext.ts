import { createContext, useContext } from 'react'
import type { StoryProject } from '@/features/stories/types'
import type { StoryAutosaveStatus } from './utils/storyAutosaveStatus'
import type { UseStoryEditorResult } from './types/storyEditor.types'
import type { UseStoryNavigationBlockerResult } from './hooks/useStoryNavigationBlocker'

export interface StoryEditContextValue extends UseStoryEditorResult {
  storyId: string
  draft: StoryProject | null
  /** Immutable generated output loaded from storage — never mutated. */
  sourceStory: UseStoryEditorResult['originalStory']
  autosaveStatus: StoryAutosaveStatus
  isSaving: boolean
  hasChanges: boolean
  confirmLeave: UseStoryNavigationBlockerResult['confirmLeave']
  cancelScheduledSave: () => void
  /** Leave edit route — confirms when there are unsaved changes. */
  cancelEditing: () => void
  /** Revert working copy to the last saved baseline. */
  resetChanges: () => void
  /** Persist the current working copy immediately. */
  saveDraft: () => Promise<boolean>
  reloadStory: () => void
}

export const StoryEditContext = createContext<StoryEditContextValue | null>(null)

export function useStoryEditContext(): StoryEditContextValue {
  const value = useContext(StoryEditContext)

  if (!value) {
    throw new Error('useStoryEditContext must be used within StoryEditProvider')
  }

  return value
}

export function useStoryEditContextOptional(): StoryEditContextValue | null {
  return useContext(StoryEditContext)
}

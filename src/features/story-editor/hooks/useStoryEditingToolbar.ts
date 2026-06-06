import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { storyFeedback } from '@/shared/feedback'
import type { StoryHistorySummary } from '@/features/story-history'
import type { StoryAutosaveStatus } from '../utils/storyAutosaveStatus'
import type { StoryEditingToolbarProps } from '../components/StoryEditingToolbar'
import type { StoryEditorViewMode } from './useStoryEditorViewMode'
import type { UseStoryNavigationBlockerResult } from './useStoryNavigationBlocker'

import { STORY_HISTORY_ELEMENT_ID } from '@/features/story-history'

export const STORY_HISTORY_PANEL_ELEMENT_ID = STORY_HISTORY_ELEMENT_ID
/** @deprecated Use STORY_HISTORY_PANEL_ELEMENT_ID */
export const STORY_REVISION_HISTORY_ELEMENT_ID = STORY_HISTORY_PANEL_ELEMENT_ID
/** @deprecated Use STORY_HISTORY_PANEL_ELEMENT_ID */
export const STORY_VERSION_HISTORY_ELEMENT_ID = STORY_HISTORY_PANEL_ELEMENT_ID

export interface UseStoryEditingToolbarOptions {
  storyId: string | undefined
  hasChanges: boolean
  confirmLeave: UseStoryNavigationBlockerResult['confirmLeave']
  isSaving: boolean
  autosaveStatus: StoryAutosaveStatus
  revisionSummaries: StoryHistorySummary[]
  mode: StoryEditorViewMode
  setEditMode: () => void
  enterPreview: () => void
  flushSave: () => Promise<boolean>
  cancelScheduledSave: () => void
  restoreOriginal: () => void
  onSaveSuccess?: () => void
}

export interface UseStoryEditingToolbarResult {
  toolbarProps: StoryEditingToolbarProps
}

export function useStoryEditingToolbar({
  storyId,
  hasChanges,
  confirmLeave,
  isSaving,
  autosaveStatus,
  revisionSummaries,
  mode,
  setEditMode,
  enterPreview,
  flushSave,
  cancelScheduledSave,
  restoreOriginal,
  onSaveSuccess,
}: UseStoryEditingToolbarOptions): UseStoryEditingToolbarResult {
  const navigate = useNavigate()

  const scrollToRevisionHistory = useCallback(() => {
    document.getElementById(STORY_HISTORY_PANEL_ELEMENT_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  const handleModeChange = useCallback(
    (next: StoryEditorViewMode) => {
      if (isSaving) return

      if (next === 'preview') {
        enterPreview()
      } else {
        setEditMode()
      }
    },
    [enterPreview, isSaving, setEditMode],
  )

  const handleSave = useCallback(async () => {
    if (isSaving || !hasChanges) return

    const saved = await flushSave()
    if (saved) {
      storyFeedback.storyUpdated()
      onSaveSuccess?.()
      navigate(
        storyId
          ? `/dashboard/stories/${encodeURIComponent(storyId)}`
          : '/dashboard/stories',
      )
    }
  }, [flushSave, hasChanges, isSaving, navigate, onSaveSuccess, storyId])

  const handleUndo = useCallback(() => {
    if (isSaving || !hasChanges) return

    if (
      !confirmLeave('Undo all changes since your last save? This cannot be reversed.')
    ) {
      return
    }

    restoreOriginal()
  }, [confirmLeave, hasChanges, isSaving, restoreOriginal])

  const handleRestoreVersion = useCallback(() => {
    if (isSaving || revisionSummaries.length === 0) return

    setEditMode()
    requestAnimationFrame(scrollToRevisionHistory)
  }, [isSaving, revisionSummaries.length, scrollToRevisionHistory, setEditMode])

  const handleExit = useCallback(() => {
    if (hasChanges && !confirmLeave()) {
      return
    }

    cancelScheduledSave()
    navigate(
      storyId ? `/dashboard/stories/${encodeURIComponent(storyId)}` : '/dashboard/stories',
    )
  }, [cancelScheduledSave, confirmLeave, hasChanges, navigate, storyId])

  const toolbarProps: StoryEditingToolbarProps = {
    autosaveStatus,
    hasUnsavedChanges: hasChanges,
    mode,
    onModeChange: handleModeChange,
    isSaving,
    canSave: hasChanges && !isSaving,
    canUndo: hasChanges && !isSaving,
    canRestoreVersion: revisionSummaries.length > 0 && !isSaving,
    onSave: () => void handleSave(),
    onUndo: handleUndo,
    onRestoreVersion: handleRestoreVersion,
    onExit: handleExit,
  }

  return {
    toolbarProps,
  }
}

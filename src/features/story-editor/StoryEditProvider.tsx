import { useCallback, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GeneratedStory, StoryProject } from '@/features/stories/types'
import { classifyStoryLoadError, type StoryLoadErrorPresentation } from '@/features/story-generator/lib/story-route-guards'
import type { StorySaveValidationResult } from '@/features/stories/utils/storyValidation'
import { generatedStoryFromProject } from '@/features/story-generator/lib/story-project'
import { StoryEditContext, type StoryEditContextValue } from './storyEditContext'
import { useStoryEditorStoreView, useStoryEditorBootstrap } from './hooks/useStoryEditor'
import { useStoryAutosave } from './hooks/useStoryAutosave'
import { useStoryDirtyState } from './hooks/useStoryDirtyState'

export interface StoryEditProviderProps {
  storyId: string
  draft: StoryProject | null
  generatedStory: GeneratedStory | null
  enabled: boolean
  onReload?: () => void
  onPersisted?: () => void
  onActionError?: (presentation: StoryLoadErrorPresentation) => void
  onValidationFailed?: (result: StorySaveValidationResult) => void
  children: ReactNode
}

/**
 * Edit-mode shell — loads a saved story into an isolated working copy,
 * preserves the immutable source snapshot, and wires autosave + navigation guards.
 */
export function StoryEditProvider({
  storyId,
  draft,
  generatedStory,
  enabled,
  onReload,
  onPersisted,
  onActionError,
  onValidationFailed,
  children,
}: StoryEditProviderProps) {
  const navigate = useNavigate()

  useStoryEditorBootstrap({
    storyId,
    projectTitle: draft?.title ?? '',
    sourceStory: generatedStory,
    lastSavedAt: draft?.updatedAt ?? null,
    enabled: enabled && Boolean(generatedStory),
  })

  const editor = useStoryEditorStoreView()
  const {
    editorState,
    editedStory,
    isDirty,
    revision,
    restoreOriginal,
    markPersisted,
    replaceEditable,
  } = editor

  const { status: autosaveStatus, isSaving, flushSave, cancelScheduledSave } = useStoryAutosave({
    storyId: draft?.id ?? storyId,
    editedStory,
    revision,
    isDirty,
    enabled: enabled && Boolean(draft && generatedStory),
    onPersisted: ({ story, project }) => {
      const persistedStory = generatedStoryFromProject(project) ?? story
      markPersisted(persistedStory, project.updatedAt)
      onPersisted?.()
    },
    onError: (error) => onActionError?.(classifyStoryLoadError(error)),
    onValidationFailed,
  })

  const { hasChanges, confirmLeave } = useStoryDirtyState({
    originalState: editor.session?.originalState ?? editorState,
    editorState,
    storyId,
    enabled: enabled && Boolean(editorState),
  })

  const saveDraft = useCallback(async () => {
    const saved = await flushSave()
    return Boolean(saved)
  }, [flushSave])

  const resetChanges = useCallback(() => {
    if (isSaving) return
    restoreOriginal()
  }, [isSaving, restoreOriginal])

  const cancelEditing = useCallback(() => {
    if (hasChanges && !confirmLeave()) {
      return
    }

    cancelScheduledSave()
    navigate(`/dashboard/stories/${encodeURIComponent(storyId)}`)
  }, [cancelScheduledSave, confirmLeave, hasChanges, navigate, storyId])

  const reloadStory = useCallback(() => {
    onReload?.()
  }, [onReload])

  const value = useMemo((): StoryEditContextValue => {
    return {
      ...editor,
      storyId,
      draft,
      sourceStory: editor.originalStory,
      autosaveStatus,
      isSaving,
      hasChanges,
      confirmLeave,
      cancelScheduledSave,
      cancelEditing,
      resetChanges,
      saveDraft,
      reloadStory,
      replaceEditable,
    }
  }, [
    editor,
    storyId,
    draft,
    autosaveStatus,
    isSaving,
    hasChanges,
    confirmLeave,
    cancelScheduledSave,
    cancelEditing,
    resetChanges,
    saveDraft,
    reloadStory,
    replaceEditable,
  ])

  return <StoryEditContext.Provider value={value}>{children}</StoryEditContext.Provider>
}

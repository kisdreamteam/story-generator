import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  StoryEditorSaveStatus,
  StoryEditorSession,
  UseStoryEditorOptions,
  UseStoryEditorResult,
} from '../types'
import type { GeneratedStorySnapshot } from '../types'
import type { EditablePageCommit } from '../types/editablePage.types'
import {
  applyFlashcardChange,
  applyImagePromptChange,
  applyMetadataChange,
  applyPageTextChange,
  createEditorSession,
  applyPageCommit,
} from '../utils'
import { computeStoryHasChanges } from '../utils/computeStoryHasChanges'
import {
  cloneStoryEditorState,
  convertEditorStateToGeneratedStory,
  createStoryEditorState,
  storyEditorStateEqual,
} from '../utils/storyEditorStateMapping'

function bumpSessionAfterEdit(session: StoryEditorSession): StoryEditorSession {
  return {
    ...session,
    revision: session.revision + 1,
    lastEditedAt: new Date().toISOString(),
    saveStatus: session.saveStatus === 'saving' ? session.saveStatus : 'pending',
  }
}

/**
 * Editing-layer state for generated stories.
 * Operates on {@link StoryEditorState} — never mutates generation output or persisted objects.
 */
export function useStoryEditor(
  sourceStory: GeneratedStorySnapshot | null,
  options?: UseStoryEditorOptions,
): UseStoryEditorResult {
  const enabled = options?.enabled ?? true
  const storyId = options?.storyId ?? ''
  const projectTitle = options?.projectTitle ?? ''

  const [session, setSession] = useState<StoryEditorSession | null>(null)

  useEffect(() => {
    if (!enabled || !sourceStory) {
      setSession(null)
      return
    }

    setSession(
      createEditorSession(
        { storyId, projectTitle },
        sourceStory,
      ),
    )
  }, [enabled, sourceStory, storyId, projectTitle])

  const isDirty = useMemo(
    () =>
      session
        ? computeStoryHasChanges(session.originalState, session.editable, true)
        : false,
    [session],
  )

  const editedStory = useMemo(
    () => (session ? convertEditorStateToGeneratedStory(session.editable) : null),
    [session],
  )

  const originalStory = useMemo(
    () => (session ? convertEditorStateToGeneratedStory(session.originalState) : null),
    [session],
  )

  const updatePageText = useCallback((pageNumber: number, text: string) => {
    setSession((current) => {
      if (!current) return current

      return bumpSessionAfterEdit({
        ...current,
        editable: applyPageTextChange(current.editable, pageNumber, text),
      })
    })
  }, [])

  const updateFlashcard = useCallback((index: number, patch: Parameters<UseStoryEditorResult['updateFlashcard']>[1]) => {
    setSession((current) => {
      if (!current) return current

      return bumpSessionAfterEdit({
        ...current,
        editable: applyFlashcardChange(current.editable, index, patch),
      })
    })
  }, [])

  const updateImagePrompt = useCallback(
    (pageNumber: number, patch: Parameters<UseStoryEditorResult['updateImagePrompt']>[1]) => {
      setSession((current) => {
        if (!current) return current

        return bumpSessionAfterEdit({
          ...current,
          editable: applyImagePromptChange(current.editable, pageNumber, patch),
        })
      })
    },
    [],
  )

  const updateMetadata = useCallback((patch: Parameters<UseStoryEditorResult['updateMetadata']>[0]) => {
    setSession((current) => {
      if (!current) return current

      return bumpSessionAfterEdit({
        ...current,
        editable: applyMetadataChange(current.editable, patch),
      })
    })
  }, [])

  const commitPageUpdate = useCallback((commit: EditablePageCommit) => {
    setSession((current) => {
      if (!current) return current

      return bumpSessionAfterEdit({
        ...current,
        editable: applyPageCommit(current.editable, commit),
      })
    })
  }, [])

  const restoreOriginal = useCallback(() => {
    setSession((current) => {
      if (!current) return current

      return {
        ...current,
        editable: cloneStoryEditorState(current.originalState),
        revision: current.revision + 1,
        lastEditedAt: null,
        saveStatus: 'idle',
      }
    })
  }, [])

  const replaceEditable = useCallback((content: GeneratedStorySnapshot) => {
    setSession((current) => {
      if (!current) return current

      return bumpSessionAfterEdit({
        ...current,
        editable: createStoryEditorState(content),
      })
    })
  }, [])

  const resetSession = useCallback(() => {
    setSession(null)
  }, [])

  const markSaveStatus = useCallback((status: StoryEditorSaveStatus) => {
    setSession((current) => (current ? { ...current, saveStatus: status } : current))
  }, [])

  /** Sync session baseline after a successful persist (autosave or manual). */
  const markPersisted = useCallback((savedStory: GeneratedStorySnapshot) => {
    setSession((current) => {
      if (!current) return current

      const persisted = createStoryEditorState(savedStory)
      const editableStillMatchesPersisted = storyEditorStateEqual(current.editable, persisted)

      return {
        ...current,
        originalState: cloneStoryEditorState(persisted),
        editable: editableStillMatchesPersisted
          ? cloneStoryEditorState(persisted)
          : current.editable,
        saveStatus: editableStillMatchesPersisted ? 'saved' : 'pending',
        lastEditedAt: editableStillMatchesPersisted ? null : current.lastEditedAt,
      }
    })
  }, [])

  return {
    session,
    editorState: session?.editable ?? null,
    originalStory,
    editedStory,
    isDirty,
    revision: session?.revision ?? 0,
    saveStatus: session?.saveStatus ?? 'idle',
    updatePageText,
    updateFlashcard,
    updateImagePrompt,
    updateMetadata,
    commitPageUpdate,
    restoreOriginal,
    replaceEditable,
    resetSession,
    markSaveStatus,
    markPersisted,
  }
}

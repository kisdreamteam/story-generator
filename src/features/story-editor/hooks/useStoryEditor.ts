import { useCallback, useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type {
  StoryEditorSaveStatus,
  StoryEditorSession,
  UseStoryEditorOptions,
  UseStoryEditorResult,
} from '../types'
import type { GeneratedStorySnapshot } from '../types'
import type { EditablePageCommit } from '../types/editablePage.types'
import type { StoryEditorState } from '../types/storyEditorState.types'
import { useStoryEditContextOptional } from '../storyEditContext'
import { storyEditorSelectors } from '../storyEditorSelectors'
import { useStoryEditorStore } from '../storyEditorStore'
import {
  applyAddStoryPage,
  applyMoveStoryPage,
  applyRemoveStoryPage,
} from '../utils/storyPageListMutations'
import {
  applyAddFlashcard,
  applyMoveFlashcard,
  applyRemoveFlashcard,
} from '../utils/flashcardListMutations'
import {
  applyMoveImagePrompt,
  applyRegenerateImagePrompt,
} from '../utils/imagePromptListMutations'
import {
  applyFlashcardChange,
  applyImagePromptChange,
  applyMetadataChange,
  applyPageTeachingFocusChange,
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

export interface UseStoryEditorBootstrapOptions {
  storyId: string
  projectTitle: string
  sourceStory: GeneratedStorySnapshot | null
  enabled?: boolean
  lastSavedAt?: string | null
}

/** Load a saved story into the editor store — call from {@link StoryEditProvider}. */
export function useStoryEditorBootstrap({
  storyId,
  projectTitle,
  sourceStory,
  enabled = true,
  lastSavedAt = null,
}: UseStoryEditorBootstrapOptions): void {
  const initialize = useStoryEditorStore((state) => state.initialize)
  const reset = useStoryEditorStore((state) => state.reset)

  useEffect(() => {
    if (!enabled || !sourceStory || !storyId) {
      reset()
      return
    }

    initialize({
      context: { storyId, projectTitle },
      source: sourceStory,
      lastSavedAt,
    })

    return () => {
      reset()
    }
  }, [enabled, initialize, lastSavedAt, projectTitle, reset, sourceStory, storyId])
}

function bumpSessionAfterEdit(session: StoryEditorSession): StoryEditorSession {
  return {
    ...session,
    revision: session.revision + 1,
    lastEditedAt: new Date().toISOString(),
    saveStatus: session.saveStatus === 'saving' ? session.saveStatus : 'pending',
  }
}

/** Local session state for inline editing outside {@link StoryEditProvider}. */
function useStoryEditorLocal(
  sourceStory: GeneratedStorySnapshot | null,
  options: UseStoryEditorOptions | undefined,
  active: boolean,
): UseStoryEditorResult {
  const enabled = active && (options?.enabled ?? true)
  const storyId = options?.storyId ?? ''
  const projectTitle = options?.projectTitle ?? ''

  const [session, setSession] = useState<StoryEditorSession | null>(null)

  useEffect(() => {
    if (!enabled || !sourceStory) {
      setSession(null)
      return
    }

    setSession(createEditorSession({ storyId, projectTitle }, sourceStory))
  }, [enabled, sourceStory, storyId, projectTitle])

  const isDirty = useMemo(
    () =>
      session ? computeStoryHasChanges(session.originalState, session.editable, true) : false,
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

  const updateFlashcard = useCallback(
    (index: number, patch: Parameters<UseStoryEditorResult['updateFlashcard']>[1]) => {
      setSession((current) => {
        if (!current) return current
        return bumpSessionAfterEdit({
          ...current,
          editable: applyFlashcardChange(current.editable, index, patch),
        })
      })
    },
    [],
  )

  const addFlashcard = useCallback((afterIndex?: number) => {
    setSession((current) => {
      if (!current) return current
      return bumpSessionAfterEdit({
        ...current,
        editable: applyAddFlashcard(current.editable, afterIndex),
      })
    })
  }, [])

  const removeFlashcard = useCallback((index: number) => {
    setSession((current) => {
      if (!current) return current
      return bumpSessionAfterEdit({
        ...current,
        editable: applyRemoveFlashcard(current.editable, index),
      })
    })
  }, [])

  const moveFlashcard = useCallback((index: number, direction: 'up' | 'down') => {
    setSession((current) => {
      if (!current) return current
      return bumpSessionAfterEdit({
        ...current,
        editable: applyMoveFlashcard(current.editable, index, direction),
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

  const moveImagePrompt = useCallback((pageNumber: number, direction: 'up' | 'down') => {
    setSession((current) => {
      if (!current) return current
      return bumpSessionAfterEdit({
        ...current,
        editable: applyMoveImagePrompt(current.editable, pageNumber, direction),
      })
    })
  }, [])

  const regenerateImagePrompt = useCallback((pageNumber: number) => {
    setSession((current) => {
      if (!current) return current
      return bumpSessionAfterEdit({
        ...current,
        editable: applyRegenerateImagePrompt(current.editable, pageNumber),
      })
    })
  }, [])

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

  const addPage = useCallback((afterPageNumber?: number) => {
    setSession((current) => {
      if (!current) return current
      return bumpSessionAfterEdit({
        ...current,
        editable: applyAddStoryPage(current.editable, afterPageNumber),
      })
    })
  }, [])

  const removePage = useCallback((pageNumber: number) => {
    setSession((current) => {
      if (!current) return current
      return bumpSessionAfterEdit({
        ...current,
        editable: applyRemoveStoryPage(current.editable, pageNumber),
      })
    })
  }, [])

  const movePage = useCallback((pageNumber: number, direction: 'up' | 'down') => {
    setSession((current) => {
      if (!current) return current
      return bumpSessionAfterEdit({
        ...current,
        editable: applyMoveStoryPage(current.editable, pageNumber, direction),
      })
    })
  }, [])

  const updateTeachingFocus = useCallback((pageNumber: number, teachingFocus: string) => {
    setSession((current) => {
      if (!current) return current
      return bumpSessionAfterEdit({
        ...current,
        editable: applyPageTeachingFocusChange(current.editable, pageNumber, teachingFocus),
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
    addFlashcard,
    removeFlashcard,
    moveFlashcard,
    updateImagePrompt,
    moveImagePrompt,
    regenerateImagePrompt,
    updateMetadata,
    commitPageUpdate,
    addPage,
    removePage,
    movePage,
    updateTeachingFocus,
    restoreOriginal,
    resetChanges: restoreOriginal,
    resetSession,
    replaceEditable,
    markSaveStatus,
    markPersisted,
  }
}

function useStoryEditorStoreSlice() {
  return useStoryEditorStore(
    useShallow((state) => ({
      context: storyEditorSelectors.context(state),
      baselineState: storyEditorSelectors.baselineState(state),
      editorState: storyEditorSelectors.workingState(state),
      originalStory: storyEditorSelectors.originalStory(state),
      editedStory: storyEditorSelectors.editedStory(state),
      isDirty: storyEditorSelectors.isDirty(state),
      version: storyEditorSelectors.version(state),
      lastSavedAt: storyEditorSelectors.lastSavedAt(state),
      saveStatus: storyEditorSelectors.saveStatus(state),
      updateMetadata: state.updateMetadata,
      updatePageText: state.updatePageText,
      updateTeachingFocus: state.updateTeachingFocus,
      updateFlashcard: state.updateFlashcard,
      addFlashcard: state.addFlashcard,
      removeFlashcard: state.removeFlashcard,
      moveFlashcard: state.moveFlashcard,
      updateImagePrompt: state.updateImagePrompt,
      moveImagePrompt: state.moveImagePrompt,
      regenerateImagePrompt: state.regenerateImagePrompt,
      commitPageUpdate: state.commitPageUpdate,
      addPage: state.addPage,
      removePage: state.removePage,
      movePage: state.movePage,
      restoreBaseline: state.restoreBaseline,
      replaceWorkingCopy: state.replaceWorkingCopy,
      markSaveStatus: state.markSaveStatus,
      markPersisted: state.markPersisted,
      reset: state.reset,
    })),
  )
}

function buildSession(
  context: ReturnType<typeof storyEditorSelectors.context>,
  baselineState: StoryEditorState | null,
  editorState: StoryEditorState | null,
  version: number,
  lastSavedAt: string | null,
  saveStatus: StoryEditorSaveStatus,
): StoryEditorSession | null {
  if (!context || !baselineState || !editorState) {
    return null
  }

  return {
    context,
    originalState: baselineState,
    editable: editorState,
    revision: version,
    lastEditedAt: computeStoryHasChanges(baselineState, editorState, true) ? lastSavedAt : null,
    saveStatus,
  }
}

/** Read the global editor store as {@link UseStoryEditorResult}. */
export function useStoryEditorStoreView(): UseStoryEditorResult {
  const store = useStoryEditorStoreSlice()

  const session = useMemo(
    () =>
      buildSession(
        store.context,
        store.baselineState,
        store.editorState,
        store.version,
        store.lastSavedAt,
        store.saveStatus,
      ),
    [
      store.baselineState,
      store.context,
      store.editorState,
      store.lastSavedAt,
      store.saveStatus,
      store.version,
    ],
  )

  const restoreOriginal = useCallback(() => {
    store.restoreBaseline()
  }, [store.restoreBaseline])

  return {
    session,
    editorState: store.editorState,
    originalStory: store.originalStory,
    editedStory: store.editedStory,
    isDirty: store.isDirty,
    revision: store.version,
    saveStatus: store.saveStatus,
    updatePageText: store.updatePageText,
    updateTeachingFocus: store.updateTeachingFocus,
    updateFlashcard: store.updateFlashcard,
    addFlashcard: store.addFlashcard,
    removeFlashcard: store.removeFlashcard,
    moveFlashcard: store.moveFlashcard,
    updateImagePrompt: store.updateImagePrompt,
    moveImagePrompt: store.moveImagePrompt,
    regenerateImagePrompt: store.regenerateImagePrompt,
    updateMetadata: store.updateMetadata,
    commitPageUpdate: store.commitPageUpdate,
    addPage: store.addPage,
    removePage: store.removePage,
    movePage: store.movePage,
    restoreOriginal,
    resetChanges: restoreOriginal,
    resetSession: store.reset,
    replaceEditable: store.replaceWorkingCopy,
    markSaveStatus: store.markSaveStatus,
    markPersisted: store.markPersisted,
  }
}

/**
 * Editing-layer state for generated stories.
 * - Inside {@link StoryEditProvider} with no args: full edit-mode context.
 * - With `sourceStory`: local session for inline editing (e.g. story detail).
 * - Otherwise: global store view.
 */
export function useStoryEditor(
  sourceStory?: GeneratedStorySnapshot | null,
  options?: UseStoryEditorOptions,
): UseStoryEditorResult {
  const editContext = useStoryEditContextOptional()
  const useLegacy = sourceStory !== undefined || options !== undefined
  const localResult = useStoryEditorLocal(sourceStory ?? null, options, useLegacy)
  const storeResult = useStoryEditorStoreView()

  if (editContext && !useLegacy) {
    return editContext
  }

  if (useLegacy) {
    return localResult
  }

  return storeResult
}

import type { StoreApi } from 'zustand'
import type {
  StoryEditorInitializeInput,
  StoryEditorStore,
  StoryEditorStoreState,
} from './storyEditorTypes'
import { INITIAL_STORY_EDITOR_STORE_STATE } from './storyEditorTypes'
import type { GeneratedStorySnapshot, StoryEditorSaveStatus } from './types/storyEditor.types'
import type { EditablePageCommit } from './types/editablePage.types'
import type { StoryEditorMetadata } from './types/storyEditorState.types'
import type { StoryFlashcard, StoryImagePrompt } from '@/features/stories/types'
import {
  applyAddStoryPage,
  applyMoveStoryPage,
  applyRemoveStoryPage,
} from './utils/storyPageListMutations'
import {
  applyAddFlashcard,
  applyMoveFlashcard,
  applyRemoveFlashcard,
} from './utils/flashcardListMutations'
import {
  applyMoveImagePrompt,
  applyRegenerateImagePrompt,
} from './utils/imagePromptListMutations'
import {
  applyFlashcardChange,
  applyImagePromptChange,
  applyMetadataChange,
  applyPageTeachingFocusChange,
  applyPageTextChange,
} from './utils/applyStoryEditorMutations'
import { applyPageCommit } from './utils/applyPageCommit'
import { cloneEditableStory } from './utils/cloneEditableStory'
import {
  cloneStoryEditorState,
  createStoryEditorState,
  storyEditorStateEqual,
} from './utils/storyEditorStateMapping'

type StoryEditorStoreApi = StoreApi<StoryEditorStore>

function freezeSourceSnapshot(source: GeneratedStorySnapshot) {
  return { snapshot: cloneEditableStory(source) } as const
}

function bumpAfterEdit(state: StoryEditorStoreState): Pick<StoryEditorStoreState, 'version' | 'saveStatus'> {
  return {
    version: state.version + 1,
    saveStatus: state.saveStatus === 'saving' ? state.saveStatus : 'pending',
  }
}

function requireWorkingCopy(state: StoryEditorStoreState) {
  return state.workingCopy?.state ?? null
}

export function createStoryEditorActions(
  set: StoryEditorStoreApi['setState'],
  _get: StoryEditorStoreApi['getState'],
): Pick<
  StoryEditorStore,
  | 'initialize'
  | 'reset'
  | 'setEnabled'
  | 'updateMetadata'
  | 'updatePageText'
  | 'updateTeachingFocus'
  | 'updateFlashcard'
  | 'addFlashcard'
  | 'removeFlashcard'
  | 'moveFlashcard'
  | 'updateImagePrompt'
  | 'moveImagePrompt'
  | 'regenerateImagePrompt'
  | 'commitPageUpdate'
  | 'addPage'
  | 'removePage'
  | 'movePage'
  | 'restoreBaseline'
  | 'replaceWorkingCopy'
  | 'markSaveStatus'
  | 'markPersisted'
> {
  return {
    initialize(input: StoryEditorInitializeInput) {
      const baselineState = createStoryEditorState(input.source)

      set({
        context: input.context,
        source: freezeSourceSnapshot(input.source),
        baseline: { state: cloneStoryEditorState(baselineState) },
        workingCopy: { state: cloneStoryEditorState(baselineState) },
        version: 0,
        lastSavedAt: input.lastSavedAt ?? null,
        saveStatus: 'idle',
        enabled: true,
      })
    },

    reset() {
      set(INITIAL_STORY_EDITOR_STORE_STATE)
    },

    setEnabled(enabled: boolean) {
      set({ enabled })
    },

    updateMetadata(patch: Partial<StoryEditorMetadata>) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyMetadataChange(current, patch),
          },
        }
      })
    },

    updatePageText(pageNumber: number, text: string) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyPageTextChange(current, pageNumber, text),
          },
        }
      })
    },

    updateTeachingFocus(pageNumber: number, teachingFocus: string) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyPageTeachingFocusChange(current, pageNumber, teachingFocus),
          },
        }
      })
    },

    updateFlashcard(index: number, patch: Partial<StoryFlashcard>) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyFlashcardChange(current, index, patch),
          },
        }
      })
    },

    addFlashcard(afterIndex?: number) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyAddFlashcard(current, afterIndex),
          },
        }
      })
    },

    removeFlashcard(index: number) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyRemoveFlashcard(current, index),
          },
        }
      })
    },

    moveFlashcard(index: number, direction: 'up' | 'down') {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyMoveFlashcard(current, index, direction),
          },
        }
      })
    },

    updateImagePrompt(pageNumber: number, patch: Partial<StoryImagePrompt>) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyImagePromptChange(current, pageNumber, patch),
          },
        }
      })
    },

    moveImagePrompt(pageNumber: number, direction: 'up' | 'down') {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyMoveImagePrompt(current, pageNumber, direction),
          },
        }
      })
    },

    regenerateImagePrompt(pageNumber: number) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyRegenerateImagePrompt(current, pageNumber),
          },
        }
      })
    },

    commitPageUpdate(commit: EditablePageCommit) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyPageCommit(current, commit),
          },
        }
      })
    },

    addPage(afterPageNumber?: number) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyAddStoryPage(current, afterPageNumber),
          },
        }
      })
    },

    removePage(pageNumber: number) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyRemoveStoryPage(current, pageNumber),
          },
        }
      })
    },

    movePage(pageNumber: number, direction: 'up' | 'down') {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: applyMoveStoryPage(current, pageNumber, direction),
          },
        }
      })
    },

    restoreBaseline() {
      set((state) => {
        const baseline = state.baseline?.state
        if (!baseline) return state

        return {
          ...state,
          workingCopy: { state: cloneStoryEditorState(baseline) },
          version: state.version + 1,
          saveStatus: 'idle',
        }
      })
    },

    replaceWorkingCopy(source: GeneratedStorySnapshot) {
      set((state) => {
        if (!state.workingCopy) return state

        return {
          ...state,
          ...bumpAfterEdit(state),
          workingCopy: {
            state: createStoryEditorState(source),
          },
        }
      })
    },

    markSaveStatus(status: StoryEditorSaveStatus) {
      set({ saveStatus: status })
    },

    markPersisted(savedStory: GeneratedStorySnapshot, savedAt?: string) {
      set((state) => {
        const current = requireWorkingCopy(state)
        if (!current) return state

        const persisted = createStoryEditorState(savedStory)
        const workingCopyMatchesPersisted = storyEditorStateEqual(current, persisted)
        const timestamp = savedAt ?? new Date().toISOString()

        return {
          ...state,
          baseline: { state: cloneStoryEditorState(persisted) },
          workingCopy: workingCopyMatchesPersisted
            ? { state: cloneStoryEditorState(persisted) }
            : state.workingCopy,
          lastSavedAt: timestamp,
          saveStatus: workingCopyMatchesPersisted ? 'saved' : 'pending',
        }
      })
    },
  }
}

export function getStoryEditorStoreActions(getState: StoryEditorStoreApi['getState']) {
  return getState()
}

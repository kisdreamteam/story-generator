import type {
  StoryFlashcard,
  StoryImagePrompt,
} from '@/features/stories/types'
import type { EditablePageCommit } from './types/editablePage.types'
import type {
  GeneratedStorySnapshot,
  StoryEditorContext,
  StoryEditorSaveStatus,
} from './types/storyEditor.types'
import type { StoryEditorMetadata, StoryEditorState } from './types/storyEditorState.types'

/** Immutable generated output captured when a session opens — never mutated in-place. */
export interface StoryEditorSourceSnapshot {
  readonly snapshot: GeneratedStorySnapshot
}

/** Persisted baseline used for dirty checks and restore. */
export interface StoryEditorBaseline {
  state: StoryEditorState
}

/** Teacher-facing working copy — all edits apply here only. */
export interface StoryEditorWorkingCopy {
  state: StoryEditorState
}

/**
 * Serializable store slice — generation output stays in {@link StoryEditorSourceSnapshot}.
 * {@link StoryEditorWorkingCopy} is the only mutable editing surface.
 */
export interface StoryEditorStoreState {
  context: StoryEditorContext | null
  /** Frozen generation output — set once per session. */
  source: StoryEditorSourceSnapshot | null
  /** Last persisted baseline — updated after successful saves. */
  baseline: StoryEditorBaseline | null
  /** In-session edits — never written to storage directly. */
  workingCopy: StoryEditorWorkingCopy | null
  /** Monotonic edit counter — increments on each local mutation. */
  version: number
  /** ISO timestamp of the last successful persist, if any. */
  lastSavedAt: string | null
  saveStatus: StoryEditorSaveStatus
  enabled: boolean
}

export interface StoryEditorInitializeInput {
  context: StoryEditorContext
  source: GeneratedStorySnapshot
  lastSavedAt?: string | null
}

export interface StoryEditorStoreActions {
  /** Open or replace the editing session from immutable generated output. */
  initialize: (input: StoryEditorInitializeInput) => void
  /** Clear session state — e.g. when leaving the editor route. */
  reset: () => void
  setEnabled: (enabled: boolean) => void
  updateMetadata: (patch: Partial<StoryEditorMetadata>) => void
  updatePageText: (pageNumber: number, text: string) => void
  updateTeachingFocus: (pageNumber: number, teachingFocus: string) => void
  updateFlashcard: (index: number, patch: Partial<StoryFlashcard>) => void
  addFlashcard: (afterIndex?: number) => void
  removeFlashcard: (index: number) => void
  moveFlashcard: (index: number, direction: 'up' | 'down') => void
  updateImagePrompt: (pageNumber: number, patch: Partial<StoryImagePrompt>) => void
  moveImagePrompt: (pageNumber: number, direction: 'up' | 'down') => void
  regenerateImagePrompt: (pageNumber: number) => void
  commitPageUpdate: (commit: EditablePageCommit) => void
  addPage: (afterPageNumber?: number) => void
  removePage: (pageNumber: number) => void
  movePage: (pageNumber: number, direction: 'up' | 'down') => void
  /** Revert working copy to the current baseline. */
  restoreBaseline: () => void
  /** Replace working copy (e.g. after restoring a history entry). */
  replaceWorkingCopy: (source: GeneratedStorySnapshot) => void
  markSaveStatus: (status: StoryEditorSaveStatus) => void
  /** Align baseline with persisted content after a successful save. */
  markPersisted: (savedStory: GeneratedStorySnapshot, savedAt?: string) => void
}

export type StoryEditorStore = StoryEditorStoreState & StoryEditorStoreActions

/** Derived read model for consumers — computed via selectors. */
export interface StoryEditorDerivedState {
  isDirty: boolean
  version: number
  lastSavedAt: string | null
  editorState: StoryEditorState | null
  originalStory: GeneratedStorySnapshot | null
  editedStory: GeneratedStorySnapshot | null
}

export const INITIAL_STORY_EDITOR_STORE_STATE: StoryEditorStoreState = {
  context: null,
  source: null,
  baseline: null,
  workingCopy: null,
  version: 0,
  lastSavedAt: null,
  saveStatus: 'idle',
  enabled: true,
}

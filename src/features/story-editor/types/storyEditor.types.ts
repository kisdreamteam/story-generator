import type {
  GeneratedStory,
  StoryFlashcard,
  StoryImagePrompt,
} from '@/features/stories/types'
import type { EditablePageCommit } from './editablePage.types'
import type { StoryEditorMetadata, StoryEditorState } from './storyEditorState.types'

/**
 * Immutable generated output as produced by the generation layer or loaded from storage.
 * The editor never mutates this reference — only clones it for working copies.
 */
export type GeneratedStorySnapshot = GeneratedStory

/**
 * Teacher-facing working copy. All in-session edits apply here only.
 * Structurally matches generated output but lives in the editing layer.
 */
export type EditableStoryContent = GeneratedStory

/** Story identity metadata — separate from generated content payloads. */
export interface StoryEditorContext {
  storyId: string
  projectTitle: string
}

/** Autosave lifecycle — wired in a future phase; state slots exist now. */
export type StoryEditorSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

/**
 * Full editing session: recoverable baseline + mutable working copy in {@link StoryEditorState}.
 * Generation and storage layers only receive {@link GeneratedStory} via conversion at boundaries.
 */
export interface StoryEditorSession {
  context: StoryEditorContext
  /** Baseline loaded at session start — recoverable via restoreOriginal(). */
  originalState: StoryEditorState
  /** Working copy for edit components — never the preview/read layer. */
  editable: StoryEditorState
  /** Increments on each mutation — for future autosave debounce / dedup. */
  revision: number
  /** ISO timestamp of the most recent local edit — for future autosave scheduling. */
  lastEditedAt: string | null
  saveStatus: StoryEditorSaveStatus
}

export interface StoryEditorPatchHandlers {
  updatePageText: (pageNumber: number, text: string) => void
  updateFlashcard: (index: number, patch: Partial<StoryFlashcard>) => void
  updateImagePrompt: (pageNumber: number, patch: Partial<StoryImagePrompt>) => void
  updateMetadata: (patch: Partial<StoryEditorMetadata>) => void
  /** Apply a validated page-card commit to the session working copy. */
  commitPageUpdate: (commit: EditablePageCommit) => void
}

export interface UseStoryEditorOptions {
  /** When false, session stays empty until editing is enabled. */
  enabled?: boolean
  storyId?: string
  projectTitle?: string
}

export interface UseStoryEditorResult extends StoryEditorPatchHandlers {
  session: StoryEditorSession | null
  /** Structured in-memory editor model (working copy). */
  editorState: StoryEditorState | null
  /** Immutable baseline as GeneratedStory (converted from originalState). */
  originalStory: GeneratedStorySnapshot | null
  /** Working copy as GeneratedStory for preview components and storage APIs. */
  editedStory: EditableStoryContent | null
  isDirty: boolean
  revision: number
  saveStatus: StoryEditorSaveStatus
  restoreOriginal: () => void
  resetSession: () => void
  /** Replace working copy (e.g. after restoring a version). */
  replaceEditable: (content: GeneratedStorySnapshot) => void
  /** Marks save lifecycle — for autosave and manual save integration. */
  markSaveStatus: (status: StoryEditorSaveStatus) => void
  /** Align editor baseline with content persisted to storage. */
  markPersisted: (savedStory: GeneratedStorySnapshot) => void
}

/** Default debounce for a future autosave hook. */
export const STORY_EDITOR_AUTOSAVE_DEBOUNCE_MS = 1500

/**
 * Story editor feature — editing layer separate from generation and read-only preview.
 *
 * Generation produces `GeneratedStory` output.
 * The editor converts it into `StoryEditorState` for in-memory edits.
 * Persist and preview use `convertEditorStateToGeneratedStory()` at boundaries.
 */

export { saveStoryEditorChanges, saveStoryEditorChangesAsCopy } from './api/saveStoryEditorChanges'
export type {
  SaveStoryEditorAsCopyResult,
  SaveStoryEditorChangesResult,
  SaveStoryEditorOptions,
} from './api/saveStoryEditorChanges'
export { StoryEditor } from './StoryEditor'
export type { StoryEditorChangePayload, StoryEditorProps } from './StoryEditor'
export { StoryEditorPage } from './StoryEditorPage'
export { StoryEditProvider } from './StoryEditProvider'
export type { StoryEditProviderProps } from './StoryEditProvider'
export { StoryEditContext, useStoryEditContext, useStoryEditContextOptional } from './storyEditContext'
export type { StoryEditContextValue } from './storyEditContext'
export { useStoryEditor, useEditablePageCardState, useStoryAutosave, useStoryVersionHistory, useStoryRevisions, useStoryEditingToolbar, useStoryEditorViewMode, useStoryPageNavigation, useStoryDirtyState, useStoryNavigationBlocker, useStoryEditorBootstrap } from './hooks'
export type {
  UseStoryAutosaveOptions,
  UseStoryAutosaveResult,
  UseStoryVersionHistoryOptions,
  UseStoryVersionHistoryResult,
  UseStoryRevisionsOptions,
  UseStoryRevisionsResult,
  UseStoryEditingToolbarOptions,
  UseStoryEditingToolbarResult,
  StoryEditorViewMode,
  UseStoryEditorViewModeOptions,
  UseStoryEditorViewModeResult,
  UseStoryPageNavigationResult,
  UseStoryDirtyStateOptions,
  UseStoryDirtyStateResult,
  UseStoryNavigationBlockerOptions,
  UseStoryNavigationBlockerResult,
} from './hooks'
export {
  EditableStoryPageCard,
  EditableStoryPagesEditor,
  FlashcardEditor,
  ImagePromptEditor,
  StoryAutosaveStatus,
  StoryEditingToolbar,
  StoryEditorToolbar,
  StoryEditorModeToggle,
  StoryEditorViewSwitcher,
  StoryMetadataEditor,
  StoryPageByPageEditor,
  StoryPageEditor,
  StoryPageNavigation,
  StoryUnsavedIndicator,
  StoryRevisionList,
  StoryVersionList,
} from './components'
export type {
  StoryEditingToolbarProps,
  StoryEditorToolbarProps,
  StoryEditorModeToggleProps,
  StoryEditorViewSwitcherProps,
  FlashcardEditorProps,
  ImagePromptEditorProps,
  StoryMetadataEditorProps,
  StoryPageByPageEditorProps,
  StoryPageEditorProps,
  StoryPageNavigationProps,
  StoryUnsavedIndicatorProps,
  StoryRevisionListProps,
} from './components'
export {
  appendRevisionSnapshotBeforeSave,
  deleteStoryRevisions,
  loadStoryRevisionHistory,
  saveStoryRevisionHistory,
} from './api/storyRevisionApi'
export { getStoryRevisionStore, localStoryRevisionStore } from './storage/getStoryRevisionStore'
export type {
  EditableStoryContent,
  GeneratedStorySnapshot,
  StoryEditorContext,
  StoryEditorMetadata,
  StoryEditorPatchHandlers,
  StoryEditorSaveStatus,
  StoryEditorSession,
  StoryEditorState,
  UseStoryEditorOptions,
  UseStoryEditorResult,
  EditablePageCardViewModel,
  EditablePageCommit,
  EditablePageDraft,
  EditablePageValidation,
  StoryVersionContent,
  StoryVersionEntry,
  StoryVersionHistory,
  StoryVersionReason,
  StoryVersionStore,
  StoryVersionSummary,
  AppendStoryVersionResult,
  CreateStoryVersionOptions,
  RestoreStoryVersionResult,
  StoryRevision,
  StoryRevisionHistory,
  StoryRevisionStore,
  StoryRevisionSummary,
  AppendStoryRevisionOptions,
  AppendStoryRevisionResult,
  RestoreStoryRevisionResult,
} from './types'
export {
  useStoryEditorStore,
  getStoryEditorStoreState,
  resetStoryEditorStore,
} from './storyEditorStore'
export { createStoryEditorActions, getStoryEditorStoreActions } from './storyEditorActions'
export { storyEditorSelectors } from './storyEditorSelectors'
export type {
  StoryEditorBaseline,
  StoryEditorDerivedState,
  StoryEditorInitializeInput,
  StoryEditorSourceSnapshot,
  StoryEditorStore,
  StoryEditorStoreActions,
  StoryEditorStoreState,
  StoryEditorWorkingCopy,
} from './storyEditorTypes'
export { INITIAL_STORY_EDITOR_STORE_STATE } from './storyEditorTypes'
export {
  STORY_EDITOR_AUTOSAVE_DEBOUNCE_MS,
  DEFAULT_STORY_VERSION_LIMIT,
  DEFAULT_STORY_REVISION_LIMIT,
} from './types'
export {
  applyFlashcardChange,
  applyImagePromptChange,
  applyPageTextChange,
  applyPageCommit,
  appendStoryVersion,
  buildStoryVersionLabel,
  computeStoryHasChanges,
  cloneEditableStory,
  cloneStoryEditorState,
  convertEditorStateToGeneratedStory,
  createEditorSession,
  createStoryEditorSession,
  createStoryEditorState,
  createEditablePageDraft,
  createStoryContentHash,
  createStoryVersionHistory,
  createVersionId,
  editablePageDraftEqual,
  findStoryVersion,
  formatStoryVersionTimestamp,
  getLatestStoryVersion,
  normalizeEditableStory,
  normalizeStoryEditorState,
  restoreStoryVersion,
  seedStoryVersionHistory,
  snapshotBeforeMajorEdit,
  storyContentEqual,
  storyEditorStateEqual,
  toVersionSummaries,
  toVersionSummary,
  validateEditablePageDraft,
  wouldRestoreChangeContent,
  appendStoryRevision,
  buildStoryRevisionLabel,
  createRevisionId,
  createStoryRevisionHistory,
  findStoryRevision,
  normalizeStoryRevisionHistory,
  restoreStoryRevision,
  snapshotRevisionBeforeSave,
  toStoryRevisionSummaries,
  toStoryRevisionSummary,
  wouldRestoreRevisionChangeContent,
  getStoryAutosavePresentation,
  STORY_AUTOSAVE_LABELS,
} from './utils'
export type { StoryAutosaveStatusPresentation } from './utils'

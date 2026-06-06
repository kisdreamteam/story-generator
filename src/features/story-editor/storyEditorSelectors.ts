import type { GeneratedStorySnapshot } from './types/storyEditor.types'
import type { StoryEditorMetadata, StoryEditorState } from './types/storyEditorState.types'
import type {
  StoryEditorDerivedState,
  StoryEditorStoreState,
} from './storyEditorTypes'
import { computeStoryHasChanges } from './utils/computeStoryHasChanges'
import { convertEditorStateToGeneratedStory } from './utils/storyEditorStateMapping'

export function selectStoryEditorContext(state: StoryEditorStoreState) {
  return state.context
}

export function selectStoryEditorSource(state: StoryEditorStoreState): GeneratedStorySnapshot | null {
  return state.source?.snapshot ?? null
}

export function selectStoryEditorBaselineState(state: StoryEditorStoreState): StoryEditorState | null {
  return state.baseline?.state ?? null
}

export function selectStoryEditorWorkingState(state: StoryEditorStoreState): StoryEditorState | null {
  return state.workingCopy?.state ?? null
}

export function selectStoryEditorMetadata(state: StoryEditorStoreState): StoryEditorMetadata | null {
  return state.workingCopy?.state.metadata ?? null
}

export function selectStoryEditorPages(state: StoryEditorStoreState) {
  return state.workingCopy?.state.pages ?? []
}

export function selectStoryEditorFlashcards(state: StoryEditorStoreState) {
  return state.workingCopy?.state.flashcards ?? []
}

export function selectStoryEditorImagePrompts(state: StoryEditorStoreState) {
  return state.workingCopy?.state.imagePrompts ?? []
}

export function selectStoryEditorVersion(state: StoryEditorStoreState): number {
  return state.version
}

export function selectStoryEditorLastSavedAt(state: StoryEditorStoreState): string | null {
  return state.lastSavedAt
}

export function selectStoryEditorSaveStatus(state: StoryEditorStoreState) {
  return state.saveStatus
}

export function selectStoryEditorIsDirty(state: StoryEditorStoreState): boolean {
  if (!state.enabled) return false

  return computeStoryHasChanges(
    state.baseline?.state ?? null,
    state.workingCopy?.state ?? null,
    Boolean(state.baseline && state.workingCopy),
  )
}

export function selectStoryEditorOriginalStory(
  state: StoryEditorStoreState,
): GeneratedStorySnapshot | null {
  const baseline = selectStoryEditorBaselineState(state)
  return baseline ? convertEditorStateToGeneratedStory(baseline) : null
}

export function selectStoryEditorEditedStory(
  state: StoryEditorStoreState,
): GeneratedStorySnapshot | null {
  const working = selectStoryEditorWorkingState(state)
  return working ? convertEditorStateToGeneratedStory(working) : null
}

export function selectStoryEditorDerivedState(
  state: StoryEditorStoreState,
): StoryEditorDerivedState {
  return {
    isDirty: selectStoryEditorIsDirty(state),
    version: selectStoryEditorVersion(state),
    lastSavedAt: selectStoryEditorLastSavedAt(state),
    editorState: selectStoryEditorWorkingState(state),
    originalStory: selectStoryEditorOriginalStory(state),
    editedStory: selectStoryEditorEditedStory(state),
  }
}

/** Namespace export for ergonomic selector imports. */
export const storyEditorSelectors = {
  context: selectStoryEditorContext,
  source: selectStoryEditorSource,
  baselineState: selectStoryEditorBaselineState,
  workingState: selectStoryEditorWorkingState,
  metadata: selectStoryEditorMetadata,
  pages: selectStoryEditorPages,
  flashcards: selectStoryEditorFlashcards,
  imagePrompts: selectStoryEditorImagePrompts,
  version: selectStoryEditorVersion,
  lastSavedAt: selectStoryEditorLastSavedAt,
  saveStatus: selectStoryEditorSaveStatus,
  isDirty: selectStoryEditorIsDirty,
  originalStory: selectStoryEditorOriginalStory,
  editedStory: selectStoryEditorEditedStory,
  derived: selectStoryEditorDerivedState,
}

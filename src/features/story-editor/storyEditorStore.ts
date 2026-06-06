import { create } from 'zustand'
import { createStoryEditorActions } from './storyEditorActions'
import type { StoryEditorStore, StoryEditorStoreState } from './storyEditorTypes'
import { INITIAL_STORY_EDITOR_STORE_STATE } from './storyEditorTypes'

export const useStoryEditorStore = create<StoryEditorStore>((set, get) => ({
  ...INITIAL_STORY_EDITOR_STORE_STATE,
  ...createStoryEditorActions(set, get),
}))

/** Imperative read — useful in services and tests without React. */
export function getStoryEditorStoreState(): StoryEditorStoreState {
  return useStoryEditorStore.getState()
}

/** Reset store to initial session — test hook and route teardown helper. */
export function resetStoryEditorStore(): void {
  useStoryEditorStore.getState().reset()
}

import type { StoryEditorState } from '../types/storyEditorState.types'
import { storyEditorStateEqual } from './storyEditorStateMapping'

export function computeStoryHasChanges(
  originalState: StoryEditorState | null,
  editorState: StoryEditorState | null,
  enabled = true,
): boolean {
  if (!enabled || !originalState || !editorState) {
    return false
  }

  return !storyEditorStateEqual(originalState, editorState)
}

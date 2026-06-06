import type { EditableStoryContent, GeneratedStorySnapshot } from '../types'
import {
  cloneStoryEditorState,
  convertEditorStateToGeneratedStory,
  createStoryEditorState,
} from './storyEditorStateMapping'

/** Deep clone so generation output and editable copies never share references. */
export function cloneEditableStory(story: GeneratedStorySnapshot): EditableStoryContent {
  return convertEditorStateToGeneratedStory(
    cloneStoryEditorState(createStoryEditorState(story)),
  )
}

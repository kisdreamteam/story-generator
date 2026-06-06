import type { GeneratedStorySnapshot, StoryEditorContext, StoryEditorSession } from '../types'
import { cloneStoryEditorState, createStoryEditorState } from './storyEditorStateMapping'

export function createEditorSession(
  context: StoryEditorContext,
  originalGenerated: GeneratedStorySnapshot,
): StoryEditorSession {
  const baseline = createStoryEditorState(originalGenerated)

  return {
    context,
    originalState: cloneStoryEditorState(baseline),
    editable: cloneStoryEditorState(baseline),
    revision: 0,
    lastEditedAt: null,
    saveStatus: 'idle',
  }
}

/** Alias for the Phase 12.1 editor-state factory — same as session baseline creation. */
export function createStoryEditorSession(
  context: StoryEditorContext,
  source: GeneratedStorySnapshot,
): StoryEditorSession {
  return createEditorSession(context, source)
}

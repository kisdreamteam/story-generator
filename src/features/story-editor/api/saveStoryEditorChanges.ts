import { persistValidatedStoryEdits } from '@/features/stories/api/storyStorageApi'
import type { StoryProject } from '@/features/stories/types'
import type { ValidateStoryForSaveOptions } from '@/features/stories/utils/storyValidation'
import type { EditableStoryContent } from '../types'
import { normalizeEditableStory } from '../utils'

export interface SaveStoryEditorChangesResult {
  project: StoryProject
  story: EditableStoryContent
}

/**
 * Single save entry point for the story editor — validates, normalizes, and persists
 * via {@link persistValidatedStoryEdits} → {@link StoryStorageAdapter.updateStory}.
 */
export async function saveStoryEditorChanges(
  storyId: string,
  editedStory: EditableStoryContent,
  options?: ValidateStoryForSaveOptions,
): Promise<SaveStoryEditorChangesResult> {
  if (!storyId.trim()) {
    throw new Error('Cannot save story edits without a story id.')
  }

  const story = normalizeEditableStory(editedStory)
  const project = await persistValidatedStoryEdits(storyId, story, options)

  if (!project) {
    throw new Error('Story could not be saved. Try again.')
  }

  return { project, story }
}

import {
  persistStoryEditsAsCopy,
  persistValidatedStoryEdits,
  type PersistStoryEditsOptions,
} from '@/features/stories/api/storyStorageApi'
import type { StoryProject } from '@/features/stories/types'
import type { ValidateStoryForSaveOptions } from '@/features/stories/utils/storyValidation'
import type { EditableStoryContent } from '../types'
import { normalizeEditableStory } from '../utils'

export interface SaveStoryEditorChangesResult {
  project: StoryProject
  story: EditableStoryContent
}

export type SaveStoryEditorOptions = PersistStoryEditsOptions

/**
 * Single save entry point for the story editor — validates, normalizes, and persists
 * via {@link persistValidatedStoryEdits} → {@link StoryStorageAdapter.updateStory}.
 */
export async function saveStoryEditorChanges(
  storyId: string,
  editedStory: EditableStoryContent,
  options?: SaveStoryEditorOptions,
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

export interface SaveStoryEditorAsCopyResult extends SaveStoryEditorChangesResult {
  sourceStoryId: string
}

/**
 * Save edited content as a new story — preserves the original project and timestamps.
 */
export async function saveStoryEditorChangesAsCopy(
  sourceStoryId: string,
  editedStory: EditableStoryContent,
  options?: ValidateStoryForSaveOptions,
): Promise<SaveStoryEditorAsCopyResult> {
  if (!sourceStoryId.trim()) {
    throw new Error('Cannot save a story copy without a source story id.')
  }

  const story = normalizeEditableStory(editedStory)
  const project = await persistStoryEditsAsCopy(sourceStoryId, story, options)

  return { project, story, sourceStoryId }
}

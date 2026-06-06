import { useCallback, useRef } from 'react'
import { useAutosave } from '@/shared/hooks/useAutosave'
import type { StoryProject } from '@/features/stories/types'
import {
  isStorySaveValidationFailure,
  type StorySaveValidationResult,
} from '@/features/stories/utils/storyValidation'
import { saveStoryEditorChanges } from '../api/saveStoryEditorChanges'
import type { EditableStoryContent } from '../types'
import type { StoryAutosaveStatus } from '../utils/storyAutosaveStatus'
import { STORY_EDITOR_AUTOSAVE_DEBOUNCE_MS } from '../types/storyEditor.types'
import { cloneEditableStory, normalizeEditableStory, storyContentEqual } from '../utils'

export interface StoryEditorPersistedResult {
  story: EditableStoryContent
  project: StoryProject
}

export interface UseStoryAutosaveOptions {
  storyId: string | undefined
  editedStory: EditableStoryContent | null
  revision: number
  isDirty: boolean
  enabled?: boolean
  debounceMs?: number
  onPersisted?: (result: StoryEditorPersistedResult) => void
  onError?: (error: unknown) => void
  onValidationFailed?: (result: StorySaveValidationResult) => void
}

export interface UseStoryAutosaveResult {
  status: StoryAutosaveStatus
  isSaving: boolean
  flushSave: () => Promise<boolean>
  cancelScheduledSave: () => void
}

/** Story editor autosave — delegates to {@link useAutosave} and {@link saveStoryEditorChanges}. */
export function useStoryAutosave({
  storyId,
  editedStory,
  revision,
  isDirty,
  enabled = true,
  debounceMs = STORY_EDITOR_AUTOSAVE_DEBOUNCE_MS,
  onPersisted,
  onError,
  onValidationFailed,
}: UseStoryAutosaveOptions): UseStoryAutosaveResult {
  const normalizedStory = editedStory ? normalizeEditableStory(editedStory) : null
  const lastSavedProjectRef = useRef<StoryProject | null>(null)

  const handleSave = useCallback(
    async (story: EditableStoryContent) => {
      if (!storyId) return

      const result = await saveStoryEditorChanges(storyId, story)
      lastSavedProjectRef.current = result.project
    },
    [storyId],
  )

  const handlePersisted = useCallback(
    (story: EditableStoryContent) => {
      const project = lastSavedProjectRef.current
      if (!project) return

      onPersisted?.({ story, project })
    },
    [onPersisted],
  )

  const handleError = useCallback(
    (error: unknown) => {
      if (isStorySaveValidationFailure(error)) {
        onValidationFailed?.(error.result)
      } else {
        onError?.(error)
      }
    },
    [onError, onValidationFailed],
  )

  return useAutosave({
    value: normalizedStory,
    isDirty,
    revision,
    enabled: enabled && Boolean(storyId),
    debounceMs,
    resetKey: storyId,
    isEqual: storyContentEqual,
    clone: cloneEditableStory,
    onSave: handleSave,
    onPersisted: handlePersisted,
    onError: handleError,
  })
}

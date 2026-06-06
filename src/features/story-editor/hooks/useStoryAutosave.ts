import { useCallback } from 'react'
import { persistValidatedStoryEdits } from '@/features/stories/api/storyStorageApi'
import { useAutosave } from '@/shared/hooks/useAutosave'
import type { EditableStoryContent } from '../types'
import type { StoryAutosaveStatus } from '../utils/storyAutosaveStatus'
import { STORY_EDITOR_AUTOSAVE_DEBOUNCE_MS } from '../types/storyEditor.types'
import { cloneEditableStory, normalizeEditableStory, storyContentEqual } from '../utils'
import {
  isStorySaveValidationFailure,
  type StorySaveValidationResult,
} from '@/features/stories/utils/storyValidation'

export interface UseStoryAutosaveOptions {
  storyId: string | undefined
  editedStory: EditableStoryContent | null
  revision: number
  isDirty: boolean
  enabled?: boolean
  debounceMs?: number
  onPersisted?: (savedStory: EditableStoryContent) => void
  onError?: (error: unknown) => void
  onValidationFailed?: (result: StorySaveValidationResult) => void
  persist?: (storyId: string, story: EditableStoryContent) => Promise<unknown>
}

export interface UseStoryAutosaveResult {
  status: StoryAutosaveStatus
  isSaving: boolean
  flushSave: () => Promise<boolean>
  cancelScheduledSave: () => void
}

  /** Story editor autosave — delegates to {@link useAutosave} with content normalization. */
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
  persist = persistValidatedStoryEdits,
}: UseStoryAutosaveOptions): UseStoryAutosaveResult {
  const normalizedStory = editedStory ? normalizeEditableStory(editedStory) : null

  const handleSave = useCallback(
    async (story: EditableStoryContent) => {
      if (!storyId) return
      await persist(storyId, story)
    },
    [persist, storyId],
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
    onPersisted,
    onError: handleError,
  })
}

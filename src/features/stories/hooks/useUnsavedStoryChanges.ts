import { useStoryNavigationBlocker } from '@/features/story-editor/hooks/useStoryNavigationBlocker'
import { DEFAULT_UNSAVED_STORY_MESSAGE } from '../lib/unsavedStoryChanges'

export interface UseUnsavedStoryChangesOptions {
  isDirty: boolean
  /** Track story route changes (e.g. switching to another story while editing). */
  storyId?: string | null
  message?: string
}

export interface UseUnsavedStoryChangesResult {
  isNavigationBlocked: boolean
  confirmLeave: (customMessage?: string) => boolean
}

/**
 * Warn before in-app route changes when edits are unsaved.
 * Delegates to {@link useStoryNavigationBlocker} — no `beforeunload` listeners.
 */
export function useUnsavedStoryChanges({
  isDirty,
  storyId,
  message = DEFAULT_UNSAVED_STORY_MESSAGE,
}: UseUnsavedStoryChangesOptions): UseUnsavedStoryChangesResult {
  return useStoryNavigationBlocker({
    shouldBlock: isDirty,
    storyId,
    message,
  })
}

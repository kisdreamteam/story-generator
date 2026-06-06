/** Teacher-facing autosave / save status for forms and editors. */
export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

export interface SaveStatusPresentation {
  status: SaveStatus
  label: string
  isVisible: boolean
}

/** @deprecated Use SaveStatusPresentation */
export type StoryAutosaveStatusPresentation = SaveStatusPresentation

export const SAVE_STATUS_LABELS: Record<Exclude<SaveStatus, 'idle'>, string> = {
  pending: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Failed to save',
}

export const DEFAULT_AUTOSAVE_DEBOUNCE_MS = 1500

export function getSaveStatusPresentation(status: SaveStatus): SaveStatusPresentation {
  if (status === 'idle') {
    return { status, label: '', isVisible: false }
  }

  return {
    status,
    label: SAVE_STATUS_LABELS[status],
    isVisible: true,
  }
}

/** @deprecated Use SaveStatus — kept for story editor imports. */
export type StoryAutosaveStatus = SaveStatus

/** @deprecated Use getSaveStatusPresentation */
export const getStoryAutosavePresentation = getSaveStatusPresentation

/** @deprecated Use SAVE_STATUS_LABELS */
export const STORY_AUTOSAVE_LABELS = SAVE_STATUS_LABELS

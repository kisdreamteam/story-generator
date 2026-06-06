export const DEFAULT_UNSAVED_STORY_MESSAGE =
  'You have unsaved story changes. Leave without saving?'

export function confirmDiscardUnsavedChanges(
  message = DEFAULT_UNSAVED_STORY_MESSAGE,
): boolean {
  return window.confirm(message)
}

/** Register a beforeunload guard while active. Returns cleanup. */
export function attachBeforeUnloadWarning(isActive: boolean, message: string): () => void {
  if (!isActive || typeof window === 'undefined') {
    return () => {}
  }

  const handler = (event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = message
  }

  window.addEventListener('beforeunload', handler)
  return () => window.removeEventListener('beforeunload', handler)
}

/** Confirm before archiving a story from the library or detail page. */
export function confirmArchiveStory(title: string): boolean {
  const trimmed = title.trim() || 'this story'
  return window.confirm(
    `Archive "${trimmed}"?\n\nIt will be hidden from your main library list. You can show archived stories anytime from Your stories.`,
  )
}

/** Confirm before restoring an archived story to the main library list. */
export function confirmUnarchiveStory(title: string): boolean {
  const trimmed = title.trim() || 'this story'
  return window.confirm(`Restore "${trimmed}" to your main library list?`)
}

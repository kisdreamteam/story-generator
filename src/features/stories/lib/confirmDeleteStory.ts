/** Browser confirmation before permanently deleting a story. */
export function confirmDeleteStory(title?: string): boolean {
  const trimmedTitle = title?.trim()

  if (trimmedTitle) {
    return window.confirm(`Delete "${trimmedTitle}"? This cannot be undone.`)
  }

  return window.confirm('Delete this story? This cannot be undone.')
}

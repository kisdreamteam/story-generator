/** Browser confirmation before removing a story from a classroom assignment. */
export function confirmRemoveStoryFromClassroom(title?: string): boolean {
  const trimmedTitle = title?.trim()

  if (trimmedTitle) {
    return window.confirm(
      `Remove "${trimmedTitle}" from this classroom? The story will stay in Your stories.`,
    )
  }

  return window.confirm(
    'Remove this story from the classroom? The story will stay in Your stories.',
  )
}

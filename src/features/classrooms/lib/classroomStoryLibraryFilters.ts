import type {
  ClassroomAssignedStory,
  ClassroomStoryLibraryFilterState,
} from '../types/storyClassroomAssignment.types'

export const EMPTY_CLASSROOM_STORY_LIBRARY_FILTERS: ClassroomStoryLibraryFilterState = {
  search: '',
  status: '',
}

export function filterClassroomAssignedStories(
  stories: ClassroomAssignedStory[],
  filters: ClassroomStoryLibraryFilterState,
): ClassroomAssignedStory[] {
  const query = filters.search.trim().toLowerCase()

  return stories.filter((story) => {
    if (filters.status && story.lifecycleStatus !== filters.status) {
      return false
    }

    if (!query) {
      return true
    }

    return (
      story.title.toLowerCase().includes(query) || story.theme.toLowerCase().includes(query)
    )
  })
}

export function hasActiveClassroomStoryLibraryFilters(
  filters: ClassroomStoryLibraryFilterState,
): boolean {
  return Boolean(filters.search.trim() || filters.status)
}

export function classroomStoryLibraryCountLabel(visible: number, total: number): string {
  if (total === 0) return 'No assigned stories'
  if (visible === total) {
    return total === 1 ? '1 assigned story' : `${total} assigned stories`
  }

  return `Showing ${visible} of ${total} stories`
}

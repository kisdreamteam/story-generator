import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import type { StoryLifecycleStatus } from '@/features/stories/types/storyLifecycle.types'
import { unassignStoryFromClassroom } from '../api/storyClassroomAssignmentsApi'
import {
  EMPTY_CLASSROOM_STORY_LIBRARY_FILTERS,
  filterClassroomAssignedStories,
  hasActiveClassroomStoryLibraryFilters,
} from '../lib/classroomStoryLibraryFilters'
import type {
  ClassroomStoryLibraryFilterState,
  ClassroomStoryLibraryStatusFilter,
} from '../types/storyClassroomAssignment.types'
import { useClassroomAssignedStories } from './useClassroomAssignedStories'

const SEARCH_DEBOUNCE_MS = 200

export interface UseClassroomStoryLibraryResult {
  stories: ReturnType<typeof useClassroomAssignedStories>['stories']
  filteredStories: ReturnType<typeof useClassroomAssignedStories>['stories']
  isLoading: boolean
  error: string | null
  filters: ClassroomStoryLibraryFilterState
  hasActiveFilters: boolean
  removingStoryId: string | null
  setSearch: (value: string) => void
  setStatus: (value: ClassroomStoryLibraryStatusFilter) => void
  clearFilters: () => void
  reload: () => Promise<void>
  removeStoryFromClassroom: (storyId: string) => Promise<boolean>
}

/** Classroom story library — assigned stories with search, status filter, and unassign. */
export function useClassroomStoryLibrary(
  classroomId: string | undefined,
): UseClassroomStoryLibraryResult {
  const assigned = useClassroomAssignedStories(classroomId)
  const [filters, setFilters] = useState(EMPTY_CLASSROOM_STORY_LIBRARY_FILTERS)
  const [removingStoryId, setRemovingStoryId] = useState<string | null>(null)

  const debouncedSearch = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS)

  const effectiveFilters = useMemo(
    (): ClassroomStoryLibraryFilterState => ({
      ...filters,
      search: debouncedSearch,
    }),
    [debouncedSearch, filters.status, filters.search],
  )

  const filteredStories = useMemo(
    () => filterClassroomAssignedStories(assigned.stories, effectiveFilters),
    [assigned.stories, effectiveFilters],
  )

  const setSearch = useCallback((value: string) => {
    setFilters((current) => ({ ...current, search: value }))
  }, [])

  const setStatus = useCallback((value: ClassroomStoryLibraryStatusFilter) => {
    setFilters((current) => ({ ...current, status: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_CLASSROOM_STORY_LIBRARY_FILTERS)
  }, [])

  const removeStoryFromClassroom = useCallback(
    async (storyId: string) => {
      if (!classroomId || removingStoryId) {
        return false
      }

      setRemovingStoryId(storyId)

      try {
        await unassignStoryFromClassroom(storyId, classroomId)
        await assigned.reload()
        return true
      } finally {
        setRemovingStoryId(null)
      }
    },
    [assigned, classroomId, removingStoryId],
  )

  return {
    stories: assigned.stories,
    filteredStories,
    isLoading: assigned.isLoading,
    error: assigned.error,
    filters,
    hasActiveFilters: hasActiveClassroomStoryLibraryFilters(effectiveFilters),
    removingStoryId,
    setSearch,
    setStatus,
    clearFilters,
    reload: assigned.reload,
    removeStoryFromClassroom,
  }
}

export type { StoryLifecycleStatus }

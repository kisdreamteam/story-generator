import { useMemo } from 'react'
import type { StoryProject } from '../types'
import { filterStoryProjects, type StoryLibraryFilters } from '../lib/storyLibraryFilters'

export interface UseFilteredStoryProjectsResult {
  filteredStories: StoryProject[]
  totalCount: number
  filteredCount: number
  isFiltered: boolean
}

export function useFilteredStoryProjects(
  stories: StoryProject[],
  filters: StoryLibraryFilters,
): UseFilteredStoryProjectsResult {
  return useMemo(() => {
    const filteredStories = filterStoryProjects(stories, filters)
    const isFiltered = filteredStories.length !== stories.length

    return {
      filteredStories,
      totalCount: stories.length,
      filteredCount: filteredStories.length,
      isFiltered,
    }
  }, [stories, filters])
}

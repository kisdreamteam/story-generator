import { useMemo } from 'react'
import type { StoryProject } from '../types'
import {
  filterStoryProjects,
  sortStoryProjects,
  type StoryLibraryFilters,
  type StoryLibrarySort,
} from '../lib/storyLibraryFilters'

export interface UseFilteredStoryProjectsResult {
  filteredStories: StoryProject[]
  totalCount: number
  filteredCount: number
  isFiltered: boolean
}

export function useFilteredStoryProjects(
  stories: StoryProject[],
  filters: StoryLibraryFilters,
  sort: StoryLibrarySort,
): UseFilteredStoryProjectsResult {
  return useMemo(() => {
    const filteredStories = sortStoryProjects(filterStoryProjects(stories, filters), sort)
    const isFiltered = filteredStories.length !== stories.length

    return {
      filteredStories,
      totalCount: stories.length,
      filteredCount: filteredStories.length,
      isFiltered,
    }
  }, [stories, filters, sort])
}

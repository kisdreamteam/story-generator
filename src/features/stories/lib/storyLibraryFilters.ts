import type { StoryProject } from '../types'
import { formatStoryDate } from '../utils/storyFormat'

export interface StoryLibraryFilters {
  title: string
  vocabulary: string
  topic: string
  ageGroup: string
  createdDate: string
}

export const STORY_FILTER_SEARCH_PARAMS = {
  title: 'title',
  vocabulary: 'vocab',
  topic: 'topic',
  ageGroup: 'age',
  createdDate: 'created',
} as const

export const EMPTY_STORY_LIBRARY_FILTERS: StoryLibraryFilters = {
  title: '',
  vocabulary: '',
  topic: '',
  ageGroup: '',
  createdDate: '',
}

export const STORY_LIBRARY_FILTER_DEBOUNCE_MS = 300

const TEXT_FILTER_KEYS = ['title', 'vocabulary', 'topic'] as const satisfies ReadonlyArray<
  keyof StoryLibraryFilters
>

export type StoryLibraryTextFilterKey = (typeof TEXT_FILTER_KEYS)[number]

export function isStoryLibraryTextFilterKey(
  key: keyof StoryLibraryFilters,
): key is StoryLibraryTextFilterKey {
  return TEXT_FILTER_KEYS.includes(key as StoryLibraryTextFilterKey)
}

export function parseStoryLibraryFilters(
  searchParams: URLSearchParams,
): StoryLibraryFilters {
  return {
    title: searchParams.get(STORY_FILTER_SEARCH_PARAMS.title) ?? '',
    vocabulary: searchParams.get(STORY_FILTER_SEARCH_PARAMS.vocabulary) ?? '',
    topic: searchParams.get(STORY_FILTER_SEARCH_PARAMS.topic) ?? '',
    ageGroup: searchParams.get(STORY_FILTER_SEARCH_PARAMS.ageGroup) ?? '',
    createdDate: searchParams.get(STORY_FILTER_SEARCH_PARAMS.createdDate) ?? '',
  }
}

export function pickStoryLibraryTextFilters(
  filters: StoryLibraryFilters,
): Pick<StoryLibraryFilters, StoryLibraryTextFilterKey> {
  return {
    title: filters.title,
    vocabulary: filters.vocabulary,
    topic: filters.topic,
  }
}

export function writeStoryLibraryFiltersToSearchParams(
  filters: StoryLibraryFilters,
  searchParams: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(searchParams)

  for (const [key, param] of Object.entries(STORY_FILTER_SEARCH_PARAMS) as Array<
    [keyof StoryLibraryFilters, string]
  >) {
    const value = filters[key].trim()
    if (value) {
      next.set(param, value)
    } else {
      next.delete(param)
    }
  }

  return next
}

export function countActiveStoryLibraryFilters(filters: StoryLibraryFilters): number {
  return Object.values(filters).filter((value) => value.trim().length > 0).length
}

export function hasActiveStoryLibraryFilters(filters: StoryLibraryFilters): boolean {
  return countActiveStoryLibraryFilters(filters) > 0
}

function includesQuery(haystack: string, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return haystack.toLowerCase().includes(normalized)
}

function getProjectTitle(project: StoryProject): string {
  return project.generatedStory?.title?.trim() || project.title.trim()
}

function getProjectVocabularyText(project: StoryProject): string {
  const fromProject = project.vocabularyWords.join(' ')
  const fromFlashcards = project.flashcards.map((card) => card.word).join(' ')
  const fromSetup = project.setup?.wordsToInclude ?? ''
  const fromGenerated = project.generatedStory?.flashcards.map((card) => card.word).join(' ') ?? ''

  return [fromProject, fromFlashcards, fromSetup, fromGenerated].join(' ')
}

function matchesCreatedDateFilter(project: StoryProject, query: string): boolean {
  const normalized = query.trim()
  if (!normalized) return true

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return project.createdAt.startsWith(normalized)
  }

  const formatted = formatStoryDate(project.createdAt)
  return (
    includesQuery(formatted, normalized) ||
    includesQuery(project.createdAt, normalized)
  )
}

/** True when a single project matches all active filter fields. */
export function storyProjectMatchesFilters(
  project: StoryProject,
  filters: StoryLibraryFilters,
): boolean {
  if (!includesQuery(getProjectTitle(project), filters.title)) {
    return false
  }

  if (!includesQuery(getProjectVocabularyText(project), filters.vocabulary)) {
    return false
  }

  if (!includesQuery(project.theme, filters.topic)) {
    return false
  }

  if (filters.ageGroup.trim() && project.ageRange !== filters.ageGroup.trim()) {
    return false
  }

  if (!matchesCreatedDateFilter(project, filters.createdDate)) {
    return false
  }

  return true
}

/** Filter and preserve caller sort order. */
export function filterStoryProjects(
  stories: StoryProject[],
  filters: StoryLibraryFilters,
): StoryProject[] {
  if (!hasActiveStoryLibraryFilters(filters)) {
    return stories
  }

  return stories.filter((project) => storyProjectMatchesFilters(project, filters))
}

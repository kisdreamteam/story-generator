import type { StoryProject } from '../types'
import type { StoryLifecycleStatus } from '../types/storyLifecycle.types'
import { resolveStoryLifecycleStatus } from '../utils/storyLifecycleStatus'
import { formatStoryDate } from '../utils/storyFormat'

export type StoryLibrarySort = 'recent' | 'oldest' | 'alphabetical'

export const STORY_LIBRARY_SORT_OPTIONS: readonly StoryLibrarySort[] = [
  'recent',
  'oldest',
  'alphabetical',
]

export const STORY_LIBRARY_SORT_LABELS: Record<StoryLibrarySort, string> = {
  recent: 'Most recent',
  oldest: 'Oldest first',
  alphabetical: 'A–Z',
}

export const DEFAULT_STORY_LIBRARY_SORT: StoryLibrarySort = 'recent'

export interface StoryLibraryFilters {
  /** Broad search across title, topic, vocabulary, and lesson notes. */
  search: string
  /** Narrow filter — story title only. */
  title: string
  status: StoryLifecycleStatus | ''
  createdDate: string
}

export const STORY_FILTER_SEARCH_PARAMS = {
  search: 'q',
  title: 'title',
  createdDate: 'created',
  status: 'status',
  sort: 'sort',
} as const

export const EMPTY_STORY_LIBRARY_FILTERS: StoryLibraryFilters = {
  search: '',
  title: '',
  status: '',
  createdDate: '',
}

export const STORY_LIBRARY_FILTER_DEBOUNCE_MS = 300

const DEBOUNCED_FILTER_KEYS = ['search', 'title'] as const satisfies ReadonlyArray<
  keyof StoryLibraryFilters
>

export type StoryLibraryDebouncedFilterKey = (typeof DEBOUNCED_FILTER_KEYS)[number]

export function isStoryLibraryDebouncedFilterKey(
  key: keyof StoryLibraryFilters,
): key is StoryLibraryDebouncedFilterKey {
  return DEBOUNCED_FILTER_KEYS.includes(key as StoryLibraryDebouncedFilterKey)
}

export function isStoryLibrarySort(value: string): value is StoryLibrarySort {
  return STORY_LIBRARY_SORT_OPTIONS.includes(value as StoryLibrarySort)
}

export function parseStoryLibrarySort(searchParams: URLSearchParams): StoryLibrarySort {
  const raw = searchParams.get(STORY_FILTER_SEARCH_PARAMS.sort) ?? ''
  return isStoryLibrarySort(raw) ? raw : DEFAULT_STORY_LIBRARY_SORT
}

export function parseStoryLibraryFilters(
  searchParams: URLSearchParams,
): StoryLibraryFilters {
  const rawStatus = searchParams.get(STORY_FILTER_SEARCH_PARAMS.status) ?? ''
  const status =
    rawStatus === 'draft' ||
    rawStatus === 'generated' ||
    rawStatus === 'edited' ||
    rawStatus === 'completed'
      ? rawStatus
      : ''

  const search = searchParams.get(STORY_FILTER_SEARCH_PARAMS.search) ?? ''
  const legacyVocabulary = searchParams.get('vocab') ?? ''
  const legacyTopic = searchParams.get('topic') ?? ''

  return {
    search: search || [legacyVocabulary, legacyTopic].filter(Boolean).join(' ').trim(),
    title: searchParams.get(STORY_FILTER_SEARCH_PARAMS.title) ?? '',
    createdDate: searchParams.get(STORY_FILTER_SEARCH_PARAMS.createdDate) ?? '',
    status,
  }
}

export function pickStoryLibraryDebouncedFilters(
  filters: StoryLibraryFilters,
): Pick<StoryLibraryFilters, StoryLibraryDebouncedFilterKey> {
  return {
    search: filters.search,
    title: filters.title,
  }
}

export function writeStoryLibraryFiltersToSearchParams(
  filters: StoryLibraryFilters,
  sort: StoryLibrarySort,
  searchParams: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(searchParams)

  for (const [key, param] of Object.entries(STORY_FILTER_SEARCH_PARAMS) as Array<
    [keyof StoryLibraryFilters | 'sort', string]
  >) {
    if (key === 'sort') continue

    const value = filters[key as keyof StoryLibraryFilters]?.trim?.() ?? filters[key as keyof StoryLibraryFilters]
    const trimmed = typeof value === 'string' ? value.trim() : ''

    if (trimmed) {
      next.set(param, trimmed)
    } else {
      next.delete(param)
    }
  }

  if (sort !== DEFAULT_STORY_LIBRARY_SORT) {
    next.set(STORY_FILTER_SEARCH_PARAMS.sort, sort)
  } else {
    next.delete(STORY_FILTER_SEARCH_PARAMS.sort)
  }

  next.delete('vocab')
  next.delete('topic')
  next.delete('age')

  return next
}

export function countActiveStoryLibraryFilters(filters: StoryLibraryFilters): number {
  return Object.values(filters).filter((value) => value.trim().length > 0).length
}

export function hasActiveStoryLibraryFilters(filters: StoryLibraryFilters): boolean {
  return countActiveStoryLibraryFilters(filters) > 0
}

export function hasActiveStoryLibraryQuery(
  filters: StoryLibraryFilters,
  sort: StoryLibrarySort,
): boolean {
  return hasActiveStoryLibraryFilters(filters) || sort !== DEFAULT_STORY_LIBRARY_SORT
}

function includesQuery(haystack: string, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return haystack.toLowerCase().includes(normalized)
}

function getProjectTitle(project: StoryProject): string {
  return project.generatedStory?.title?.trim() || project.title.trim()
}

function getProjectSearchText(project: StoryProject): string {
  const vocabularyWords = project.vocabularyWords.join(' ')
  const flashcardWords = project.flashcards.map((card) => card.word).join(' ')
  const generatedFlashcardWords =
    project.generatedStory?.flashcards.map((card) => card.word).join(' ') ?? ''
  const setupWords = project.setup?.wordsToInclude ?? ''

  return [
    getProjectTitle(project),
    project.theme,
    project.lessonGoal,
    project.setting,
    project.characters,
    vocabularyWords,
    flashcardWords,
    generatedFlashcardWords,
    setupWords,
  ].join(' ')
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
  if (!includesQuery(getProjectSearchText(project), filters.search)) {
    return false
  }

  if (!includesQuery(getProjectTitle(project), filters.title)) {
    return false
  }

  if (filters.status && resolveStoryLifecycleStatus(project) !== filters.status) {
    return false
  }

  if (!matchesCreatedDateFilter(project, filters.createdDate)) {
    return false
  }

  return true
}

/** Filter stories in memory — preserves order until sorted. */
export function filterStoryProjects(
  stories: StoryProject[],
  filters: StoryLibraryFilters,
): StoryProject[] {
  if (!hasActiveStoryLibraryFilters(filters)) {
    return stories
  }

  return stories.filter((project) => storyProjectMatchesFilters(project, filters))
}

/** Sort stories in memory — local only, no backend. */
export function sortStoryProjects(
  stories: StoryProject[],
  sort: StoryLibrarySort,
): StoryProject[] {
  const copy = [...stories]

  switch (sort) {
    case 'oldest':
      return copy.sort(
        (left, right) =>
          new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime(),
      )
    case 'alphabetical':
      return copy.sort((left, right) =>
        getProjectTitle(left).localeCompare(getProjectTitle(right), undefined, {
          sensitivity: 'base',
        }),
      )
    case 'recent':
    default:
      return copy.sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )
  }
}

export function getStoryLibrarySortDescription(sort: StoryLibrarySort): string {
  switch (sort) {
    case 'oldest':
      return 'oldest first'
    case 'alphabetical':
      return 'A–Z'
    case 'recent':
    default:
      return 'most recent first'
  }
}

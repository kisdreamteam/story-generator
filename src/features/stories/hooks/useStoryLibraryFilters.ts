import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import {
  DEFAULT_STORY_LIBRARY_SORT,
  EMPTY_STORY_LIBRARY_FILTERS,
  hasActiveStoryLibraryFilters,
  hasActiveStoryLibraryQuery,
  isStoryLibraryDebouncedFilterKey,
  parseStoryLibraryFilters,
  parseStoryLibrarySort,
  pickStoryLibraryDebouncedFilters,
  STORY_LIBRARY_FILTER_DEBOUNCE_MS,
  writeStoryLibraryFiltersToSearchParams,
  type StoryLibraryFilters,
  type StoryLibraryDebouncedFilterKey,
  type StoryLibrarySort,
} from '../lib/storyLibraryFilters'

export interface UseStoryLibraryFiltersResult {
  filters: StoryLibraryFilters
  debouncedFilters: StoryLibraryFilters
  sort: StoryLibrarySort
  setFilter: (key: keyof StoryLibraryFilters, value: string) => void
  setSort: (sort: StoryLibrarySort) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  hasActiveQuery: boolean
}

export function useStoryLibraryFilters(): UseStoryLibraryFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlFilters = useMemo(() => parseStoryLibraryFilters(searchParams), [searchParams])
  const urlSort = useMemo(() => parseStoryLibrarySort(searchParams), [searchParams])

  const [textDraft, setTextDraft] = useState(() => pickStoryLibraryDebouncedFilters(urlFilters))

  useEffect(() => {
    setTextDraft(pickStoryLibraryDebouncedFilters(urlFilters))
  }, [urlFilters.search, urlFilters.title])

  const debouncedText = useDebouncedValue(textDraft, STORY_LIBRARY_FILTER_DEBOUNCE_MS)

  useEffect(() => {
    const merged: StoryLibraryFilters = {
      ...urlFilters,
      ...debouncedText,
    }

    const nextParams = writeStoryLibraryFiltersToSearchParams(merged, urlSort, searchParams)
    if (nextParams.toString() === searchParams.toString()) return

    setSearchParams(nextParams, { replace: true })
  }, [debouncedText, searchParams, setSearchParams, urlFilters.createdDate, urlFilters.status, urlSort])

  const debouncedFilters = useMemo(
    (): StoryLibraryFilters => ({
      ...urlFilters,
      ...debouncedText,
    }),
    [urlFilters, debouncedText],
  )

  const setFilter = useCallback(
    (key: keyof StoryLibraryFilters, value: string) => {
      if (isStoryLibraryDebouncedFilterKey(key)) {
        setTextDraft((current) => ({ ...current, [key]: value }))
        return
      }

      const merged: StoryLibraryFilters = {
        ...urlFilters,
        ...textDraft,
        [key]: value,
      }

      setSearchParams(writeStoryLibraryFiltersToSearchParams(merged, urlSort, searchParams), {
        replace: true,
      })
    },
    [searchParams, setSearchParams, textDraft, urlFilters, urlSort],
  )

  const setSort = useCallback(
    (sort: StoryLibrarySort) => {
      const merged: StoryLibraryFilters = {
        ...urlFilters,
        ...textDraft,
      }

      setSearchParams(writeStoryLibraryFiltersToSearchParams(merged, sort, searchParams), {
        replace: true,
      })
    },
    [searchParams, setSearchParams, textDraft, urlFilters],
  )

  const clearFilters = useCallback(() => {
    setTextDraft({ search: '', title: '' })
    setSearchParams(
      writeStoryLibraryFiltersToSearchParams(EMPTY_STORY_LIBRARY_FILTERS, DEFAULT_STORY_LIBRARY_SORT, searchParams),
      { replace: true },
    )
  }, [searchParams, setSearchParams])

  const filters = useMemo(
    (): StoryLibraryFilters => ({
      ...urlFilters,
      ...textDraft,
    }),
    [urlFilters, textDraft],
  )

  return {
    filters,
    debouncedFilters,
    sort: urlSort,
    setFilter,
    setSort,
    clearFilters,
    hasActiveFilters: hasActiveStoryLibraryFilters(debouncedFilters),
    hasActiveQuery: hasActiveStoryLibraryQuery(debouncedFilters, urlSort),
  }
}

export type { StoryLibraryFilters, StoryLibraryDebouncedFilterKey, StoryLibrarySort }

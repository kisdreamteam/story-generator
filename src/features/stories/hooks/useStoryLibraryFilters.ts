import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import {
  EMPTY_STORY_LIBRARY_FILTERS,
  hasActiveStoryLibraryFilters,
  isStoryLibraryTextFilterKey,
  parseStoryLibraryFilters,
  pickStoryLibraryTextFilters,
  STORY_LIBRARY_FILTER_DEBOUNCE_MS,
  writeStoryLibraryFiltersToSearchParams,
  type StoryLibraryFilters,
  type StoryLibraryTextFilterKey,
} from '../lib/storyLibraryFilters'

export interface UseStoryLibraryFiltersResult {
  filters: StoryLibraryFilters
  debouncedFilters: StoryLibraryFilters
  setFilter: (key: keyof StoryLibraryFilters, value: string) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

export function useStoryLibraryFilters(): UseStoryLibraryFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlFilters = useMemo(() => parseStoryLibraryFilters(searchParams), [searchParams])

  const [textDraft, setTextDraft] = useState(() => pickStoryLibraryTextFilters(urlFilters))

  useEffect(() => {
    setTextDraft(pickStoryLibraryTextFilters(urlFilters))
  }, [urlFilters.title, urlFilters.vocabulary, urlFilters.topic])

  const debouncedText = useDebouncedValue(textDraft, STORY_LIBRARY_FILTER_DEBOUNCE_MS)

  useEffect(() => {
    const merged: StoryLibraryFilters = {
      ...urlFilters,
      ...debouncedText,
    }

    const nextParams = writeStoryLibraryFiltersToSearchParams(merged, searchParams)
    if (nextParams.toString() === searchParams.toString()) return

    setSearchParams(nextParams, { replace: true })
  }, [debouncedText, searchParams, setSearchParams, urlFilters.ageGroup, urlFilters.createdDate])

  const debouncedFilters = useMemo(
    (): StoryLibraryFilters => ({
      ...urlFilters,
      ...debouncedText,
    }),
    [urlFilters, debouncedText],
  )

  const setFilter = useCallback(
    (key: keyof StoryLibraryFilters, value: string) => {
      if (isStoryLibraryTextFilterKey(key)) {
        setTextDraft((current) => ({ ...current, [key]: value }))
        return
      }

      const merged: StoryLibraryFilters = {
        ...urlFilters,
        ...textDraft,
        [key]: value,
      }

      setSearchParams(writeStoryLibraryFiltersToSearchParams(merged, searchParams), {
        replace: true,
      })
    },
    [searchParams, setSearchParams, textDraft, urlFilters],
  )

  const clearFilters = useCallback(() => {
    setTextDraft({ title: '', vocabulary: '', topic: '' })
    setSearchParams(writeStoryLibraryFiltersToSearchParams(EMPTY_STORY_LIBRARY_FILTERS, searchParams), {
      replace: true,
    })
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
    setFilter,
    clearFilters,
    hasActiveFilters: hasActiveStoryLibraryFilters(debouncedFilters),
  }
}

export type { StoryLibraryFilters, StoryLibraryTextFilterKey }

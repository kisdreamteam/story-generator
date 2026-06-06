import { useEffect, useMemo, useState } from 'react'
import type { StoryPage } from '@/features/stories/types'

export interface UseStoryPageNavigationResult {
  sortedPages: StoryPage[]
  currentIndex: number
  currentPage: StoryPage | null
  totalPages: number
  canGoPrevious: boolean
  canGoNext: boolean
  goPrevious: () => void
  goNext: () => void
  goToPage: (pageNumber: number) => void
}

export function useStoryPageNavigation(pages: StoryPage[]): UseStoryPageNavigationResult {
  const sortedPages = useMemo(
    () => [...pages].sort((left, right) => left.pageNumber - right.pageNumber),
    [pages],
  )

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, Math.max(0, sortedPages.length - 1)))
  }, [sortedPages.length])

  const currentPage = sortedPages[currentIndex] ?? null
  const totalPages = sortedPages.length

  const goPrevious = () => {
    setCurrentIndex((index) => Math.max(0, index - 1))
  }

  const goNext = () => {
    setCurrentIndex((index) => Math.min(totalPages - 1, index + 1))
  }

  const goToPage = (pageNumber: number) => {
    const index = sortedPages.findIndex((page) => page.pageNumber === pageNumber)
    if (index >= 0) {
      setCurrentIndex(index)
    }
  }

  return {
    sortedPages,
    currentIndex,
    currentPage,
    totalPages,
    canGoPrevious: currentIndex > 0,
    canGoNext: currentIndex < totalPages - 1,
    goPrevious,
    goNext,
    goToPage,
  }
}

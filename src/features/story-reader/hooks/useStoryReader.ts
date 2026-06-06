import type { GeneratedStory } from '@/features/stories/types'
import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { StoryReaderNavigationState, StoryReaderTransitionDirection } from '../types'
import { buildStoryReaderSlideLabels, buildStoryReaderSlides } from './buildStoryReaderSlides'
import { useStoryReaderKeyboard } from './useStoryReaderKeyboard'
import { useStoryReaderNavigationLock } from './useStoryReaderNavigationLock'

export interface UseStoryReaderOptions {
  onComplete?: () => void
}

export interface UseStoryReaderResult extends StoryReaderNavigationState {
  progressPercent: number
  slideLabels: ReturnType<typeof buildStoryReaderSlideLabels>
  slideKey: string
  direction: StoryReaderTransitionDirection
  isTransitioning: boolean
  goNext: () => void
  goPrevious: () => void
  goToIndex: (index: number) => void
  onTransitionComplete: () => void
}

function buildSlideKey(index: number, slideKind: string): string {
  return `${index}-${slideKind}`
}

export function useStoryReader(
  story: GeneratedStory,
  options: UseStoryReaderOptions = {},
): UseStoryReaderResult {
  const reducedMotion = useReducedMotion() ?? false
  const { acquireLock, releaseLock } = useStoryReaderNavigationLock(reducedMotion)

  const slides = useMemo(() => buildStoryReaderSlides(story), [story])
  const slideLabels = useMemo(() => buildStoryReaderSlideLabels(slides), [slides])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<StoryReaderTransitionDirection>(1)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const totalSlides = slides.length
  const currentSlide = slides[currentIndex] ?? slides[0]
  const canGoNext = currentIndex < totalSlides - 1
  const canGoPrevious = currentIndex > 0
  const isFirstSlide = currentIndex === 0
  const isLastSlide = currentIndex === totalSlides - 1
  const progressPercent = totalSlides <= 1 ? 100 : Math.round((currentIndex / (totalSlides - 1)) * 100)
  const slideKey = buildSlideKey(currentIndex, currentSlide.kind)

  const navigateToIndex = useCallback(
    (nextIndex: number) => {
      if (nextIndex === currentIndex || nextIndex < 0 || nextIndex >= totalSlides) {
        return false
      }

      if (!acquireLock()) {
        return false
      }

      setDirection(nextIndex > currentIndex ? 1 : -1)
      setIsTransitioning(!reducedMotion)
      setCurrentIndex(nextIndex)

      if (nextIndex === totalSlides - 1 && currentIndex < totalSlides - 1) {
        options.onComplete?.()
      }

      if (reducedMotion) {
        setIsTransitioning(false)
        releaseLock()
      }

      return true
    },
    [acquireLock, currentIndex, options, reducedMotion, releaseLock, totalSlides],
  )

  const goToIndex = useCallback(
    (index: number) => {
      navigateToIndex(index)
    },
    [navigateToIndex],
  )

  const goNext = useCallback(() => {
    if (!canGoNext) {
      return
    }

    navigateToIndex(currentIndex + 1)
  }, [canGoNext, currentIndex, navigateToIndex])

  const goPrevious = useCallback(() => {
    if (!canGoPrevious) {
      return
    }

    navigateToIndex(currentIndex - 1)
  }, [canGoPrevious, currentIndex, navigateToIndex])

  const onTransitionComplete = useCallback(() => {
    setIsTransitioning(false)
    releaseLock()
  }, [releaseLock])

  useEffect(() => {
    setCurrentIndex(0)
    setDirection(1)
    setIsTransitioning(false)
    releaseLock()
  }, [releaseLock, story])

  useStoryReaderKeyboard({
    enabled: true,
    canGoNext: canGoNext && !isTransitioning,
    canGoPrevious: canGoPrevious && !isTransitioning,
    onNext: goNext,
    onPrevious: goPrevious,
  })

  return {
    slides,
    slideLabels,
    currentIndex,
    currentSlide,
    totalSlides,
    canGoNext,
    canGoPrevious,
    isFirstSlide,
    isLastSlide,
    progressPercent,
    slideKey,
    direction,
    isTransitioning,
    goNext,
    goPrevious,
    goToIndex,
    onTransitionComplete,
  }
}

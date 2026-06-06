import type { GeneratedStory } from '@/features/stories/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildStudentStorySlides } from '../lib/buildStudentStorySlides'
import type { StudentActivityId, StudentStorySlide } from '../types'

export interface UseStudentStoryReaderResult {
  slides: StudentStorySlide[]
  currentIndex: number
  currentSlide: StudentStorySlide
  totalSlides: number
  canGoNext: boolean
  canGoPrevious: boolean
  isLastSlide: boolean
  nextLabel: string
  activeActivity: StudentActivityId | null
  goNext: () => void
  goPrevious: () => void
  selectActivity: (activityId: StudentActivityId) => void
  clearActivity: () => void
}

function resolveNextLabel(
  nextSlide: StudentStorySlide | undefined,
  isLastSlide: boolean,
): string {
  if (isLastSlide) {
    return 'Done'
  }

  if (nextSlide?.kind === 'activities') {
    return 'Activities'
  }

  return 'Next'
}

export function useStudentStoryReader(story: GeneratedStory): UseStudentStoryReaderResult {
  const slides = useMemo(() => buildStudentStorySlides(story), [story])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeActivity, setActiveActivity] = useState<StudentActivityId | null>(null)

  useEffect(() => {
    setCurrentIndex(0)
    setActiveActivity(null)
  }, [story])

  const totalSlides = slides.length
  const currentSlide = slides[currentIndex] ?? slides[0]
  const nextSlide = slides[currentIndex + 1]
  const canGoNext = currentIndex < totalSlides - 1
  const canGoPrevious = currentIndex > 0
  const isLastSlide = currentIndex >= totalSlides - 1
  const nextLabel = resolveNextLabel(nextSlide, isLastSlide)

  const goNext = useCallback(() => {
    if (!canGoNext) return
    setCurrentIndex((index) => Math.min(index + 1, totalSlides - 1))
  }, [canGoNext, totalSlides])

  const goPrevious = useCallback(() => {
    if (!canGoPrevious) return
    setActiveActivity(null)
    setCurrentIndex((index) => Math.max(index - 1, 0))
  }, [canGoPrevious])

  const selectActivity = useCallback((activityId: StudentActivityId) => {
    setActiveActivity(activityId)
  }, [])

  const clearActivity = useCallback(() => {
    setActiveActivity(null)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (currentSlide.kind === 'activities') {
        return
      }

      if ((event.key === 'ArrowRight' || event.key === 'PageDown') && canGoNext) {
        event.preventDefault()
        goNext()
      }

      if ((event.key === 'ArrowLeft' || event.key === 'PageUp') && canGoPrevious) {
        event.preventDefault()
        goPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoNext, canGoPrevious, currentSlide.kind, goNext, goPrevious])

  return {
    slides,
    currentIndex,
    currentSlide,
    totalSlides,
    canGoNext,
    canGoPrevious,
    isLastSlide,
    nextLabel,
    activeActivity,
    goNext,
    goPrevious,
    selectActivity,
    clearActivity,
  }
}

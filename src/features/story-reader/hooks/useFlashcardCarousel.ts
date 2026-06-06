import type { StoryFlashcard } from '@/features/stories/types'
import { useCallback, useEffect, useState } from 'react'
import { createSequentialIndices, createShuffledIndices } from '../lib/shuffleFlashcards'

export interface UseFlashcardCarouselOptions {
  cards: StoryFlashcard[]
}

export interface UseFlashcardCarouselResult {
  currentCard: StoryFlashcard | null
  currentIndex: number
  currentPosition: number
  totalCards: number
  progressPercent: number
  isFlipped: boolean
  isShuffleEnabled: boolean
  canGoNext: boolean
  canGoPrevious: boolean
  flip: () => void
  resetFlip: () => void
  goNext: () => void
  goPrevious: () => void
  toggleShuffle: () => void
}

export function useFlashcardCarousel({
  cards,
}: UseFlashcardCarouselOptions): UseFlashcardCarouselResult {
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false)
  const [displayOrder, setDisplayOrder] = useState<number[]>(() => createSequentialIndices(cards.length))
  const [currentPosition, setCurrentPosition] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    setDisplayOrder(createSequentialIndices(cards.length))
    setCurrentPosition(0)
    setIsFlipped(false)
    setIsShuffleEnabled(false)
  }, [cards])

  const totalCards = cards.length
  const currentIndex = displayOrder[currentPosition] ?? 0
  const currentCard = cards[currentIndex] ?? null
  const canGoNext = currentPosition < totalCards - 1
  const canGoPrevious = currentPosition > 0
  const progressPercent =
    totalCards <= 1 ? 100 : Math.round((currentPosition / (totalCards - 1)) * 100)

  const resetFlip = useCallback(() => {
    setIsFlipped(false)
  }, [])

  const flip = useCallback(() => {
    if (!currentCard) {
      return
    }

    setIsFlipped((value) => !value)
  }, [currentCard])

  const goNext = useCallback(() => {
    if (!canGoNext) {
      return
    }

    setIsFlipped(false)
    setCurrentPosition((position) => Math.min(position + 1, totalCards - 1))
  }, [canGoNext, totalCards])

  const goPrevious = useCallback(() => {
    if (!canGoPrevious) {
      return
    }

    setIsFlipped(false)
    setCurrentPosition((position) => Math.max(position - 1, 0))
  }, [canGoPrevious])

  const toggleShuffle = useCallback(() => {
    setIsShuffleEnabled((enabled) => {
      const nextEnabled = !enabled
      setDisplayOrder(nextEnabled ? createShuffledIndices(cards.length) : createSequentialIndices(cards.length))
      setCurrentPosition(0)
      setIsFlipped(false)
      return nextEnabled
    })
  }, [cards.length])

  return {
    currentCard,
    currentIndex,
    currentPosition,
    totalCards,
    progressPercent,
    isFlipped,
    isShuffleEnabled,
    canGoNext,
    canGoPrevious,
    flip,
    resetFlip,
    goNext,
    goPrevious,
    toggleShuffle,
  }
}

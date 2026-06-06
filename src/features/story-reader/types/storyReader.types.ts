import type { GeneratedStory, StoryFlashcard, StoryPage } from '@/features/stories/types'

export type StoryReaderSlideKind = 'cover' | 'story' | 'flashcards' | 'end'

export type StoryReaderTransitionDirection = 1 | -1

export interface StoryReaderCoverSlide {
  kind: 'cover'
  title: string
  summary: string
  pageCount: number
  wordCount: number
}

export interface StoryReaderStorySlide {
  kind: 'story'
  page: StoryPage
  index: number
  total: number
}

export interface StoryReaderFlashcardsSlide {
  kind: 'flashcards'
  cards: StoryFlashcard[]
}

export interface StoryReaderEndSlide {
  kind: 'end'
  title: string
  pageCount: number
  flashcardCount: number
}

export type StoryReaderSlide =
  | StoryReaderCoverSlide
  | StoryReaderStorySlide
  | StoryReaderFlashcardsSlide
  | StoryReaderEndSlide

export interface StoryReaderNavigationState {
  slides: StoryReaderSlide[]
  currentIndex: number
  currentSlide: StoryReaderSlide
  totalSlides: number
  canGoNext: boolean
  canGoPrevious: boolean
  isFirstSlide: boolean
  isLastSlide: boolean
}

export interface StoryReaderProps {
  story: GeneratedStory
  onComplete?: () => void
  onExit?: () => void
  className?: string
}

export interface StoryReaderSlideLabel {
  index: number
  kind: StoryReaderSlideKind
  label: string
}

import type { StoryReaderFlashcardsSlide } from '../types'
import { FlashcardCarousel } from './FlashcardCarousel'

interface StoryReaderFlashcardsProps {
  slide: StoryReaderFlashcardsSlide
}

export function StoryReaderFlashcards({ slide }: StoryReaderFlashcardsProps) {
  return (
    <article className="mx-auto w-full max-w-xl">
      <FlashcardCarousel cards={slide.cards} />
    </article>
  )
}

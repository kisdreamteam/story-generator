import { AppButton } from '@/shared/components'
import type { StoryFlashcard } from '@/features/stories/types'
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion'
import { useFlashcardCarousel } from '../../hooks/useFlashcardCarousel'
import { FlashcardFlipCard } from './FlashcardFlipCard'

export interface FlashcardCarouselProps {
  cards: StoryFlashcard[]
  className?: string
}

const SWIPE_OFFSET = 48
const SWIPE_VELOCITY = 400

export function FlashcardCarousel({ cards, className = '' }: FlashcardCarouselProps) {
  const reducedMotion = useReducedMotion()
  const carousel = useFlashcardCarousel({ cards })

  if (cards.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-10 text-center ${className}`.trim()}>
        <p className="text-sm text-stone-600">No vocabulary cards for this story.</p>
      </div>
    )
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (reducedMotion) {
      return
    }

    if (
      info.offset.x <= -SWIPE_OFFSET ||
      info.velocity.x <= -SWIPE_VELOCITY
    ) {
      carousel.goNext()
      return
    }

    if (
      info.offset.x >= SWIPE_OFFSET ||
      info.velocity.x >= SWIPE_VELOCITY
    ) {
      carousel.goPrevious()
    }
  }

  return (
    <section
      aria-label="Flashcard carousel"
      className={`mx-auto w-full max-w-xl space-y-5 ${className}`.trim()}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nino">Vocabulary</p>
          <p className="mt-1 text-sm text-stone-600">
            Card {carousel.currentPosition + 1} of {carousel.totalCards}
          </p>
        </div>
        <AppButton
          type="button"
          variant={carousel.isShuffleEnabled ? 'primary' : 'secondary'}
          size="sm"
          onClick={carousel.toggleShuffle}
        >
          {carousel.isShuffleEnabled ? 'Shuffled' : 'Shuffle'}
        </AppButton>
      </header>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuenow={carousel.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Flashcard progress"
      >
        <div
          className="h-full rounded-full bg-nino transition-[width] duration-300 ease-out"
          style={{ width: `${carousel.progressPercent}%` }}
        />
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {carousel.currentCard ? (
            <motion.div
              key={`${carousel.currentIndex}-${carousel.isShuffleEnabled ? 'shuffled' : 'ordered'}`}
              initial={reducedMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, x: -24 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
              drag={reducedMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              className="touch-pan-y"
            >
              <FlashcardFlipCard
                card={carousel.currentCard}
                isFlipped={carousel.isFlipped}
                onFlip={carousel.flip}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-1.5" aria-hidden={cards.length <= 1}>
        {Array.from({ length: carousel.totalCards }, (_, position) => {
          const isActive = position === carousel.currentPosition

          return (
            <span
              key={position}
              className={[
                'h-2 rounded-full transition-all',
                isActive ? 'w-5 bg-nino' : 'w-2 bg-stone-300',
              ].join(' ')}
            />
          )
        })}
      </div>

      <nav
        aria-label="Flashcard navigation"
        className="grid grid-cols-2 gap-3 sm:flex sm:justify-between"
      >
        <AppButton
          type="button"
          variant="secondary"
          fullWidth
          className="sm:min-w-32"
          onClick={carousel.goPrevious}
          disabled={!carousel.canGoPrevious}
        >
          Previous
        </AppButton>
        <AppButton
          type="button"
          fullWidth
          className="sm:min-w-32"
          onClick={carousel.goNext}
          disabled={!carousel.canGoNext}
        >
          Next card
        </AppButton>
      </nav>
    </section>
  )
}

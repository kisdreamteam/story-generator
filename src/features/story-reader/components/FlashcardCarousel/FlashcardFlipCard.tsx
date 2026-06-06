import { motion, useReducedMotion } from 'framer-motion'
import type { StoryFlashcard } from '@/features/stories/types'

interface FlashcardFlipCardProps {
  card: StoryFlashcard
  isFlipped: boolean
  onFlip: () => void
}

export function FlashcardFlipCard({ card, isFlipped, onFlip }: FlashcardFlipCardProps) {
  const reducedMotion = useReducedMotion()

  return (
    <button
      type="button"
      onClick={onFlip}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? 'Show word' : 'Show definition'}
      className="group mx-auto block w-full max-w-md perspective-[1200px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
    >
      <motion.div
        className="relative min-h-56 w-full [transform-style:preserve-3d] sm:min-h-64"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-brand-50/50 p-6 shadow-sm [backface-visibility:hidden] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nino">Word</p>
          <p className="mt-4 text-center text-3xl font-bold text-nina sm:text-4xl">{card.word}</p>
          <p className="mt-6 text-sm text-stone-500 group-hover:text-stone-600">Tap to reveal</p>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-nino/10 p-6 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nino">Definition</p>
          <p className="mt-4 text-center text-lg leading-relaxed text-stone-800 sm:text-xl">
            {card.simpleDefinition}
          </p>
          {card.exampleSentence ? (
            <blockquote className="mt-5 max-w-sm text-center text-sm italic leading-relaxed text-stone-600">
              &ldquo;{card.exampleSentence}&rdquo;
            </blockquote>
          ) : null}
          <p className="mt-5 text-sm text-stone-500">Tap to flip back</p>
        </div>
      </motion.div>
    </button>
  )
}

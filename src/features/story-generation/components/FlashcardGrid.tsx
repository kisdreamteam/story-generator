import { SectionCard } from '../../../shared/components'
import type { GeneratedFlashcard } from '../types'

interface FlashcardGridProps {
  flashcards: GeneratedFlashcard[]
}

export function FlashcardGrid({ flashcards }: FlashcardGridProps) {
  return (
    <SectionCard
      title="Flashcard Words"
      description={`${flashcards.length} vocabulary words extracted for classroom use`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {flashcards.map((card) => (
          <div
            key={card.word}
            className="rounded-lg border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-4"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-base font-semibold text-nina">{card.word}</span>
              <span className="text-sm text-stone-500">{card.simpleDefinition}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              &ldquo;{card.exampleSentence}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

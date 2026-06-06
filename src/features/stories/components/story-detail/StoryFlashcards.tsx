import { memo } from 'react'
import { AppCard, SectionCard } from '@/shared/components'
import { displayDetailValue } from '../../utils/storyDetailView'
import { StoryDetailSectionFallback } from './StoryDetailSectionFallback'
import type { StoryFlashcard } from '../../types'
import type { StoryFlashcardsProps } from './types'

const FlashcardReadCard = memo(function FlashcardReadCard({ card }: { card: StoryFlashcard }) {
  return (
    <AppCard padding="md" className="flex h-full flex-col border-stone-200 bg-white">
      <p className="text-lg font-semibold leading-snug text-stone-900">
        {displayDetailValue(card.word)}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">
        {displayDetailValue(card.simpleDefinition, 'No definition provided.')}
      </p>
      <blockquote className="mt-3 border-l-2 border-brand-200 pl-3 text-sm italic leading-relaxed text-stone-600">
        {displayDetailValue(card.exampleSentence, 'No example sentence yet.')}
      </blockquote>
    </AppCard>
  )
})

export function StoryFlashcards({ flashcards }: StoryFlashcardsProps) {
  return (
    <SectionCard
      title="Vocabulary cards"
      description="Use for oral practice, word walls, or a quick review before reading."
    >
      {flashcards.length === 0 ? (
        <StoryDetailSectionFallback message="No vocabulary cards for this story." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {flashcards.map((card, index) => (
            <FlashcardReadCard key={`${card.word}-${index}`} card={card} />
          ))}
        </div>
      )}
    </SectionCard>
  )
}

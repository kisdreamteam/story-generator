import type { StoryFlashcard } from '@/features/stories/types'
import { StudentStoryFlashcardsView } from '../StudentStoryFlashcardsView'
import { StudentActivityPlaceholder } from './StudentActivityPlaceholder'

interface StudentFlashcardsActivityProps {
  cards: StoryFlashcard[]
  onBack: () => void
}

export function StudentFlashcardsActivity({ cards, onBack }: StudentFlashcardsActivityProps) {
  if (cards.length === 0) {
    return (
      <StudentActivityPlaceholder
        emoji="🃏"
        title="Flashcards"
        description="This story does not have word cards yet."
        onBack={onBack}
      />
    )
  }

  return <StudentStoryFlashcardsView cards={cards} onBackToStory={onBack} backLabel="Back to activities" />
}

import type { StoryFlashcard } from '@/features/stories/types'
import type { StudentActivityId } from '../../types'
import { StudentFlashcardsActivity } from './StudentFlashcardsActivity'
import { StudentReadAloudActivity } from './StudentReadAloudActivity'
import { StudentRoleplayActivity } from './StudentRoleplayActivity'
import { StudentVocabularyReviewActivity } from './StudentVocabularyReviewActivity'

interface StudentActivityViewProps {
  activityId: StudentActivityId
  flashcards: StoryFlashcard[]
  onBack: () => void
}

export function StudentActivityView({ activityId, flashcards, onBack }: StudentActivityViewProps) {
  switch (activityId) {
    case 'flashcards':
      return <StudentFlashcardsActivity cards={flashcards} onBack={onBack} />
    case 'roleplay':
      return <StudentRoleplayActivity onBack={onBack} />
    case 'read-aloud':
      return <StudentReadAloudActivity onBack={onBack} />
    case 'vocabulary-review':
      return <StudentVocabularyReviewActivity onBack={onBack} />
  }
}

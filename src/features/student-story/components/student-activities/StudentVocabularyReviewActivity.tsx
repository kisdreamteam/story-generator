import { StudentActivityPlaceholder } from './StudentActivityPlaceholder'

interface StudentVocabularyReviewActivityProps {
  onBack: () => void
}

export function StudentVocabularyReviewActivity({ onBack }: StudentVocabularyReviewActivityProps) {
  return (
    <StudentActivityPlaceholder
      emoji="✨"
      title="Vocabulary review"
      description="Review and practice the words you learned."
      onBack={onBack}
    />
  )
}

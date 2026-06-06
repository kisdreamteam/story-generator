import { StudentActivityPlaceholder } from './StudentActivityPlaceholder'

interface StudentReadAloudActivityProps {
  onBack: () => void
}

export function StudentReadAloudActivity({ onBack }: StudentReadAloudActivityProps) {
  return (
    <StudentActivityPlaceholder
      emoji="📖"
      title="Read aloud"
      description="Read the story out loud with a teacher or friend."
      onBack={onBack}
    />
  )
}

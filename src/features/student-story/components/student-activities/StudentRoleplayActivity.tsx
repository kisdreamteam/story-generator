import { StudentActivityPlaceholder } from './StudentActivityPlaceholder'

interface StudentRoleplayActivityProps {
  onBack: () => void
}

export function StudentRoleplayActivity({ onBack }: StudentRoleplayActivityProps) {
  return (
    <StudentActivityPlaceholder
      emoji="🎭"
      title="Roleplay"
      description="Take turns reading character lines from the story."
      onBack={onBack}
    />
  )
}

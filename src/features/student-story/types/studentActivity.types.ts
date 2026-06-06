export type StudentActivityId =
  | 'flashcards'
  | 'roleplay'
  | 'read-aloud'
  | 'vocabulary-review'

export interface StudentActivityOption {
  id: StudentActivityId
  label: string
  description: string
  emoji: string
}

export const STUDENT_ACTIVITIES: StudentActivityOption[] = [
  {
    id: 'flashcards',
    label: 'Flashcards',
    description: 'Flip cards to learn story words.',
    emoji: '🃏',
  },
  {
    id: 'roleplay',
    label: 'Roleplay',
    description: 'Act out the story with your class.',
    emoji: '🎭',
  },
  {
    id: 'read-aloud',
    label: 'Read aloud',
    description: 'Practice reading the story out loud.',
    emoji: '📖',
  },
  {
    id: 'vocabulary-review',
    label: 'Vocabulary review',
    description: 'Review words from the story.',
    emoji: '✨',
  },
]

export function getStudentActivityLabel(id: StudentActivityId): string {
  return STUDENT_ACTIVITIES.find((activity) => activity.id === id)?.label ?? 'Activity'
}

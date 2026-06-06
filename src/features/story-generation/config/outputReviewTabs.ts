export type OutputReviewTab =
  | 'story'
  | 'flashcards'
  | 'image-prompts'
  | 'teacher-notes'
  | 'debug'

export const outputReviewTabs: { id: OutputReviewTab; label: string }[] = [
  { id: 'story', label: 'Story' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'image-prompts', label: 'Image Prompts' },
  { id: 'teacher-notes', label: 'Teacher Notes' },
  { id: 'debug', label: 'Debug' },
]

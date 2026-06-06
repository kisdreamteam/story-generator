import type { StoryFlashcard, StoryImagePrompt, StoryPage } from '@/features/stories/types'

/** Local draft for one story page card — isolated from other pages. */
export interface EditablePageDraft {
  pageNumber: number
  /** Teacher-facing page title (maps to teachingFocus). */
  teachingFocus: string
  text: string
  imagePrompt: StoryImagePrompt | null
  /** Full story flashcards when this card owns the vocabulary section (typically page 1). */
  flashcards: StoryFlashcard[]
}

/** Payload committed to the story editor session after card-level save. */
export interface EditablePageCommit {
  pageNumber: number
  teachingFocus: string
  text: string
  imagePrompt: StoryImagePrompt | null
  flashcards?: StoryFlashcard[]
}

export interface EditablePageValidation {
  fieldErrors: Record<string, string>
  isValid: boolean
}

export interface EditablePageCardViewModel {
  page: StoryPage
  imagePrompt: StoryImagePrompt | null
  flashcards?: StoryFlashcard[]
}

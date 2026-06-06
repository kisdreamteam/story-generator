import type { StoryFlashcard, StoryImagePrompt, StoryPage } from '@/features/stories/types'
import type { EditablePageDraft, EditablePageValidation } from '../types/editablePage.types'
import { countStoryWords } from './countStoryWords'

const PAGE_TITLE_MAX = 200
const PAGE_TEXT_MIN_WORDS = 1
const PROMPT_MAX = 2000
const CONTINUITY_MAX = 500

export function createEditablePageDraft(
  page: StoryPage,
  imagePrompt: StoryImagePrompt | null,
  flashcards: StoryFlashcard[] = [],
): EditablePageDraft {
  return {
    pageNumber: page.pageNumber,
    teachingFocus: page.teachingFocus,
    text: page.text,
    imagePrompt: imagePrompt
      ? { ...imagePrompt }
      : {
          pageNumber: page.pageNumber,
          prompt: '',
          continuityReminder: '',
        },
    flashcards: flashcards.map((card) => ({ ...card })),
  }
}

export function validateEditablePageDraft(
  draft: EditablePageDraft,
  options?: { includesFlashcards?: boolean },
): EditablePageValidation {
  const fieldErrors: Record<string, string> = {}
  const title = draft.teachingFocus.trim()

  if (title.length > PAGE_TITLE_MAX) {
    fieldErrors.teachingFocus = `Page title must be ${PAGE_TITLE_MAX} characters or fewer.`
  }

  const text = draft.text.trim()
  if (!text) {
    fieldErrors.text = 'Page text is required.'
  } else if (countStoryWords(text) < PAGE_TEXT_MIN_WORDS) {
    fieldErrors.text = 'Page text needs at least one word.'
  }

  if (draft.imagePrompt) {
    const prompt = draft.imagePrompt.prompt.trim()
    if (!prompt) {
      fieldErrors.imagePrompt = 'Illustration prompt is required.'
    } else if (prompt.length > PROMPT_MAX) {
      fieldErrors.imagePrompt = `Illustration prompt must be ${PROMPT_MAX} characters or fewer.`
    }

    const continuity = draft.imagePrompt.continuityReminder.trim()
    if (continuity.length > CONTINUITY_MAX) {
      fieldErrors.continuityReminder = `Continuity note must be ${CONTINUITY_MAX} characters or fewer.`
    }
  }

  if (options?.includesFlashcards) {
    draft.flashcards.forEach((card, index) => {
      if (!card.word.trim()) {
        fieldErrors[`flashcard-${index}-word`] = 'Word is required.'
      }
      if (!card.simpleDefinition.trim()) {
        fieldErrors[`flashcard-${index}-definition`] = 'Definition is required.'
      }
    })
  }

  return {
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
  }
}

export function editablePageDraftEqual(left: EditablePageDraft, right: EditablePageDraft): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

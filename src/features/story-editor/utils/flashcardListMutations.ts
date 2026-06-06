import type { StoryFlashcard } from '@/features/stories/types'
import type { StoryEditorState } from '../types/storyEditorState.types'

export function createEmptyFlashcard(): StoryFlashcard {
  return {
    word: '',
    simpleDefinition: '',
    exampleSentence: '',
  }
}

export function applyAddFlashcard(
  state: StoryEditorState,
  afterIndex?: number,
): StoryEditorState {
  const flashcards = [...state.flashcards]
  const insertAt =
    afterIndex !== undefined && afterIndex >= 0 ? afterIndex + 1 : flashcards.length

  flashcards.splice(insertAt, 0, createEmptyFlashcard())

  return {
    ...state,
    flashcards,
  }
}

export function applyRemoveFlashcard(
  state: StoryEditorState,
  index: number,
): StoryEditorState {
  if (index < 0 || index >= state.flashcards.length) {
    return state
  }

  return {
    ...state,
    flashcards: state.flashcards.filter((_, cardIndex) => cardIndex !== index),
  }
}

export function applyMoveFlashcard(
  state: StoryEditorState,
  index: number,
  direction: 'up' | 'down',
): StoryEditorState {
  const targetIndex = direction === 'up' ? index - 1 : index + 1

  if (index < 0 || index >= state.flashcards.length) {
    return state
  }

  if (targetIndex < 0 || targetIndex >= state.flashcards.length) {
    return state
  }

  const flashcards = [...state.flashcards]
  ;[flashcards[index], flashcards[targetIndex]] = [flashcards[targetIndex], flashcards[index]]

  return {
    ...state,
    flashcards,
  }
}

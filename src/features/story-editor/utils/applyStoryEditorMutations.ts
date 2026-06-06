import type { StoryFlashcard, StoryImagePrompt } from '@/features/stories/types'
import type { EditableStoryContent } from '../types'
import type { StoryEditorState } from '../types/storyEditorState.types'
import {
  convertEditorStateToGeneratedStory,
  createStoryEditorState,
  normalizeStoryEditorState,
} from './storyEditorStateMapping'

export function applyPageTextChange(
  state: StoryEditorState,
  pageNumber: number,
  text: string,
): StoryEditorState {
  return normalizeStoryEditorState({
    ...state,
    pages: state.pages.map((page) =>
      page.pageNumber === pageNumber ? { ...page, text } : page,
    ),
  })
}

export function applyPageTeachingFocusChange(
  state: StoryEditorState,
  pageNumber: number,
  teachingFocus: string,
): StoryEditorState {
  return {
    ...state,
    pages: state.pages.map((page) =>
      page.pageNumber === pageNumber ? { ...page, teachingFocus } : page,
    ),
  }
}

export function applyFlashcardChange(
  state: StoryEditorState,
  index: number,
  patch: Partial<StoryFlashcard>,
): StoryEditorState {
  return {
    ...state,
    flashcards: state.flashcards.map((card, cardIndex) =>
      cardIndex === index ? { ...card, ...patch } : card,
    ),
  }
}

export function applyImagePromptChange(
  state: StoryEditorState,
  pageNumber: number,
  patch: Partial<StoryImagePrompt>,
): StoryEditorState {
  const existing = state.imagePrompts.find((item) => item.pageNumber === pageNumber)

  if (existing) {
    return {
      ...state,
      imagePrompts: state.imagePrompts.map((item) =>
        item.pageNumber === pageNumber ? { ...item, ...patch } : item,
      ),
    }
  }

  return {
    ...state,
    imagePrompts: [
      ...state.imagePrompts,
      {
        pageNumber,
        prompt: '',
        continuityReminder: '',
        ...patch,
      },
    ].sort((left, right) => left.pageNumber - right.pageNumber),
  }
}

export function applyMetadataChange(
  state: StoryEditorState,
  patch: Partial<StoryEditorState['metadata']>,
): StoryEditorState {
  return {
    ...state,
    metadata: { ...state.metadata, ...patch },
  }
}

/** Normalize word counts before persisting edited content (GeneratedStory bridge). */
export function normalizeEditableStory(story: EditableStoryContent): EditableStoryContent {
  return convertEditorStateToGeneratedStory(
    normalizeStoryEditorState(createStoryEditorState(story)),
  )
}

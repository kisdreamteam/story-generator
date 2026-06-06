import type { GeneratedStory } from '@/features/stories/types'
import type { StoryEditorState } from '../types/storyEditorState.types'
import { countStoryWords } from './countStoryWords'

/** Deep-clone editor state so mutations never touch prior references. */
export function cloneStoryEditorState(state: StoryEditorState): StoryEditorState {
  return JSON.parse(JSON.stringify(state)) as StoryEditorState
}

/**
 * Convert persisted or generated story output into isolated editor state.
 * Does not mutate `source`.
 */
export function createStoryEditorState(source: GeneratedStory): StoryEditorState {
  const cloned = JSON.parse(JSON.stringify(source)) as GeneratedStory

  return {
    metadata: {
      title: cloned.title,
      summary: cloned.summary,
      generatedAt: cloned.generatedAt,
      totalWordCount: cloned.totalWordCount,
    },
    pages: cloned.storyPages.map((page) => ({ ...page })),
    flashcards: cloned.flashcards.map((card) => ({ ...card })),
    imagePrompts: cloned.imagePrompts.map((prompt) => ({ ...prompt })),
  }
}

/** Recalculate per-page and total word counts on editor state. */
export function normalizeStoryEditorState(state: StoryEditorState): StoryEditorState {
  const pages = state.pages.map((page) => ({
    ...page,
    wordCount: countStoryWords(page.text),
  }))

  return {
    ...state,
    pages,
    metadata: {
      ...state.metadata,
      totalWordCount: pages.reduce((sum, page) => sum + page.wordCount, 0),
    },
  }
}

/**
 * Build a {@link GeneratedStory} payload from editor state for preview and storage APIs.
 * Does not mutate `state`.
 */
export function convertEditorStateToGeneratedStory(state: StoryEditorState): GeneratedStory {
  const normalized = normalizeStoryEditorState(state)

  return {
    title: normalized.metadata.title,
    summary: normalized.metadata.summary,
    generatedAt: normalized.metadata.generatedAt,
    storyPages: normalized.pages.map((page) => ({ ...page })),
    flashcards: normalized.flashcards.map((card) => ({ ...card })),
    imagePrompts: normalized.imagePrompts.map((prompt) => ({ ...prompt })),
    totalWordCount: normalized.metadata.totalWordCount,
  }
}

export function storyEditorStateEqual(left: StoryEditorState, right: StoryEditorState): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

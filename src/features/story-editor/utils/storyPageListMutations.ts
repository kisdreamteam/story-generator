import type { StoryImagePrompt, StoryPage } from '@/features/stories/types'
import type { StoryEditorState } from '../types/storyEditorState.types'
import { countStoryWords } from './countStoryWords'
import { normalizeStoryEditorState } from './storyEditorStateMapping'

const MIN_PAGE_COUNT = 1

function sortPages(pages: StoryPage[]): StoryPage[] {
  return [...pages].sort((left, right) => left.pageNumber - right.pageNumber)
}

function alignPromptsToPages(
  prompts: StoryImagePrompt[],
  pages: StoryPage[],
): StoryImagePrompt[] {
  return pages.map(
    (page) =>
      prompts.find((item) => item.pageNumber === page.pageNumber) ?? {
        pageNumber: page.pageNumber,
        prompt: '',
        continuityReminder: '',
      },
  )
}

function buildRenumberedState(
  state: StoryEditorState,
  sortedPages: StoryPage[],
  sortedPrompts: StoryImagePrompt[],
): StoryEditorState {
  const pages = sortedPages.map((page, index) => ({
    ...page,
    pageNumber: index + 1,
    wordCount: countStoryWords(page.text),
  }))

  const imagePrompts = sortedPrompts.map((prompt, index) => ({
    ...prompt,
    pageNumber: index + 1,
  }))

  return normalizeStoryEditorState({
    ...state,
    pages,
    imagePrompts,
  })
}

export function applyAddStoryPage(
  state: StoryEditorState,
  afterPageNumber?: number,
): StoryEditorState {
  const sortedPages = sortPages(state.pages)
  const sortedPrompts = alignPromptsToPages(state.imagePrompts, sortedPages)

  const insertAt =
    afterPageNumber !== undefined
      ? sortedPages.findIndex((page) => page.pageNumber === afterPageNumber) + 1
      : sortedPages.length

  const safeInsertAt = insertAt < 0 ? sortedPages.length : insertAt

  sortedPages.splice(safeInsertAt, 0, {
    pageNumber: safeInsertAt + 1,
    text: '',
    wordCount: 0,
    teachingFocus: '',
  })

  sortedPrompts.splice(safeInsertAt, 0, {
    pageNumber: safeInsertAt + 1,
    prompt: '',
    continuityReminder: '',
  })

  return buildRenumberedState(state, sortedPages, sortedPrompts)
}

export function applyRemoveStoryPage(
  state: StoryEditorState,
  pageNumber: number,
): StoryEditorState {
  if (state.pages.length <= MIN_PAGE_COUNT) {
    return state
  }

  const sortedPages = sortPages(state.pages)
  const index = sortedPages.findIndex((page) => page.pageNumber === pageNumber)

  if (index < 0) {
    return state
  }

  const sortedPrompts = alignPromptsToPages(state.imagePrompts, sortedPages)
  sortedPages.splice(index, 1)
  sortedPrompts.splice(index, 1)

  return buildRenumberedState(state, sortedPages, sortedPrompts)
}

export function applyMoveStoryPage(
  state: StoryEditorState,
  pageNumber: number,
  direction: 'up' | 'down',
): StoryEditorState {
  const sortedPages = sortPages(state.pages)
  const index = sortedPages.findIndex((page) => page.pageNumber === pageNumber)

  if (index < 0) {
    return state
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1

  if (targetIndex < 0 || targetIndex >= sortedPages.length) {
    return state
  }

  const sortedPrompts = alignPromptsToPages(state.imagePrompts, sortedPages)

  ;[sortedPages[index], sortedPages[targetIndex]] = [
    sortedPages[targetIndex],
    sortedPages[index],
  ]
  ;[sortedPrompts[index], sortedPrompts[targetIndex]] = [
    sortedPrompts[targetIndex],
    sortedPrompts[index],
  ]

  return buildRenumberedState(state, sortedPages, sortedPrompts)
}

export { MIN_PAGE_COUNT as MIN_STORY_PAGE_COUNT }

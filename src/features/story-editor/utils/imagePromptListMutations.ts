import type { StoryImagePrompt, StoryPage } from '@/features/stories/types'
import type { StoryEditorState } from '../types/storyEditorState.types'
import { applyImagePromptChange } from './applyStoryEditorMutations'
import { draftManualImagePrompt } from './draftManualImagePrompt'

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

export function applyMoveImagePrompt(
  state: StoryEditorState,
  pageNumber: number,
  direction: 'up' | 'down',
): StoryEditorState {
  const sortedPages = sortPages(state.pages)
  const alignedPrompts = alignPromptsToPages(state.imagePrompts, sortedPages)
  const index = sortedPages.findIndex((page) => page.pageNumber === pageNumber)

  if (index < 0) {
    return state
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1

  if (targetIndex < 0 || targetIndex >= alignedPrompts.length) {
    return state
  }

  const currentPrompt = alignedPrompts[index]
  const targetPrompt = alignedPrompts[targetIndex]

  alignedPrompts[index] = {
    ...targetPrompt,
    pageNumber: currentPrompt.pageNumber,
  }
  alignedPrompts[targetIndex] = {
    ...currentPrompt,
    pageNumber: targetPrompt.pageNumber,
  }

  return {
    ...state,
    imagePrompts: alignedPrompts,
  }
}

export function applyRegenerateImagePrompt(
  state: StoryEditorState,
  pageNumber: number,
): StoryEditorState {
  const page = state.pages.find((item) => item.pageNumber === pageNumber)

  if (!page) {
    return state
  }

  const draft = draftManualImagePrompt(pageNumber, page.text)

  return applyImagePromptChange(state, pageNumber, draft)
}

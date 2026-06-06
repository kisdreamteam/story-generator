import type { EditablePageCommit } from '../types/editablePage.types'
import type { StoryEditorState } from '../types/storyEditorState.types'
import {
  applyImagePromptChange,
  applyPageTeachingFocusChange,
  applyPageTextChange,
} from './applyStoryEditorMutations'

/** Apply a single page card commit while preserving page ordering. */
export function applyPageCommit(
  state: StoryEditorState,
  commit: EditablePageCommit,
): StoryEditorState {
  let next = applyPageTeachingFocusChange(state, commit.pageNumber, commit.teachingFocus.trim())
  next = applyPageTextChange(next, commit.pageNumber, commit.text.trim())

  if (commit.imagePrompt) {
    next = applyImagePromptChange(next, commit.pageNumber, {
      prompt: commit.imagePrompt.prompt.trim(),
      continuityReminder: commit.imagePrompt.continuityReminder.trim(),
    })
  }

  if (commit.flashcards) {
    next = {
      ...next,
      flashcards: commit.flashcards.map((card) => ({
        word: card.word.trim(),
        simpleDefinition: card.simpleDefinition.trim(),
        exampleSentence: card.exampleSentence.trim(),
      })),
    }
  }

  return next
}

import { useCallback, useState } from 'react'
import {
  formatFlashcardsForClipboard,
  formatImagePromptsForClipboard,
  formatStoryForClipboard,
} from '../services/formatClipboardText.service'
import type { CopyActionId, CopyFeedback } from '../types/clipboard.types'
import type { StoryGenerationOutput } from '../types'

const FEEDBACK_CLEAR_MS = 3000

export function useClipboardActions(story: StoryGenerationOutput) {
  const [feedback, setFeedback] = useState<CopyFeedback>({})

  const copyText = useCallback(async (text: string, actionId: CopyActionId) => {
    try {
      await navigator.clipboard.writeText(text)
      setFeedback((prev) => ({ ...prev, [actionId]: 'Copied!' }))
    } catch {
      setFeedback((prev) => ({
        ...prev,
        [actionId]: 'Could not copy. Please try again.',
      }))
    }

    window.setTimeout(() => {
      setFeedback((prev) => {
        const next = { ...prev }
        delete next[actionId]
        return next
      })
    }, FEEDBACK_CLEAR_MS)
  }, [])

  const copyStory = useCallback(() => {
    copyText(formatStoryForClipboard(story), 'story')
  }, [copyText, story])

  const copyFlashcards = useCallback(() => {
    copyText(formatFlashcardsForClipboard(story.flashcards), 'flashcards')
  }, [copyText, story.flashcards])

  const copyImagePrompts = useCallback(() => {
    copyText(formatImagePromptsForClipboard(story.imagePrompts), 'imagePrompts')
  }, [copyText, story.imagePrompts])

  return {
    feedback,
    copyStory,
    copyFlashcards,
    copyImagePrompts,
  }
}

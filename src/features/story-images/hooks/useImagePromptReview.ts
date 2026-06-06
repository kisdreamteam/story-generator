import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GeneratedStory, StoryImagePrompt } from '@/features/stories/types'
import {
  alignImagePromptsToPages,
  applyImagePromptPatch,
  cloneImagePrompts,
  findImagePromptForPage,
  imagePromptsEqual,
  isImagePromptPageModified,
} from '../lib/imagePromptReview.utils'

export interface UseImagePromptReviewOptions {
  /** Called whenever the working prompt list changes after user edits. */
  onPromptsChange?: (prompts: StoryImagePrompt[]) => void
}

export interface UseImagePromptReviewResult {
  prompts: StoryImagePrompt[]
  baseline: StoryImagePrompt[]
  isDirty: boolean
  updatePrompt: (pageNumber: number, patch: Partial<StoryImagePrompt>) => void
  resetPage: (pageNumber: number) => void
  resetAll: () => void
  isPageModified: (pageNumber: number) => boolean
  applyToStory: (story: GeneratedStory) => GeneratedStory
}

export function useImagePromptReview(
  story: GeneratedStory | null,
  options: UseImagePromptReviewOptions = {},
): UseImagePromptReviewResult {
  const { onPromptsChange } = options
  const [baseline, setBaseline] = useState<StoryImagePrompt[]>([])
  const [prompts, setPrompts] = useState<StoryImagePrompt[]>([])

  useEffect(() => {
    if (!story) {
      setBaseline([])
      setPrompts([])
      return
    }

    const aligned = alignImagePromptsToPages(story.storyPages, story.imagePrompts)
    const cloned = cloneImagePrompts(aligned)
    setBaseline(cloned)
    setPrompts(cloned)
  }, [story])

  const commitPrompts = useCallback(
    (next: StoryImagePrompt[]) => {
      setPrompts(next)
      onPromptsChange?.(next)
    },
    [onPromptsChange],
  )

  const updatePrompt = useCallback(
    (pageNumber: number, patch: Partial<StoryImagePrompt>) => {
      setPrompts((current) => {
        const next = applyImagePromptPatch(current, pageNumber, patch)
        onPromptsChange?.(next)
        return next
      })
    },
    [onPromptsChange],
  )

  const resetPage = useCallback(
    (pageNumber: number) => {
      setPrompts((current) => {
        const original = findImagePromptForPage(baseline, pageNumber)
        const next = applyImagePromptPatch(current, pageNumber, original)
        onPromptsChange?.(next)
        return next
      })
    },
    [baseline, onPromptsChange],
  )

  const resetAll = useCallback(() => {
    const next = cloneImagePrompts(baseline)
    commitPrompts(next)
  }, [baseline, commitPrompts])

  const isDirty = useMemo(() => !imagePromptsEqual(prompts, baseline), [prompts, baseline])

  const isPageModified = useCallback(
    (pageNumber: number) => isImagePromptPageModified(prompts, baseline, pageNumber),
    [baseline, prompts],
  )

  const applyToStory = useCallback(
    (source: GeneratedStory): GeneratedStory => ({
      ...source,
      imagePrompts: cloneImagePrompts(prompts),
    }),
    [prompts],
  )

  return {
    prompts,
    baseline,
    isDirty,
    updatePrompt,
    resetPage,
    resetAll,
    isPageModified,
    applyToStory,
  }
}

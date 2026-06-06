import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GeneratedStory } from '@/features/stories/types'
import {
  countStoryPagesNeedingImages,
  isStoryPageImageReady,
} from '../lib/storyPageImageGeneration.utils'
import {
  generateMissingStoryPageImages,
  generateStoryPageImage,
} from '../services/storyPageImageGeneration.service'

export interface UseStoryPageImageGenerationOptions {
  story: GeneratedStory | null
  storyId: string
  onStoryChange?: (story: GeneratedStory) => void
}

export interface GenerateMissingImagesResult {
  generated: number[]
  failed: Array<{ pageNumber: number; errorMessage: string }>
}

export interface UseStoryPageImageGenerationResult {
  story: GeneratedStory | null
  missingCount: number
  generatingPageNumbers: number[]
  isGenerating: boolean
  generateMissingImages: () => Promise<GenerateMissingImagesResult>
  regeneratePageImage: (pageNumber: number) => Promise<{ ok: boolean; errorMessage?: string }>
  isPageGenerating: (pageNumber: number) => boolean
  isPageReady: (pageNumber: number) => boolean
  lastError: string | null
}

export function useStoryPageImageGeneration(
  options: UseStoryPageImageGenerationOptions,
): UseStoryPageImageGenerationResult {
  const { storyId, onStoryChange } = options
  const [workingStory, setWorkingStory] = useState<GeneratedStory | null>(null)
  const [generatingPageNumbers, setGeneratingPageNumbers] = useState<number[]>([])
  const [lastError, setLastError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (generatingPageNumbers.length === 0) {
      setWorkingStory(null)
    }
  }, [options.story, generatingPageNumbers.length])

  const story = workingStory ?? options.story

  const syncStory = useCallback(
    (next: GeneratedStory) => {
      setWorkingStory(next)
      onStoryChange?.(next)
    },
    [onStoryChange],
  )

  const missingCount = useMemo(
    () => (story ? countStoryPagesNeedingImages(story) : 0),
    [story],
  )

  const isGenerating = generatingPageNumbers.length > 0

  const regeneratePageImage = useCallback(
    async (pageNumber: number): Promise<{ ok: boolean; errorMessage?: string }> => {
      if (!story || generatingPageNumbers.includes(pageNumber)) {
        return { ok: false, errorMessage: 'Image generation is already in progress.' }
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLastError(null)
      setGeneratingPageNumbers([pageNumber])

      try {
        const outcome = await generateStoryPageImage({
          storyId,
          story,
          pageNumber,
          force: true,
          signal: controller.signal,
          onProgress: syncStory,
        })

        if (outcome.status === 'success') {
          syncStory(outcome.story)
          return { ok: true }
        }

        if (outcome.status === 'failed') {
          syncStory(outcome.story)
          setLastError(outcome.errorMessage)
          return { ok: false, errorMessage: outcome.errorMessage }
        }

        if (outcome.status === 'invalid') {
          setLastError(outcome.errorMessage)
          return { ok: false, errorMessage: outcome.errorMessage }
        }

        return { ok: true }
      } finally {
        setGeneratingPageNumbers([])
      }
    },
    [generatingPageNumbers, story, storyId, syncStory],
  )

  const generateMissingImages = useCallback(async (): Promise<GenerateMissingImagesResult> => {
    if (!story || missingCount === 0 || isGenerating) {
      return { generated: [], failed: [] }
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLastError(null)
    setGeneratingPageNumbers([])

    try {
      const result = await generateMissingStoryPageImages({
        storyId,
        story,
        signal: controller.signal,
        onPageProgress: (pageNumber, nextStory) => {
          setGeneratingPageNumbers([pageNumber])
          syncStory(nextStory)
        },
        onPageComplete: (_pageNumber, nextStory) => {
          syncStory(nextStory)
        },
      })

      syncStory(result.story)

      if (result.failed.length > 0) {
        setLastError(
          `${result.failed.length} page${result.failed.length === 1 ? '' : 's'} could not be illustrated.`,
        )
      }

      return { generated: result.generated, failed: result.failed }
    } finally {
      setGeneratingPageNumbers([])
    }
  }, [isGenerating, missingCount, story, storyId, syncStory])

  const isPageGenerating = useCallback(
    (pageNumber: number) => generatingPageNumbers.includes(pageNumber),
    [generatingPageNumbers],
  )

  const isPageReady = useCallback(
    (pageNumber: number) => {
      if (!story) return false
      const page = story.storyPages.find((item) => item.pageNumber === pageNumber)
      return page ? isStoryPageImageReady(page, story.imagePrompts) : false
    },
    [story],
  )

  return {
    story,
    missingCount,
    generatingPageNumbers,
    isGenerating,
    generateMissingImages,
    regeneratePageImage,
    isPageGenerating,
    isPageReady,
    lastError,
  }
}

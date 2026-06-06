import type { GeneratedStory } from '@/features/stories/types'
import { storyFeedback } from '@/shared/feedback'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { copyStoryTextToClipboard, downloadStoryJson } from '../lib'

export interface UseStoryExportOptions {
  story: GeneratedStory
  projectTitle: string
  storyId: string
}

export interface UseStoryExportResult {
  isCopying: boolean
  copyStoryText: () => Promise<void>
  downloadJson: () => void
  openPrintView: () => void
}

export function useStoryExport({
  story,
  projectTitle,
  storyId,
}: UseStoryExportOptions): UseStoryExportResult {
  const navigate = useNavigate()
  const [isCopying, setIsCopying] = useState(false)

  const copyStoryText = useCallback(async () => {
    setIsCopying(true)

    try {
      await copyStoryTextToClipboard(story, { projectTitle })
      storyFeedback.storyTextCopied()
    } catch {
      storyFeedback.storyExportFailed('Could not copy story text to the clipboard.')
    } finally {
      setIsCopying(false)
    }
  }, [projectTitle, story])

  const downloadJson = useCallback(() => {
    try {
      downloadStoryJson(story, projectTitle)
      storyFeedback.storyJsonDownloaded()
    } catch {
      storyFeedback.storyExportFailed('Could not download the story JSON file.')
    }
  }, [projectTitle, story])

  const openPrintView = useCallback(() => {
    navigate(`/dashboard/stories/${encodeURIComponent(storyId)}/print`)
  }, [navigate, storyId])

  return {
    isCopying,
    copyStoryText,
    downloadJson,
    openPrintView,
  }
}

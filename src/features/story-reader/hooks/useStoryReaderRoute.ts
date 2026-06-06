import { useMemo } from 'react'
import type { GeneratedStory } from '@/features/stories/types'
import { useStoryDetail } from '@/features/stories/hooks/useStoryDetail'
import { storyReaderContentFromProject } from '../lib/storyReaderFromProject'

export interface UseStoryReaderRouteResult {
  status: ReturnType<typeof useStoryDetail>['status']
  presentation: ReturnType<typeof useStoryDetail>['presentation']
  isAuthLoading: boolean
  story: GeneratedStory | null
  hasDraft: boolean
}

/** Load a saved story by id and convert it for the reader route. */
export function useStoryReaderRoute(storyId: string | undefined): UseStoryReaderRouteResult {
  const { status, data, presentation, isAuthLoading } = useStoryDetail(storyId)

  const story = useMemo(() => {
    if (!data) {
      return null
    }

    if (data.kind === 'generated') {
      return data.generatedStory
    }

    return storyReaderContentFromProject(data.draft)
  }, [data])

  return {
    status,
    presentation,
    isAuthLoading,
    story,
    hasDraft: Boolean(data?.draft),
  }
}

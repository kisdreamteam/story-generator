import {
  classifyStoryLoadError,
  invalidStoryIdPresentation,
  isValidStoryRouteId,
  storyNotFoundPresentation,
  type StoryGeneratedLoadStatus,
  type StoryLoadErrorPresentation,
} from '@/features/story-generator/lib/story-route-guards'
import { useAuth } from '@/shared/lib/supabase/useAuth'
import { useCallback, useEffect, useState } from 'react'
import { fetchStoryForDetail, type StoryDetailData } from '../api/storyStorageApi'

export type StoryDetailLoadStatus = StoryGeneratedLoadStatus

export interface UseStoryDetailResult {
  status: StoryDetailLoadStatus
  data: StoryDetailData | null
  presentation: StoryLoadErrorPresentation | null
  isAuthLoading: boolean
  reload: () => void
}

/** Load a saved story for the detail route — page → hook → storage adapter. */
export function useStoryDetail(storyId: string | undefined): UseStoryDetailResult {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [status, setStatus] = useState<StoryDetailLoadStatus>('loading')
  const [data, setData] = useState<StoryDetailData | null>(null)
  const [presentation, setPresentation] = useState<StoryLoadErrorPresentation | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)

  const reload = useCallback(() => {
    setReloadVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    if (isAuthLoading) return

    if (!isValidStoryRouteId(storyId)) {
      setData(null)
      setPresentation(invalidStoryIdPresentation())
      setStatus('invalid-id')
      return
    }

    let cancelled = false
    setStatus('loading')
    setPresentation(null)
    setData(null)

    void (async () => {
      try {
        const result = await fetchStoryForDetail(storyId)

        if (cancelled) return

        if (!result) {
          setData(null)
          setPresentation(storyNotFoundPresentation({ signedIn: isAuthenticated }))
          setStatus('not-found')
          return
        }

        setData(result)
        setPresentation(null)
        setStatus('ready')
      } catch (error) {
        if (cancelled) return
        setData(null)
        setPresentation(classifyStoryLoadError(error))
        setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [storyId, isAuthenticated, isAuthLoading, reloadVersion])

  if (isAuthLoading) {
    return {
      status: 'loading',
      data: null,
      presentation: null,
      isAuthLoading: true,
      reload,
    }
  }

  return { status, data, presentation, isAuthLoading: false, reload }
}

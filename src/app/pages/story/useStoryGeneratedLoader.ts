import { loadDraftWithGeneratedStory } from '@/features/story-generator'
import type { LoadDraftWithGeneratedStoryResult } from '@/features/story-generator/lib/storage/StoryStorageAdapter'
import {
  classifyStoryLoadError,
  invalidStoryIdPresentation,
  isValidStoryRouteId,
  storyNotFoundPresentation,
  type StoryGeneratedLoadStatus,
  type StoryLoadErrorPresentation,
} from '@/features/story-generator/lib/story-route-guards'
import { useAuth } from '@/shared/lib/supabase/useAuth'
import { useEffect, useState } from 'react'

interface UseStoryGeneratedLoaderResult {
  status: StoryGeneratedLoadStatus
  loaded: LoadDraftWithGeneratedStoryResult | null
  presentation: StoryLoadErrorPresentation | null
  isAuthLoading: boolean
}

/**
 * Load a saved story with generated content for detail/edit routes.
 * Re-loads when storyId or auth session changes (safe sign-out / resolver switch).
 */
export function useStoryGeneratedLoader(storyId: string | undefined): UseStoryGeneratedLoaderResult {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [status, setStatus] = useState<StoryGeneratedLoadStatus>('loading')
  const [loaded, setLoaded] = useState<LoadDraftWithGeneratedStoryResult | null>(null)
  const [presentation, setPresentation] = useState<StoryLoadErrorPresentation | null>(null)

  useEffect(() => {
    if (isAuthLoading) return

    if (!isValidStoryRouteId(storyId)) {
      setLoaded(null)
      setPresentation(invalidStoryIdPresentation())
      setStatus('invalid-id')
      return
    }

    let cancelled = false
    setStatus('loading')
    setPresentation(null)
    setLoaded(null)

    void (async () => {
      try {
        const result = await loadDraftWithGeneratedStory(storyId)

        if (cancelled) return

        if (!result) {
          setLoaded(null)
          setPresentation(storyNotFoundPresentation({ signedIn: isAuthenticated }))
          setStatus('not-found')
          return
        }

        setLoaded(result)
        setPresentation(null)
        setStatus('ready')
      } catch (error) {
        if (cancelled) return
        setLoaded(null)
        setPresentation(classifyStoryLoadError(error))
        setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [storyId, isAuthenticated, isAuthLoading])

  if (isAuthLoading) {
    return {
      status: 'loading',
      loaded: null,
      presentation: null,
      isAuthLoading: true,
    }
  }

  return { status, loaded, presentation, isAuthLoading: false }
}

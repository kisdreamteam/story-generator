import { useEffect, useState } from 'react'
import { getStoryDraft, loadDraftWithGeneratedStory } from '@/features/story-generator'
import {
  classifyStoryLoadError,
  invalidStoryIdPresentation,
  isValidStoryRouteId,
  storyNotFoundPresentation,
  type StoryLoadErrorPresentation,
} from '@/features/story-generator/lib/story-route-guards'
import type { GeneratedStory } from '@/features/stories/types'
import type { StudentStoryLoadStatus } from '../types'

export interface UseStudentStoryRouteResult {
  status: StudentStoryLoadStatus
  story: GeneratedStory | null
  presentation: StoryLoadErrorPresentation | null
  reload: () => void
}

/** Load a saved story for the public student route — no login required. */
export function useStudentStoryRoute(storyId: string | undefined): UseStudentStoryRouteResult {
  const [status, setStatus] = useState<StudentStoryLoadStatus>('loading')
  const [story, setStory] = useState<GeneratedStory | null>(null)
  const [presentation, setPresentation] = useState<StoryLoadErrorPresentation | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)

  useEffect(() => {
    if (!isValidStoryRouteId(storyId)) {
      setStory(null)
      setPresentation(invalidStoryIdPresentation())
      setStatus('invalid-id')
      return
    }

    let cancelled = false
    setStatus('loading')
    setPresentation(null)
    setStory(null)

    void (async () => {
      try {
        const withGenerated = await loadDraftWithGeneratedStory(storyId)

        if (cancelled) return

        if (withGenerated) {
          setStory(withGenerated.generatedStory)
          setPresentation(null)
          setStatus('ready')
          return
        }

        const draft = await getStoryDraft(storyId)

        if (cancelled) return

        if (draft) {
          setStory(null)
          setPresentation({
            title: 'This story is not ready yet',
            description: 'Your teacher is still preparing this story. Check back soon.',
          })
          setStatus('not-generated')
          return
        }

        setStory(null)
        setPresentation(storyNotFoundPresentation({ signedIn: false }))
        setStatus('not-found')
      } catch (error) {
        if (cancelled) return
        setStory(null)
        setPresentation(classifyStoryLoadError(error))
        setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [storyId, reloadVersion])

  return {
    status,
    story,
    presentation,
    reload: () => setReloadVersion((current) => current + 1),
  }
}

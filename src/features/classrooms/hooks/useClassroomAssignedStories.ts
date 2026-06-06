import { useCallback, useEffect, useState } from 'react'
import { getStoryDraft } from '@/features/story-generator'
import { hasGeneratedStoryContent, resolveStoryLifecycleStatus } from '@/features/stories/utils'
import { listStoryIdsForClassroom } from '../api/storyClassroomAssignmentsApi'
import type { ClassroomAssignedStory } from '../types/storyClassroomAssignment.types'

export interface UseClassroomAssignedStoriesResult {
  stories: ClassroomAssignedStory[]
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

/** Load stories assigned to a classroom for the classroom detail page. */
export function useClassroomAssignedStories(
  classroomId: string | undefined,
): UseClassroomAssignedStoriesResult {
  const [stories, setStories] = useState<ClassroomAssignedStory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!classroomId) {
      setStories([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const storyIds = await listStoryIdsForClassroom(classroomId)
      const drafts = await Promise.all(storyIds.map((storyId) => getStoryDraft(storyId)))

      const nextStories = drafts
        .filter((draft): draft is NonNullable<typeof draft> => draft !== null)
        .map((draft) => ({
          id: draft.id,
          title: draft.title,
          theme: draft.theme,
          isGenerated: hasGeneratedStoryContent(draft),
          lifecycleStatus: resolveStoryLifecycleStatus(draft),
          updatedAt: draft.updatedAt,
        }))
        .sort(
          (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
        )

      setStories(nextStories)
    } catch (loadError) {
      setStories([])
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load classroom stories. Try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [classroomId])

  useEffect(() => {
    void reload()
  }, [reload])

  return { stories, isLoading, error, reload }
}

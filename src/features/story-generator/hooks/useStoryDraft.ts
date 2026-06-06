import { useCallback } from 'react'
import {
  clearStoryDrafts,
  deleteStoryDraft,
  getStoryDraft,
  getStoryDrafts,
  saveStoryDraft,
} from '../lib/story-storage'
import { useStoryGeneratorStore } from '../stores/useStoryGeneratorStore'
import type { StoryProject } from '../types/story-generator.types'
import { useActiveDraftId, useCreatedAt } from './useStoryGeneratorSelectors'

/** Load and save drafts via storage, keeping active draft metadata in the workflow store. */
export function useStoryDraft() {
  const activeDraftId = useActiveDraftId()
  const createdAt = useCreatedAt()
  const setActiveDraftId = useStoryGeneratorStore((state) => state.setActiveDraftId)
  const setCreatedAt = useStoryGeneratorStore((state) => state.setCreatedAt)

  const loadDraft = useCallback((id: string) => getStoryDraft(id), [])

  const saveDraft = useCallback(
    async (project: StoryProject) => {
      const saved = await saveStoryDraft(project)
      setActiveDraftId(saved.id)
      setCreatedAt(saved.createdAt)
      return saved
    },
    [setActiveDraftId, setCreatedAt],
  )

  return {
    activeDraftId,
    createdAt,
    loadDraft,
    saveDraft,
    getStoryDrafts,
    deleteStoryDraft,
    clearStoryDrafts,
  }
}

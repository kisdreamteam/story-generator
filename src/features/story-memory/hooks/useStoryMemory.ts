import { useCallback, useMemo, useState } from 'react'
import type { StoryMemory } from '../models'
import { loadAllStoryMemories, loadStoryMemory } from '../lib'

/** Read story memory from local storage for a single story id. */
export function useStoryMemory(storyId: string | null | undefined) {
  const [version, setVersion] = useState(0)

  const memory = useMemo((): StoryMemory | null => {
    if (!storyId) return null
    return loadStoryMemory(storyId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version triggers reload after saves elsewhere
  }, [storyId, version])

  const reload = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  return { memory, reload }
}

/** Read all stored story memories, newest generated first. */
export function useStoryMemories() {
  const [version, setVersion] = useState(0)

  const memories = useMemo(() => loadAllStoryMemories(), [version])

  const reload = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  return { memories, reload }
}

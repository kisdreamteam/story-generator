import { useCallback, useRef } from 'react'
import { STORY_READER_NAVIGATION_LOCK_MS } from '../lib/storyReaderMotion'

export function useStoryReaderNavigationLock(reducedMotion: boolean) {
  const lockRef = useRef(false)
  const lockTimerRef = useRef<number | null>(null)

  const releaseLock = useCallback(() => {
    lockRef.current = false

    if (lockTimerRef.current !== null) {
      window.clearTimeout(lockTimerRef.current)
      lockTimerRef.current = null
    }
  }, [])

  const acquireLock = useCallback(() => {
    if (lockRef.current) {
      return false
    }

    lockRef.current = true

    if (lockTimerRef.current !== null) {
      window.clearTimeout(lockTimerRef.current)
    }

    const lockDuration = reducedMotion ? 0 : STORY_READER_NAVIGATION_LOCK_MS

    if (lockDuration === 0) {
      lockRef.current = false
      return true
    }

    lockTimerRef.current = window.setTimeout(() => {
      lockRef.current = false
      lockTimerRef.current = null
    }, lockDuration)

    return true
  }, [reducedMotion])

  const isLocked = useCallback(() => lockRef.current, [])

  return {
    acquireLock,
    releaseLock,
    isLocked,
  }
}

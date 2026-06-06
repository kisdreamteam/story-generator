import { useCallback, useEffect, useRef } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'
import {
  confirmDiscardUnsavedChanges,
  DEFAULT_UNSAVED_STORY_MESSAGE,
} from '@/features/stories/lib/unsavedStoryChanges'

export interface UseStoryNavigationBlockerOptions {
  shouldBlock: boolean
  storyId?: string | null
  message?: string
}

export interface UseStoryNavigationBlockerResult {
  isNavigationBlocked: boolean
  confirmLeave: (customMessage?: string) => boolean
}

/**
 * Blocks React Router navigations while `shouldBlock` is true.
 * Uses `useBlocker` + confirm dialog — no `beforeunload` listeners.
 */
export function useStoryNavigationBlocker({
  shouldBlock,
  storyId,
  message = DEFAULT_UNSAVED_STORY_MESSAGE,
}: UseStoryNavigationBlockerOptions): UseStoryNavigationBlockerResult {
  const navigate = useNavigate()
  const previousStoryIdRef = useRef<string | null | undefined>(storyId)
  const isConfirmingStorySwitchRef = useRef(false)

  const confirmLeave = useCallback(
    (customMessage?: string) => confirmDiscardUnsavedChanges(customMessage ?? message),
    [message],
  )

  const shouldBlockNavigation = useCallback(
    (currentPath: string, nextPath: string) => shouldBlock && currentPath !== nextPath,
    [shouldBlock],
  )

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    shouldBlockNavigation(currentLocation.pathname, nextLocation.pathname),
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return

    if (confirmLeave()) {
      blocker.proceed()
      return
    }

    blocker.reset()
  }, [blocker, confirmLeave])

  useEffect(() => {
    const previousStoryId = previousStoryIdRef.current

    if (!shouldBlock || !storyId || !previousStoryId || storyId === previousStoryId) {
      previousStoryIdRef.current = storyId
      return
    }

    if (isConfirmingStorySwitchRef.current) {
      isConfirmingStorySwitchRef.current = false
      previousStoryIdRef.current = storyId
      return
    }

    if (confirmLeave()) {
      previousStoryIdRef.current = storyId
      return
    }

    isConfirmingStorySwitchRef.current = true
    navigate(`/dashboard/stories/${encodeURIComponent(previousStoryId)}`, { replace: true })
  }, [confirmLeave, navigate, shouldBlock, storyId])

  return {
    isNavigationBlocked: blocker.state === 'blocked',
    confirmLeave,
  }
}

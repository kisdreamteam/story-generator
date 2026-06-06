import { useCallback, useEffect } from 'react'
import { useBlocker } from 'react-router-dom'
import { isLeavingCreateStoryRoute } from '../lib/createStoryNavigation'
import { attachBeforeUnloadWarning, confirmDiscardUnsavedChanges } from '../lib/unsavedStoryChanges'

export interface UseCreateStoryNavigationGuardOptions {
  shouldWarn: boolean
  message: string
}

/**
 * Warn before leaving the create-story page or refreshing when setup/generation is unsaved.
 * Does not block in-flow step changes (form → review → generated).
 */
export function useCreateStoryNavigationGuard({
  shouldWarn,
  message,
}: UseCreateStoryNavigationGuardOptions): void {
  useEffect(() => {
    return attachBeforeUnloadWarning(shouldWarn, message)
  }, [shouldWarn, message])

  const shouldBlockNavigation = useCallback(
    (currentPath: string, nextPath: string) => {
      return shouldWarn && isLeavingCreateStoryRoute(currentPath, nextPath)
    },
    [shouldWarn],
  )

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    shouldBlockNavigation(currentLocation.pathname, nextLocation.pathname),
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return

    if (confirmDiscardUnsavedChanges(message)) {
      blocker.proceed()
      return
    }

    blocker.reset()
  }, [blocker, message])
}

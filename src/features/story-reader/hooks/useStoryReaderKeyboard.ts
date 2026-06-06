import { useEffect } from 'react'

interface UseStoryReaderKeyboardOptions {
  enabled: boolean
  canGoNext: boolean
  canGoPrevious: boolean
  onNext: () => void
  onPrevious: () => void
}

export function useStoryReaderKeyboard({
  enabled,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
}: UseStoryReaderKeyboardOptions) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return
      }

      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        if (!canGoNext) {
          return
        }

        event.preventDefault()
        onNext()
      }

      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        if (!canGoPrevious) {
          return
        }

        event.preventDefault()
        onPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoNext, canGoPrevious, enabled, onNext, onPrevious])
}

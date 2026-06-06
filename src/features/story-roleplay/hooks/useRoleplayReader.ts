import { useCallback, useEffect, useState } from 'react'
import type { RoleplayLine, RoleplayScript } from '../types'

export type RoleplayReaderView = 'step' | 'full'

export interface UseRoleplayReaderResult {
  view: RoleplayReaderView
  setView: (view: RoleplayReaderView) => void
  lines: RoleplayLine[]
  currentIndex: number
  currentLine: RoleplayLine
  totalLines: number
  canGoPrevious: boolean
  canGoNext: boolean
  progressLabel: string
  progressPercent: number
  goNext: () => void
  goPrevious: () => void
  goToIndex: (index: number) => void
}

export function useRoleplayReader(script: RoleplayScript): UseRoleplayReaderResult {
  const lines = script.lines
  const [view, setView] = useState<RoleplayReaderView>('step')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setCurrentIndex(0)
  }, [script])

  const totalLines = lines.length
  const safeIndex = totalLines === 0 ? 0 : Math.min(currentIndex, totalLines - 1)
  const currentLine = lines[safeIndex] ?? lines[0]
  const canGoPrevious = safeIndex > 0
  const canGoNext = safeIndex < totalLines - 1
  const progressLabel = totalLines === 0 ? '0 lines' : `${safeIndex + 1} of ${totalLines}`
  const progressPercent =
    totalLines <= 1 ? 100 : Math.round((safeIndex / (totalLines - 1)) * 100)

  const goToIndex = useCallback(
    (index: number) => {
      if (totalLines === 0) return
      setCurrentIndex(Math.max(0, Math.min(index, totalLines - 1)))
    },
    [totalLines],
  )

  const goNext = useCallback(() => {
    goToIndex(safeIndex + 1)
  }, [goToIndex, safeIndex])

  const goPrevious = useCallback(() => {
    goToIndex(safeIndex - 1)
  }, [goToIndex, safeIndex])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        if (canGoNext) {
          event.preventDefault()
          goNext()
        }
      }

      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        if (canGoPrevious) {
          event.preventDefault()
          goPrevious()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoNext, canGoPrevious, goNext, goPrevious])

  return {
    view,
    setView,
    lines,
    currentIndex: safeIndex,
    currentLine,
    totalLines,
    canGoPrevious,
    canGoNext,
    progressLabel,
    progressPercent,
    goNext,
    goPrevious,
    goToIndex,
  }
}

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  buildCompletedProgressSnapshot,
  buildRunningProgressSnapshot,
  buildRunningStartSnapshot,
  INITIAL_GENERATION_PROGRESS_SNAPSHOT,
  type GenerationProgressSnapshot,
} from './lib/generationProgressSnapshot'
import { setGenerationProgressReporter } from './lib/generationProgressReporter'
import {
  GenerationProgressContext,
  type GenerationProgressContextValue,
} from './generationProgressContext'

export interface GenerationProgressProviderProps {
  children: ReactNode
}

/** Subscribable generation progress — wired to the story generation pipeline. */
export function GenerationProgressProvider({ children }: GenerationProgressProviderProps) {
  const [snapshot, setSnapshot] = useState<GenerationProgressSnapshot>(
    INITIAL_GENERATION_PROGRESS_SNAPSHOT,
  )

  const resetProgress = useCallback(() => {
    setSnapshot(INITIAL_GENERATION_PROGRESS_SNAPSHOT)
  }, [])

  useEffect(() => {
    setGenerationProgressReporter({
      onRunStart: () => {
        setSnapshot(buildRunningStartSnapshot())
      },
      onStageProgress: (progress) => {
        setSnapshot(buildRunningProgressSnapshot(progress))
      },
      onRunComplete: (result) => {
        setSnapshot(buildCompletedProgressSnapshot(result))
      },
      reset: resetProgress,
    })

    return () => {
      setGenerationProgressReporter(null)
    }
  }, [resetProgress])

  const value = useMemo((): GenerationProgressContextValue => {
    return {
      snapshot,
      currentStep: snapshot.currentStep,
      percentage: snapshot.percentage,
      status: snapshot.status,
      errors: snapshot.errors,
      resetProgress,
    }
  }, [resetProgress, snapshot])

  return (
    <GenerationProgressContext.Provider value={value}>{children}</GenerationProgressContext.Provider>
  )
}

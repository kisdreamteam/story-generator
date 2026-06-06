import { useMemo } from 'react'
import { buildProjectSummary, formatProjectSummaryFields } from '../services/buildProjectSummary.service'
import type { StoryGenerationInput, StoryGenerationOutput } from '../types'

export function useProjectSummary(
  story: StoryGenerationOutput,
  generationInput: StoryGenerationInput,
) {
  const summary = useMemo(
    () => buildProjectSummary(story, generationInput),
    [story, generationInput],
  )

  const fields = useMemo(() => formatProjectSummaryFields(summary), [summary])

  return { summary, fields }
}

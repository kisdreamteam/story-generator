import { SeriesContinuityMode, type SeriesProfile } from '@/features/story-continuity'
import { buildContinuitySummary } from '@/features/story-continuity'
import type { AIPromptContract } from '../../builders/buildAIPromptContract'

export function resolvePromptSeriesName(
  contract: AIPromptContract,
  profile: SeriesProfile | null,
): string {
  const profileName = profile?.name?.trim()
  if (profileName) return profileName
  return contract.storyStructure.seriesName
}

/** Series-level continuity lines for new vs existing series modes. */
export function buildSeriesContinuityLines(
  mode: SeriesContinuityMode,
  profile: SeriesProfile | null,
  seriesName: string,
): string[] {
  if (mode === SeriesContinuityMode.NEW) {
    const lines = [
      'Series mode: NEW — establish a consistent series bible in this story.',
      `Working series name: ${seriesName}.`,
      'Introduce characters, visual style, and recurring rules that future stories can reuse.',
    ]

    if (profile && profile.recurringRules.length > 0) {
      lines.push('Teacher-defined series rules:', ...profile.recurringRules.map((rule) => `- ${rule}`))
    }

    return lines
  }

  const lines = [
    'Series mode: EXISTING — continue an established series without breaking continuity.',
    `Series: ${seriesName}.`,
    'Honor established characters, relationships, locations, and visual style.',
  ]

  const summary = buildContinuitySummary(profile)
  if (summary.trim()) {
    lines.push('', summary)
  }

  return lines
}

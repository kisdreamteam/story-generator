import type {
  BuildContinuityContextInput,
  ContinuityContext,
  SeriesCharacterProfile,
  SeriesProfile,
} from '../models'

function formatCharacterLine(character: SeriesCharacterProfile): string {
  const role = character.role ? `: ${character.role}` : ''
  const appearance = character.appearanceNotes
    ? ` Appearance: ${character.appearanceNotes}.`
    : ''

  return `- ${character.name}${role}.${appearance}`.trim()
}

function formatListSection(title: string, items: string[]): string[] {
  if (items.length === 0) return []

  return [title, ...items.map((item) => `- ${item}`)]
}

/** Plain-text continuity summary for future prompt injection. */
export function buildContinuitySummary(profile: SeriesProfile | null): string {
  if (!profile) {
    return 'No series continuity profile is available.'
  }

  const lines: string[] = [`Series: ${profile.name}`]

  if (profile.characters.length > 0) {
    lines.push('Characters:', ...profile.characters.map(formatCharacterLine))
  }

  if (profile.relationships.length > 0) {
    lines.push(
      'Relationships:',
      ...profile.relationships.map(
        (relationship) =>
          `- ${relationship.between[0]} & ${relationship.between[1]}: ${relationship.description}`,
      ),
    )
  }

  lines.push(...formatListSection('Appearance notes:', profile.appearanceNotes))
  lines.push(...formatListSection('Recurring locations:', profile.recurringLocations))
  lines.push(...formatListSection('Recurring rules:', profile.recurringRules))

  return lines.join('\n')
}

/** Build the continuity context object for generation boundaries. */
export function buildContinuityContext(input: BuildContinuityContextInput): ContinuityContext {
  const profile = input.profile ?? null

  return {
    mode: input.mode,
    seriesId: input.seriesId ?? profile?.id ?? null,
    profile,
    summary: buildContinuitySummary(profile),
  }
}

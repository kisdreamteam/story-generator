import { SeriesContinuityMode, type SeriesCharacterProfile, type SeriesProfile } from '@/features/story-continuity'

function formatCharacterLine(character: SeriesCharacterProfile): string {
  const role = character.role ? `: ${character.role}` : ''
  const appearance = character.appearanceNotes
    ? ` Appearance: ${character.appearanceNotes}.`
    : ''

  return `- ${character.name}${role}.${appearance}`.trim()
}

/** Character continuity lines from profile and teacher setup notes. */
export function buildCharacterContinuityLines(
  mode: SeriesContinuityMode,
  profile: SeriesProfile | null,
  setupCharacters: string,
): string[] {
  const lines: string[] = []

  if (mode === SeriesContinuityMode.NEW) {
    lines.push('Character continuity: define clear, reusable character identities for a new series.')
  } else {
    lines.push('Character continuity: keep names, roles, and appearances aligned with prior stories.')
  }

  const trimmedSetup = setupCharacters.trim()
  if (trimmedSetup) {
    lines.push(`Teacher character notes: ${trimmedSetup}`)
  }

  if (profile?.characters.length) {
    lines.push('Series characters:', ...profile.characters.map(formatCharacterLine))
  } else if (!trimmedSetup) {
    lines.push('- Use the teacher setup characters consistently on every page.')
  }

  if (profile?.relationships.length) {
    lines.push(
      'Relationships:',
      ...profile.relationships.map(
        (relationship) =>
          `- ${relationship.between[0]} & ${relationship.between[1]}: ${relationship.description}`,
      ),
    )
  }

  if (profile?.appearanceNotes.length) {
    lines.push('Appearance notes:', ...profile.appearanceNotes.map((note) => `- ${note}`))
  }

  return lines
}

/** Compact reminder string for image prompts. */
export function buildCharacterContinuityReminder(
  profile: SeriesProfile | null,
  setupCharacters: string,
  visualStyleNotes: string[],
): string {
  const parts: string[] = []

  const trimmedSetup = setupCharacters.trim()
  if (trimmedSetup) {
    parts.push(trimmedSetup)
  } else if (profile?.characters.length) {
    parts.push(
      profile.characters
        .map((character) => {
          const role = character.role ? ` (${character.role})` : ''
          return `${character.name}${role}`
        })
        .join('; '),
    )
  }

  if (visualStyleNotes.length > 0) {
    parts.push(visualStyleNotes.join('; '))
  }

  return parts.join(' — ') || 'Maintain consistent character appearance and illustration style.'
}

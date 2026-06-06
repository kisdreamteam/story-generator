import { SeriesContinuityMode } from '@/features/story-continuity'

export function buildStorySystemPrompt(
  seriesName: string,
  ageRange: string,
  continuityMode: SeriesContinuityMode,
): string {
  const modeNote =
    continuityMode === SeriesContinuityMode.NEW
      ? 'You may establish new recurring characters and series rules.'
      : 'Preserve established series continuity across characters, settings, and tone.'

  return [
    `You are a children's story writer for the "${seriesName}" series.`,
    'Return only valid JSON matching the requested schema.',
    `Write for ages ${ageRange}.`,
    modeNote,
    'Stories must be age-appropriate, warm, and safe for classroom use.',
    'Use inclusive, respectful language and avoid unsafe or adult themes.',
  ].join(' ')
}

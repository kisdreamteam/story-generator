import type { ImagePromptBuildInput } from '../types'

function summarizePageScene(pageText: string): string {
  const sentence = pageText.split(/[.!?]/).map((part) => part.trim()).find(Boolean)
  return sentence ?? pageText.trim()
}

export function buildImageScenePrompt(input: ImagePromptBuildInput): string {
  const scene = summarizePageScene(input.pageText)
  const vocabularyNote =
    input.vocabularyCues && input.vocabularyCues.length > 0
      ? ` Highlight vocabulary: ${input.vocabularyCues.join(', ')}.`
      : ''

  return [
    `Children's book illustration for page ${input.pageNumber} of the "${input.seriesName}" series.`,
    `Scene: ${scene}.`,
    vocabularyNote.trim(),
    'Warm, classroom-safe watercolor style with clear character expressions.',
    'No text overlays, logos, or unsafe elements.',
  ]
    .filter(Boolean)
    .join(' ')
}

export function buildImageContinuityReminder(input: ImagePromptBuildInput): string {
  const characterPart =
    input.characterContinuityLines.length > 0
      ? input.characterContinuityLines.join(' ')
      : 'Keep character identities consistent with prior pages.'

  const visualPart =
    input.visualStyleNotes.length > 0
      ? input.visualStyleNotes.join('; ')
      : 'Maintain the same illustration style throughout the series.'

  return `${characterPart} Visual: ${visualPart}`
}

function summarizePageScene(pageText: string): string {
  const sentence = pageText
    .split(/[.!?]/)
    .map((part) => part.trim())
    .find(Boolean)

  return sentence ?? pageText.trim()
}

/** Local draft helper — no AI calls; teachers can edit the result manually. */
export function draftManualImagePrompt(
  pageNumber: number,
  pageText: string,
): { prompt: string; continuityReminder: string } {
  const scene = summarizePageScene(pageText)

  return {
    prompt: [
      `Children's book illustration for page ${pageNumber}.`,
      scene ? `Scene: ${scene}.` : '',
      'Warm, classroom-safe watercolor style with clear character expressions.',
      'No text overlays, logos, or unsafe elements.',
    ]
      .filter(Boolean)
      .join(' '),
    continuityReminder:
      'Keep character identities and illustration style consistent with prior pages.',
  }
}

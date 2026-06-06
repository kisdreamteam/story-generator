import type {
  GeneratedFlashcard,
  GeneratedImagePrompt,
  StoryGenerationOutput,
} from '../types'

export function formatStoryForClipboard(story: StoryGenerationOutput): string {
  const lines = [story.title, '', story.summary, '']

  for (const page of story.pages) {
    lines.push(`Page ${page.pageNumber}`)
    lines.push(page.text)
    lines.push('')
  }

  return lines.join('\n').trim()
}

export function formatFlashcardsForClipboard(flashcards: GeneratedFlashcard[]): string {
  return flashcards
    .map(
      (card) =>
        `${card.word}\n  Definition: ${card.simpleDefinition}\n  Example: "${card.exampleSentence}"`,
    )
    .join('\n\n')
}

export function formatImagePromptsForClipboard(imagePrompts: GeneratedImagePrompt[]): string {
  return imagePrompts
    .map(
      (item) =>
        `Page ${item.pageNumber}\nPrompt: ${item.prompt}\nContinuity: ${item.continuityReminder}`,
    )
    .join('\n\n')
}

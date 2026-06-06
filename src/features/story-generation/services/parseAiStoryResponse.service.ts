import type { StoryGenerationInput, StoryGenerationOutput } from '../types'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Parses raw JSON from the backend/AI provider into StoryGenerationOutput.
 * Used after requestAiStoryGeneration() returns rawText — never parses direct provider calls from the browser.
 * Returns null when parsing fails or required fields are missing.
 */
export function parseAiStoryResponse(
  rawContent: string,
  input: StoryGenerationInput,
): StoryGenerationOutput | null {
  try {
    const parsed = JSON.parse(rawContent) as Partial<StoryGenerationOutput>

    if (!parsed.title || !parsed.summary || !Array.isArray(parsed.pages)) {
      return null
    }

    const pages = parsed.pages.map((page) => ({
      pageNumber: page.pageNumber,
      text: page.text,
      wordCount: page.wordCount ?? countWords(page.text),
      teachingFocus: page.teachingFocus,
    }))

    const totalWordCount =
      parsed.totalWordCount ?? pages.reduce((total, page) => total + page.wordCount, 0)

    return {
      projectId: input.projectId,
      generatedAt: new Date().toISOString(),
      title: parsed.title,
      summary: parsed.summary,
      pages,
      flashcards: parsed.flashcards ?? [],
      imagePrompts: parsed.imagePrompts ?? [],
      totalWordCount,
    }
  } catch {
    return null
  }
}

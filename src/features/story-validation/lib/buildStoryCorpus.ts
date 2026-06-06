import type { GeneratedStoryOutput } from '@/features/story-generator/lib/generation/types'

/** Lowercase searchable text from all generated story fields. */
export function buildStoryCorpus(story: GeneratedStoryOutput): string {
  const parts = [
    story.title,
    story.summary,
    ...story.storyPages.map((page) => page.text),
    ...story.storyPages.map((page) => page.teachingFocus),
    ...story.flashcards.map((card) => card.word),
    ...story.flashcards.map((card) => card.simpleDefinition),
    ...story.flashcards.map((card) => card.exampleSentence),
    ...story.imagePrompts.map((prompt) => prompt.prompt),
    ...story.imagePrompts.map((prompt) => prompt.continuityReminder),
  ]

  return parts.join(' ').toLowerCase()
}

export function storyContainsTerm(corpus: string, term: string): boolean {
  const normalized = term.trim().toLowerCase()
  if (!normalized) return false

  if (normalized.includes(' ')) {
    return corpus.includes(normalized)
  }

  const pattern = new RegExp(`\\b${escapeRegExp(normalized)}\\b`, 'i')
  return pattern.test(corpus)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function extractRuleTokens(rule: string): string[] {
  return rule
    .split(/\s+/)
    .map((token) => token.replace(/[^a-zA-Z0-9'-]/g, ''))
    .filter((token) => token.length > 4)
}

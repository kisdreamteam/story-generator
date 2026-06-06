import type { AIPromptVocabularySection } from '../../builders/buildAIPromptContract'
import type { AIVocabularyMemoryContext } from '../types'

function formatWordList(label: string, words: string[]): string[] {
  if (words.length === 0) return []
  return [`${label}: ${words.join(', ')}`]
}

/** Vocabulary continuity from teacher targets and optional series memory. */
export function buildVocabularyContinuityLines(
  vocabulary: AIPromptVocabularySection,
  memory?: AIVocabularyMemoryContext,
): string[] {
  const lines = ['Vocabulary continuity: weave target words naturally and avoid off-limits terms.']

  if (vocabulary.vocabularyFocus.trim()) {
    lines.push(`Focus: ${vocabulary.vocabularyFocus.trim()}`)
  }

  lines.push(
    `- Words to include: ${vocabulary.wordsToInclude.trim() || 'None specified'}`,
    `- Words to avoid: ${vocabulary.wordsToAvoid.trim() || 'None specified'}`,
  )

  if (memory?.previouslyUsedWords?.length) {
    lines.push(
      ...formatWordList(
        'Previously used in this series (reuse thoughtfully or vary phrasing)',
        memory.previouslyUsedWords,
      ),
    )
  }

  if (memory?.frequentlyUsedWords?.length) {
    lines.push(
      ...formatWordList(
        'Frequently used words (avoid over-repetition unless teacher requested)',
        memory.frequentlyUsedWords,
      ),
    )
  }

  if (memory?.suggestedUnusedWords?.length) {
    lines.push(
      ...formatWordList(
        'Suggested fresh vocabulary from prior stories (optional enrichment)',
        memory.suggestedUnusedWords,
      ),
    )
  }

  return lines
}

/** Pull likely vocabulary cues from page text for illustration prompts. */
export function extractVocabularyCues(pageText: string, wordsToInclude: string): string[] {
  const candidates = wordsToInclude
    .split(/[,;\n]/)
    .map((word) => word.trim())
    .filter(Boolean)

  if (candidates.length === 0) return []

  const lowerPage = pageText.toLowerCase()

  return candidates.filter((word) => lowerPage.includes(word.toLowerCase()))
}

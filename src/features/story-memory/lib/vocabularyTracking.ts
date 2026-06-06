import type {
  PreviouslyUsedVocabularyResult,
  SuggestUnusedVocabularyOptions,
  SuggestUnusedVocabularyResult,
  VocabularyCandidatePool,
  VocabularyFrequencyEntry,
  VocabularyTrackingOptions,
  VocabularyWordUsage,
} from '../models/vocabularyTracking.model'
import { normalizeFlashcardCandidates } from './buildVocabularyCandidatePool'
import { isNonEmptyVocabularyWord, normalizeVocabularyWord } from './normalizeVocabularyWord'
import { mergeMemoryLists } from './parseMemoryList'
import { loadAllStoryMemories } from './storyMemoryStorage'

function resolveMemories(options?: VocabularyTrackingOptions) {
  const memories = options?.memories ?? loadAllStoryMemories()

  if (!options?.excludeStoryId) {
    return memories
  }

  return memories.filter((memory) => memory.storyId !== options.excludeStoryId)
}

function filterUnusedWords(words: string[], usedKeys: Set<string>): string[] {
  const seen = new Set<string>()
  const unused: string[] = []

  for (const word of words) {
    if (!isNonEmptyVocabularyWord(word)) continue

    const key = normalizeVocabularyWord(word)
    if (usedKeys.has(key) || seen.has(key)) continue

    seen.add(key)
    unused.push(word.trim())
  }

  return unused
}

function applyLimit<T>(items: T[], limit?: number): T[] {
  if (limit === undefined || limit < 0) {
    return items
  }

  return items.slice(0, limit)
}

/** All vocabulary words used across stored story memories. */
export function getPreviouslyUsedVocabulary(
  options?: VocabularyTrackingOptions,
): PreviouslyUsedVocabularyResult {
  const memories = resolveMemories(options)
  const usageByKey = new Map<string, VocabularyWordUsage>()

  for (const memory of memories) {
    for (const word of memory.vocabularyUsed) {
      if (!isNonEmptyVocabularyWord(word)) continue

      const key = normalizeVocabularyWord(word)
      const existing = usageByKey.get(key)

      if (existing) {
        if (!existing.storyIds.includes(memory.storyId)) {
          existing.storyIds.push(memory.storyId)
        }

        if (!existing.lastUsedAt || memory.generatedAt > existing.lastUsedAt) {
          existing.lastUsedAt = memory.generatedAt
        }

        continue
      }

      usageByKey.set(key, {
        word: word.trim(),
        storyIds: [memory.storyId],
        lastUsedAt: memory.generatedAt,
      })
    }
  }

  const usages = [...usageByKey.values()].sort((left, right) => {
    const dateCompare = (right.lastUsedAt ?? '').localeCompare(left.lastUsedAt ?? '')
    if (dateCompare !== 0) return dateCompare
    return left.word.localeCompare(right.word)
  })

  return {
    words: usages.map((usage) => usage.word),
    usages,
  }
}

/** Count how many stories have used each vocabulary word. */
export function getVocabularyFrequency(
  options?: VocabularyTrackingOptions,
): VocabularyFrequencyEntry[] {
  const { usages } = getPreviouslyUsedVocabulary(options)

  return usages
    .map((usage) => ({
      word: usage.word,
      count: usage.storyIds.length,
      storyIds: [...usage.storyIds],
    }))
    .sort((left, right) => {
      const countCompare = right.count - left.count
      if (countCompare !== 0) return countCompare
      return left.word.localeCompare(right.word)
    })
}

/** Return candidate target, optional, and flashcard words not yet used in story memory. */
export function suggestUnusedVocabulary(
  candidates: VocabularyCandidatePool,
  options?: SuggestUnusedVocabularyOptions,
): SuggestUnusedVocabularyResult {
  const { usages } = getPreviouslyUsedVocabulary(options)
  const usedKeys = new Set(usages.map((usage) => normalizeVocabularyWord(usage.word)))

  const targetWords = applyLimit(
    filterUnusedWords(candidates.targetWords ?? [], usedKeys),
    options?.limit,
  )
  const optionalWords = applyLimit(
    filterUnusedWords(candidates.optionalWords ?? [], usedKeys),
    options?.limit,
  )

  const flashcards = applyLimit(
    normalizeFlashcardCandidates(candidates.flashcards ?? []).filter(
      (card) => !usedKeys.has(normalizeVocabularyWord(card.word)),
    ),
    options?.limit,
  )
  const flashcardWords = flashcards.map((card) => card.word)

  return {
    targetWords,
    optionalWords,
    flashcards,
    flashcardWords,
    all: mergeMemoryLists(targetWords, optionalWords, flashcardWords),
  }
}

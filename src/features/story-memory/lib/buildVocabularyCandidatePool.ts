import type { StoryFlashcard, StoryProject, StorySetupInput } from '@/features/stories/types'
import type { BuildVocabularyCandidatePoolInput, VocabularyCandidatePool } from '../models/vocabularyTracking.model'
import { mergeMemoryLists, parseMemoryList } from './parseMemoryList'

function normalizeFlashcardCandidates(
  flashcards: Array<string | StoryFlashcard>,
): StoryFlashcard[] {
  const results: StoryFlashcard[] = []

  for (const entry of flashcards) {
    if (typeof entry === 'string') {
      const word = entry.trim()
      if (!word) continue

      results.push({
        word,
        simpleDefinition: '',
        exampleSentence: '',
      })
      continue
    }

    if (entry.word.trim()) {
      results.push(entry)
    }
  }

  return results
}

/** Map teacher setup fields into target / optional / flashcard buckets. */
export function buildVocabularyCandidatePool(
  input: BuildVocabularyCandidatePoolInput,
): VocabularyCandidatePool {
  const { setup, optionalWords = [], flashcards = [] } = input

  return {
    targetWords: mergeMemoryLists(
      parseMemoryList(setup.wordsToInclude),
      parseMemoryList(setup.vocabularyFocus),
    ),
    optionalWords: mergeMemoryLists(optionalWords),
    flashcards: normalizeFlashcardCandidates(flashcards),
  }
}

/** Build a candidate pool from a saved project (setup + stored flashcards). */
export function buildVocabularyCandidatePoolFromProject(
  project: StoryProject,
): VocabularyCandidatePool {
  const setup = project.setup
  const flashcards = mergeMemoryLists(
    project.flashcards.map((card) => card.word),
    project.generatedStory?.flashcards.map((card) => card.word) ?? [],
  )

  if (!setup) {
    return {
      targetWords: [...project.vocabularyWords],
      optionalWords: [],
      flashcards: normalizeFlashcardCandidates(flashcards),
    }
  }

  return buildVocabularyCandidatePool({
    setup,
    flashcards: [
      ...project.flashcards,
      ...(project.generatedStory?.flashcards ?? []),
      ...flashcards,
    ],
  })
}

/** Convenience wrapper when only setup is available (pre-generation). */
export function buildVocabularyCandidatePoolFromSetup(
  setup: StorySetupInput,
  options?: {
    optionalWords?: string[]
    flashcards?: Array<string | StoryFlashcard>
  },
): VocabularyCandidatePool {
  return buildVocabularyCandidatePool({
    setup,
    optionalWords: options?.optionalWords,
    flashcards: options?.flashcards,
  })
}

export { normalizeFlashcardCandidates }

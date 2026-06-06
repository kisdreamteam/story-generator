import {
  buildContinuityContext,
  DEFAULT_EXISTING_SERIES_ID,
  resolveSeriesProfile,
  SeriesContinuityMode,
  type ContinuityContext,
} from '@/features/story-continuity'
import {
  buildVocabularyCandidatePoolFromSetup,
  getPreviouslyUsedVocabulary,
  getVocabularyFrequency,
  loadAllStoryMemories,
  suggestUnusedVocabulary,
} from '@/features/story-memory'
import type {
  BuildStoryContextInput,
  StoryContext,
  StoryContextMemory,
  StoryContextSeriesContinuity,
} from '../models'
import { normalizeStoryContextSetup } from './normalizeStoryContextSetup'
import { getPreviouslyUsedThemes, mapPreviousStories } from './storyContextMemory'

function resolveContinuityContext(
  input: BuildStoryContextInput['continuity'],
): ContinuityContext {
  const mode = input?.mode ?? SeriesContinuityMode.EXISTING
  const seriesId = input?.seriesId ?? DEFAULT_EXISTING_SERIES_ID
  const profile = resolveSeriesProfile({ mode, seriesId })

  return buildContinuityContext({ mode, seriesId, profile })
}

function mapSeriesContinuity(continuity: ContinuityContext): StoryContextSeriesContinuity {
  const profile = continuity.profile

  return {
    mode: continuity.mode,
    seriesId: continuity.seriesId,
    seriesName: profile?.name ?? null,
    characters: profile?.characters ?? [],
    relationships: profile?.relationships ?? [],
    appearanceNotes: profile?.appearanceNotes ?? [],
    recurringLocations: profile?.recurringLocations ?? [],
    recurringRules: profile?.recurringRules ?? [],
    summary: continuity.summary,
  }
}

function buildMemorySection(input: BuildStoryContextInput): StoryContextMemory {
  const memories = input.memories ?? loadAllStoryMemories()
  const trackingOptions = {
    memories,
    excludeStoryId: input.excludeStoryId,
  }

  const vocabularyUsed = getPreviouslyUsedVocabulary(trackingOptions)
  const vocabularyFrequency = getVocabularyFrequency(trackingOptions)
  const candidatePool = buildVocabularyCandidatePoolFromSetup(input.setup)
  const suggestedUnused = suggestUnusedVocabulary(candidatePool, trackingOptions)
  const themeMemory = getPreviouslyUsedThemes({ memories, excludeStoryId: input.excludeStoryId })
  const filteredMemories = input.excludeStoryId
    ? memories.filter((memory) => memory.storyId !== input.excludeStoryId)
    : memories

  return {
    vocabulary: {
      previouslyUsed: vocabularyUsed.words,
      frequency: vocabularyFrequency,
      suggestedUnused: {
        targetWords: suggestedUnused.targetWords,
        optionalWords: suggestedUnused.optionalWords,
        flashcardWords: suggestedUnused.flashcardWords,
        all: suggestedUnused.all,
      },
    },
    themes: {
      previouslyUsed: themeMemory.themes,
      frequency: themeMemory.frequency,
    },
    previousStories: mapPreviousStories(filteredMemories),
  }
}

/** Assemble a normalized story context from setup, continuity, and story memory. */
export function buildStoryContext(input: BuildStoryContextInput): StoryContext {
  const continuity = resolveContinuityContext(input.continuity)

  return {
    setup: normalizeStoryContextSetup(input.setup),
    seriesContinuity: mapSeriesContinuity(continuity),
    memory: buildMemorySection(input),
    assembledAt: new Date().toISOString(),
    excludeStoryId: input.excludeStoryId,
  }
}

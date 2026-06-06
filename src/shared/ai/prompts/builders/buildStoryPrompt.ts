import {
  resolveSeriesProfile,
  SeriesContinuityMode,
  type SeriesProfile,
} from '@/features/story-continuity'
import type { AIPromptContract } from '../../builders/buildAIPromptContract'
import { buildAIPromptContract } from '../../builders/buildAIPromptContract'
import type { AIStoryGenerationInput } from '../../types'
import {
  buildCharacterContinuityLines,
  buildSeriesContinuityLines,
  buildVocabularyContinuityLines,
  resolvePromptSeriesName,
} from '../continuity'
import { buildStorySystemPrompt, buildStoryUserPrompt } from '../templates'
import type { ResolvedStoryPromptContext, StoryPromptBuildOptions, StoryPromptStrings } from '../types'

function resolveSeriesProfileForPrompt(
  options?: StoryPromptBuildOptions,
): { mode: SeriesContinuityMode; profile: SeriesProfile | null } {
  if (!options?.continuityMode && !options?.seriesId && options?.seriesProfile === undefined) {
    return { mode: SeriesContinuityMode.EXISTING, profile: null }
  }

  const mode = options?.continuityMode ?? SeriesContinuityMode.EXISTING

  if (options?.seriesProfile !== undefined) {
    return { mode, profile: options.seriesProfile }
  }

  return {
    mode,
    profile: resolveSeriesProfile({ mode, seriesId: options?.seriesId }),
  }
}

/** Resolve continuity sections used by story and image prompt builders. */
export function resolveStoryPromptContext(
  contract: AIPromptContract,
  options?: StoryPromptBuildOptions,
): ResolvedStoryPromptContext {
  const { mode, profile } = resolveSeriesProfileForPrompt(options)
  const seriesName = resolvePromptSeriesName(contract, profile)

  return {
    contract,
    seriesName,
    seriesLines: buildSeriesContinuityLines(mode, profile, seriesName),
    characterLines: buildCharacterContinuityLines(mode, profile, contract.setup.characters),
    vocabularyLines: buildVocabularyContinuityLines(contract.vocabulary, options?.vocabularyMemory),
  }
}

/** Build provider-ready story prompt strings from a prompt contract. No network calls. */
export function buildStoryPrompt(
  contract: AIPromptContract,
  options?: StoryPromptBuildOptions,
): StoryPromptStrings {
  const { mode } = resolveSeriesProfileForPrompt(options)
  const context = resolveStoryPromptContext(contract, options)

  return {
    system: buildStorySystemPrompt(context.seriesName, contract.setup.ageRange, mode),
    user: buildStoryUserPrompt(
      contract,
      context.seriesName,
      context.seriesLines,
      context.characterLines,
      context.vocabularyLines,
    ),
  }
}

/** Convenience wrapper: teacher setup → prompt contract → story prompt strings. */
export function buildStoryPromptFromInput(
  input: AIStoryGenerationInput,
  options?: StoryPromptBuildOptions,
): StoryPromptStrings {
  return buildStoryPrompt(buildAIPromptContract(input), options)
}

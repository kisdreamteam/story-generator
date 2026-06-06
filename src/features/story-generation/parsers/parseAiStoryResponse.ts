import type { GeneratedStory } from '@/features/stories/types'
import {
  normalizeStoryResponseContract,
  type StoryResponseContractFlat,
} from '@/features/story-generator/lib/generation/contracts/storyResponseContract'
import { validateGeneratedStory } from '@/features/story-generator/lib/generation/contracts/validation'
import {
  extractJsonFromAiResponse,
  normalizeRawAiStoryPayload,
} from './normalizeRawAiStoryPayload'
import {
  AI_STORY_RESPONSE_PARSE_FALLBACK_MESSAGE,
  type ParseAiStoryResponseOptions,
  type ParseAiStoryResponseResult,
} from './parseAiStoryResponse.types'

function buildFailure(validationErrors: string[]): ParseAiStoryResponseResult {
  const detail =
    validationErrors.length > 0
      ? ` ${validationErrors.slice(0, 4).join('; ')}`
      : ''

  return {
    ok: false,
    error: `${AI_STORY_RESPONSE_PARSE_FALLBACK_MESSAGE}${detail}`,
    validationErrors,
  }
}

function toGeneratedStory(payload: StoryResponseContractFlat): GeneratedStory {
  const contract = normalizeStoryResponseContract(payload)
  const { metadata, storyPages, flashcards, imagePrompts } = contract

  return {
    title: metadata.title,
    summary: metadata.summary,
    storyPages,
    flashcards,
    imagePrompts,
    totalWordCount: metadata.totalWordCount,
    generatedAt: metadata.generatedAt,
  }
}

function validateExpectedPageCount(
  storyPages: StoryResponseContractFlat['storyPages'],
  expectedPageCount: number | undefined,
): string[] {
  if (expectedPageCount === undefined) {
    return []
  }

  if (storyPages.length !== expectedPageCount) {
    return [`storyPages must contain exactly ${expectedPageCount} pages`]
  }

  return []
}

/**
 * Parse and validate a raw AI story response into {@link GeneratedStory}.
 * Never trusts provider output — fields are normalized and contract-validated first.
 */
export function parseAiStoryResponseToGeneratedStory(
  rawResponse: string,
  options: ParseAiStoryResponseOptions = {},
): ParseAiStoryResponseResult {
  const jsonText = extractJsonFromAiResponse(rawResponse)

  if (!jsonText) {
    return buildFailure(['Response did not contain parseable JSON'])
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return buildFailure(['Response JSON is malformed'])
  }

  const normalized = normalizeRawAiStoryPayload(parsed)

  if (!normalized) {
    return buildFailure(['Response is missing required story fields'])
  }

  const validation = validateGeneratedStory(normalized)
  const pageCountErrors = validateExpectedPageCount(
    normalized.storyPages,
    options.expectedPageCount,
  )
  const validationErrors = [...validation.errors, ...pageCountErrors]

  if (!validation.isValid || pageCountErrors.length > 0) {
    return buildFailure(validationErrors)
  }

  return {
    ok: true,
    story: toGeneratedStory(normalized),
  }
}

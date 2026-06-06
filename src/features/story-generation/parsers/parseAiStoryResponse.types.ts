import type { GeneratedStory } from '@/features/stories/types'

export const AI_STORY_RESPONSE_PARSE_FALLBACK_MESSAGE =
  'The AI response could not be parsed into a valid story. Please try generating again.'

export interface ParseAiStoryResponseOptions {
  /** When set, the parsed story must contain exactly this many pages. */
  expectedPageCount?: number
}

export interface ParseAiStoryResponseSuccess {
  ok: true
  story: GeneratedStory
}

export interface ParseAiStoryResponseFailure {
  ok: false
  error: string
  validationErrors: string[]
}

export type ParseAiStoryResponseResult =
  | ParseAiStoryResponseSuccess
  | ParseAiStoryResponseFailure

export function isParseAiStoryResponseFailure(
  result: ParseAiStoryResponseResult,
): result is ParseAiStoryResponseFailure {
  return !result.ok
}

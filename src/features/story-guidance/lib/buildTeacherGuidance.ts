import type { StoryContext } from '@/features/story-context'
import { mergeMemoryLists, parseMemoryList } from '@/features/story-memory'
import {
  StoryValidationWarningCode,
  type StoryValidationResult,
  type StoryValidationWarning,
} from '@/features/story-validation'
import {
  TeacherGuidanceKind as Kind,
  type BuildTeacherGuidanceInput,
  type BuildTeacherGuidanceResult,
  type TeacherGuidanceKind,
  type TeacherGuidanceSuggestion,
} from '../models/teacherGuidance.model'

function createSuggestion(
  kind: TeacherGuidanceKind,
  id: string,
  message: string,
  detail?: string,
): TeacherGuidanceSuggestion {
  return { id, kind, message, detail }
}

function stringDetail(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function mapValidationWarning(warning: StoryValidationWarning): TeacherGuidanceSuggestion | null {
  const word = stringDetail(warning.details?.word)
  const location = stringDetail(warning.details?.location)
  const theme = stringDetail(warning.details?.theme)
  const characterName = stringDetail(warning.details?.characterName)

  switch (warning.code) {
    case StoryValidationWarningCode.REPEATED_VOCABULARY:
      return createSuggestion(
        Kind.VOCABULARY_RECENT,
        `validation-vocab-${word ?? warning.message}`,
        word ? `This vocabulary was used recently: “${word}”.` : 'This vocabulary was used recently.',
        'You may keep it for reinforcement or choose a fresh word for variety.',
      )

    case StoryValidationWarningCode.REPEATED_LOCATION:
      return createSuggestion(
        Kind.SETTING_FREQUENT,
        `validation-location-${location ?? warning.message}`,
        location
          ? `This setting appears often: “${location}”.`
          : 'This setting appears often in recent stories.',
        'Consider a new place if you want more variety across the series.',
      )

    case StoryValidationWarningCode.REPEATED_THEME:
      return createSuggestion(
        Kind.THEME_RECENT,
        `validation-theme-${theme ?? warning.message}`,
        theme ? `This theme was used recently: “${theme}”.` : 'This theme was used recently.',
        'A new theme can help keep your story library fresh.',
      )

    case StoryValidationWarningCode.MISSING_TARGET_WORD:
      return createSuggestion(
        Kind.TARGET_WORDS,
        `validation-missing-${word ?? warning.message}`,
        word
          ? `Target word “${word}” is not in the generated story.`
          : 'Some target words are missing from the generated story.',
        'Consider editing the story or adjusting your setup before saving.',
      )

    case StoryValidationWarningCode.MISSING_CONTINUITY_RULE:
      return createSuggestion(
        Kind.CONTINUITY,
        `validation-continuity-${characterName ?? warning.details?.rule ?? warning.message}`,
        characterName
          ? `Series character “${characterName}” may be missing from this story.`
          : 'Some series continuity notes may not be reflected yet.',
        warning.message,
      )

    default:
      return null
  }
}

function buildContextSuggestions(context: StoryContext): TeacherGuidanceSuggestion[] {
  const suggestions: TeacherGuidanceSuggestion[] = []
  const setupWords = mergeMemoryLists(
    context.setup.wordsToInclude,
    parseMemoryList(context.setup.vocabularyFocus),
  )
  const previousWords = new Set(
    context.memory.vocabulary.previouslyUsed.map((word) => word.toLowerCase()),
  )

  for (const word of setupWords) {
    if (!previousWords.has(word.toLowerCase())) continue

    suggestions.push(
      createSuggestion(
        Kind.VOCABULARY_RECENT,
        `context-vocab-${word.toLowerCase()}`,
        `This vocabulary was used recently: “${word}”.`,
        'You can still include it, or pick a word you have not used lately.',
      ),
    )
  }

  const setting = context.setup.setting.trim()
  const previousLocations = mergeMemoryLists(
    ...context.memory.previousStories.map((story) => story.locationsUsed),
  )

  if (
    setting &&
    previousLocations.some((location) => location.toLowerCase() === setting.toLowerCase())
  ) {
    suggestions.push(
      createSuggestion(
        Kind.SETTING_FREQUENT,
        `context-setting-${setting.toLowerCase()}`,
        `This setting appears often: “${setting}”.`,
        'Try a new location if you want the series to feel more varied.',
      ),
    )
  }

  const unusedTargets = context.memory.vocabulary.suggestedUnused.targetWords

  if (unusedTargets.length > 0) {
    const preview = unusedTargets.slice(0, 3).join(', ')
    const suffix = unusedTargets.length > 3 ? '…' : ''

    suggestions.push(
      createSuggestion(
        Kind.TARGET_WORDS,
        'context-unused-targets',
        'Consider introducing new target words.',
        `Fresh options include: ${preview}${suffix}`,
      ),
    )
  }

  const currentTheme = context.setup.theme.trim()
  const previousThemes = new Set(
    context.memory.themes.previouslyUsed.map((theme) => theme.toLowerCase()),
  )

  if (currentTheme && previousThemes.has(currentTheme.toLowerCase())) {
    suggestions.push(
      createSuggestion(
        Kind.THEME_RECENT,
        `context-theme-${currentTheme.toLowerCase()}`,
        `This theme was used recently: “${currentTheme}”.`,
        'You can revisit it intentionally or choose a different focus.',
      ),
    )
  }

  return suggestions
}

function dedupeSuggestions(suggestions: TeacherGuidanceSuggestion[]): TeacherGuidanceSuggestion[] {
  const seen = new Set<string>()
  const deduped: TeacherGuidanceSuggestion[] = []

  for (const suggestion of suggestions) {
    if (seen.has(suggestion.id)) continue
    seen.add(suggestion.id)
    deduped.push(suggestion)
  }

  return deduped
}

/** Build calm, non-blocking teacher guidance from context and/or validation results. */
export function buildTeacherGuidance(input: BuildTeacherGuidanceInput): BuildTeacherGuidanceResult {
  const suggestions: TeacherGuidanceSuggestion[] = []

  if (input.context) {
    suggestions.push(...buildContextSuggestions(input.context))
  }

  if (input.validation) {
    for (const warning of input.validation.warnings) {
      const mapped = mapValidationWarning(warning)
      if (mapped) {
        suggestions.push(mapped)
      }
    }
  }

  const uniqueSuggestions = dedupeSuggestions(suggestions)

  return {
    suggestions: uniqueSuggestions,
    hasSuggestions: uniqueSuggestions.length > 0,
  }
}

/** Guidance from story context alone (e.g. review step before generation). */
export function buildTeacherGuidanceFromContext(
  context: StoryContext,
): BuildTeacherGuidanceResult {
  return buildTeacherGuidance({ context })
}

/** Guidance from post-generation validation warnings. */
export function buildTeacherGuidanceFromValidation(
  validation: StoryValidationResult,
  context?: StoryContext,
): BuildTeacherGuidanceResult {
  return buildTeacherGuidance({ context, validation })
}

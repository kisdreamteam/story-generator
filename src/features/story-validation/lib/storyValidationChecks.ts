import type { StoryContext } from '@/features/story-context'
import type { GeneratedStoryOutput } from '@/features/story-generator/lib/generation/types'
import { mergeMemoryLists, parseMemoryList } from '@/features/story-memory'
import {
  StoryValidationWarningCode,
  type StoryValidationWarning,
} from '../models/storyValidation.model'
import { buildStoryCorpus, extractRuleTokens, storyContainsTerm } from './buildStoryCorpus'

function createWarning(
  code: StoryValidationWarning['code'],
  message: string,
  details?: Record<string, unknown>,
): StoryValidationWarning {
  return { code, message, details }
}

export function checkRepeatedVocabulary(
  story: GeneratedStoryOutput,
  context: StoryContext,
): StoryValidationWarning[] {
  const corpus = buildStoryCorpus(story)
  const warnings: StoryValidationWarning[] = []

  for (const word of context.memory.vocabulary.previouslyUsed) {
    if (!storyContainsTerm(corpus, word)) continue

    const frequency = context.memory.vocabulary.frequency.find(
      (entry) => entry.word.toLowerCase() === word.toLowerCase(),
    )

    warnings.push(
      createWarning(
        StoryValidationWarningCode.REPEATED_VOCABULARY,
        `“${word}” was used in a previous story and appears again here.`,
        {
          word,
          previousStoryCount: frequency?.count ?? 1,
          storyIds: frequency?.storyIds ?? [],
        },
      ),
    )
  }

  return warnings
}

export function checkRepeatedLocations(
  story: GeneratedStoryOutput,
  context: StoryContext,
): StoryValidationWarning[] {
  const corpus = buildStoryCorpus(story)
  const currentLocations = mergeMemoryLists(
    parseMemoryList(context.setup.setting),
    context.seriesContinuity.recurringLocations,
  )
  const previousLocations = mergeMemoryLists(
    ...context.memory.previousStories.map((entry) => entry.locationsUsed),
  )

  const warnings: StoryValidationWarning[] = []

  for (const location of currentLocations) {
    if (!previousLocations.some((entry) => entry.toLowerCase() === location.toLowerCase())) {
      continue
    }

    if (!storyContainsTerm(corpus, location)) {
      continue
    }

    warnings.push(
      createWarning(
        StoryValidationWarningCode.REPEATED_LOCATION,
        `Location “${location}” was used in a previous story and appears again here.`,
        { location },
      ),
    )
  }

  return warnings
}

export function checkRepeatedThemes(
  _story: GeneratedStoryOutput,
  context: StoryContext,
): StoryValidationWarning[] {
  const currentThemes = mergeMemoryLists(
    parseMemoryList(context.setup.theme),
    parseMemoryList(context.setup.storyPurpose),
    parseMemoryList(context.setup.storyTone),
  )
  const previousThemes = context.memory.themes.previouslyUsed

  const warnings: StoryValidationWarning[] = []

  for (const theme of currentThemes) {
    if (!previousThemes.some((entry) => entry.toLowerCase() === theme.toLowerCase())) {
      continue
    }

    const frequency = context.memory.themes.frequency.find(
      (entry) => entry.theme.toLowerCase() === theme.toLowerCase(),
    )

    warnings.push(
      createWarning(
        StoryValidationWarningCode.REPEATED_THEME,
        `Theme “${theme}” was used in a previous story and is selected again.`,
        {
          theme,
          previousStoryCount: frequency?.count ?? 1,
          storyIds: frequency?.storyIds ?? [],
        },
      ),
    )
  }

  return warnings
}

export function checkMissingTargetWords(
  story: GeneratedStoryOutput,
  context: StoryContext,
): StoryValidationWarning[] {
  const corpus = buildStoryCorpus(story)
  const targetWords = mergeMemoryLists(
    context.setup.wordsToInclude,
    parseMemoryList(context.setup.vocabularyFocus),
  )

  const warnings: StoryValidationWarning[] = []

  for (const word of targetWords) {
    if (storyContainsTerm(corpus, word)) continue

    warnings.push(
      createWarning(
        StoryValidationWarningCode.MISSING_TARGET_WORD,
        `Target word “${word}” does not appear in the generated story.`,
        { word },
      ),
    )
  }

  return warnings
}

export function checkMissingContinuityRules(
  story: GeneratedStoryOutput,
  context: StoryContext,
): StoryValidationWarning[] {
  const corpus = buildStoryCorpus(story)
  const warnings: StoryValidationWarning[] = []

  for (const character of context.seriesContinuity.characters) {
    if (storyContainsTerm(corpus, character.name)) continue

    warnings.push(
      createWarning(
        StoryValidationWarningCode.MISSING_CONTINUITY_RULE,
        `Series character “${character.name}” does not appear in the generated story.`,
        { characterName: character.name, ruleType: 'character' },
      ),
    )
  }

  for (const note of context.seriesContinuity.appearanceNotes) {
    const tokens = extractRuleTokens(note)
    if (tokens.length === 0) continue

    const matched = tokens.some((token) => storyContainsTerm(corpus, token))
    if (matched) continue

    warnings.push(
      createWarning(
        StoryValidationWarningCode.MISSING_CONTINUITY_RULE,
        `Appearance note may not be reflected in the story: “${note}”.`,
        { rule: note, ruleType: 'appearance' },
      ),
    )
  }

  for (const rule of context.seriesContinuity.recurringRules) {
    const tokens = extractRuleTokens(rule)
    if (tokens.length === 0) continue

    const matched = tokens.some((token) => storyContainsTerm(corpus, token))
    if (matched) continue

    warnings.push(
      createWarning(
        StoryValidationWarningCode.MISSING_CONTINUITY_RULE,
        `Recurring series rule may not be reflected in the story: “${rule}”.`,
        { rule, ruleType: 'recurring' },
      ),
    )
  }

  for (const location of context.seriesContinuity.recurringLocations) {
    if (storyContainsTerm(corpus, location)) continue

    warnings.push(
      createWarning(
        StoryValidationWarningCode.MISSING_CONTINUITY_RULE,
        `Recurring location “${location}” does not appear in the generated story.`,
        { location, ruleType: 'location' },
      ),
    )
  }

  return warnings
}

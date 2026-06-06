import type {
  StoryValidationResult,
  ValidateGeneratedStoryInput,
} from '../models/storyValidation.model'
import {
  checkMissingContinuityRules,
  checkMissingTargetWords,
  checkRepeatedLocations,
  checkRepeatedThemes,
  checkRepeatedVocabulary,
} from './storyValidationChecks'

/** Run non-blocking quality checks on a generated story. Returns warnings only. */
export function validateGeneratedStory(input: ValidateGeneratedStoryInput): StoryValidationResult {
  const { story, context } = input

  const warnings = [
    ...checkRepeatedVocabulary(story, context),
    ...checkRepeatedLocations(story, context),
    ...checkRepeatedThemes(story, context),
    ...checkMissingTargetWords(story, context),
    ...checkMissingContinuityRules(story, context),
  ]

  return {
    warnings,
    warningCount: warnings.length,
    hasWarnings: warnings.length > 0,
  }
}

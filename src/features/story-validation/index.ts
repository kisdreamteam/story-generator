/**
 * Story validation — non-blocking quality warnings for generated stories.
 * Does not replace contract validation in story-generator.
 */

export {
  StoryValidationWarningCode,
  type StoryValidationResult,
  type StoryValidationWarning,
  type ValidateGeneratedStoryInput,
} from './models'
export {
  buildStoryCorpus,
  checkMissingContinuityRules,
  checkMissingTargetWords,
  checkRepeatedLocations,
  checkRepeatedThemes,
  checkRepeatedVocabulary,
  storyContainsTerm,
  validateGeneratedStory,
} from './lib'

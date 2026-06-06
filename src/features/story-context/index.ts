/**
 * Story context — pure assembly of setup, continuity, and memory for generation.
 * No provider calls or AI SDK integration.
 */

export type {
  BuildStoryContextInput,
  BuildStoryContextMemoryOptions,
  StoryContext,
  StoryContextMemory,
  StoryContextPreviousStory,
  StoryContextSeriesContinuity,
  StoryContextSetup,
  StoryContextThemeMemory,
  StoryContextVocabularyMemory,
  ThemeFrequencyEntry,
} from './models'
export {
  buildStoryContext,
  getPreviouslyUsedThemes,
  mapPreviousStories,
  normalizeStoryContextSetup,
} from './lib'

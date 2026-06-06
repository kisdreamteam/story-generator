/**
 * Story memory — persisted intelligence snapshots for generated stories.
 * Not wired to generation yet; call extract/save explicitly when ready.
 */

export type {
  BuildVocabularyCandidatePoolInput,
  StoryMemory,
  SuggestUnusedVocabularyOptions,
  SuggestUnusedVocabularyResult,
  VocabularyCandidatePool,
  VocabularyCategory,
  VocabularyFrequencyEntry,
  VocabularyTrackingOptions,
  VocabularyWordUsage,
  PreviouslyUsedVocabularyResult,
} from './models'
export {
  buildVocabularyCandidatePool,
  buildVocabularyCandidatePoolFromProject,
  buildVocabularyCandidatePoolFromSetup,
  deleteStoryMemory,
  extractStoryMemory,
  getPreviouslyUsedVocabulary,
  getVocabularyFrequency,
  loadAllStoryMemories,
  loadStoryMemory,
  mergeMemoryLists,
  parseMemoryList,
  saveStoryMemory,
  suggestUnusedVocabulary,
  STORY_MEMORY_STORAGE_KEY,
} from './lib'
export { useStoryMemories, useStoryMemory } from './hooks'

export * from './types/story-generator.types'

export {
  classifyDraftLoad,
  generatedStoryFromProject,
  getStoryProjectActionLabel,
  getStoryProjectStatusLabel,
  hasGeneratedStoryContent,
} from './lib/story-project'
export type { DraftLoadKind } from './lib/story-project'

export { loadDraftById, loadDraftWithGeneratedStory } from './lib/load-draft'
export { buildProjectWithGeneratedStory } from './lib/save-generated-story'

export {
  generateStory,
  cancelStoryGeneration,
  storyGenerationInputFromSetup,
  isGenerationAbortedError,
  type GeneratedStoryOutput,
  type StoryGenerationInput,
} from './lib/generation'

export {
  clearStoryDrafts,
  deleteStoryDraft,
  getStoryDraft,
  getStoryDrafts,
  saveStoryDraft,
  STORY_DRAFTS_STORAGE_KEY,
} from './lib/story-storage'

export { useStoryGeneratorStore } from './stores/useStoryGeneratorStore'
export { useGenerationStore, type GenerationStatus } from './stores/useGenerationStore'
export { useStoryDraft } from './hooks/useStoryDraft'
export { useStorageStatus } from './hooks/useStorageStatus'
export { useLocalStoryMigration } from './hooks/useLocalStoryMigration'
export type { LocalStoryMigrationUiState } from './hooks/useLocalStoryMigration'
export { useCreateStoryDraftLoader } from './hooks/useCreateStoryDraftLoader'
export type { CreateStoryStep } from './hooks/useCreateStoryDraftLoader'
export { useStoryGenerationFlow } from './hooks/useStoryGenerationFlow'
export {
  useActiveDraftId,
  useCreatedAt,
  useGeneratedStory,
  useSetupData,
  useStoryWorkflowActions,
} from './hooks/useStoryGeneratorSelectors'
export {
  useGenerationActions,
  useGenerationErrors,
  useGenerationProgress,
  useGenerationStatus,
  useIsGenerating,
} from './hooks/useGenerationSelectors'

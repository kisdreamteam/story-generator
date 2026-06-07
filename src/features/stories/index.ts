/**
 * Stories feature — Phase 3 scaffold.
 *
 * See docs/phase-3-stories-feature.md
 */

export * from './types'
export {
  formatStoryDate,
  getStoryStatusBadgeClasses,
  mockGeneratedStory,
  attachGeneratedStoryToProject,
  buildStorySetupReviewSections,
  cloneGeneratedStory,
  createDraftProjectFromSetup,
  deleteStoryDraft,
  getStoryDraft,
  getStoryDrafts,
  getStoryProjectActionLabel,
  getStoryProjectStatusLabel,
  generatedStoryFromProject,
  hasGeneratedStoryContent,
  mapStorySetupFormToInput,
  mapStorySetupInputToFormValues,
  getStorySetupFormDefaults,
  hasStorySetupFormErrors,
  saveStoryDraft,
  storySetupFormDefaults,
  storyPageCountOptions,
  validateFastStorySetupForm,
  STORY_SETUP_OPTIONAL_FIELD_KEYS,
  STORY_SETUP_REQUIRED_FIELD_KEYS,
  withRecalculatedWordCounts,
  areStorySetupFormValuesEqual,
  areStorySetupInputsEqual,
  assertStoryValidForSave,
  getStorySaveValidationMessages,
  isStorySaveValidationFailure,
  STORY_SAVE_VALIDATION_DEFAULTS,
  StorySaveValidationCode,
  StorySaveValidationFailure,
  validateStoryForSave,
} from './utils'
export type {
  StorySetupFormErrors,
  StorySetupFormValues,
  StorySetupReviewField,
  StorySetupReviewSection,
} from './utils'
export type {
  StorySaveValidationError,
  StorySaveValidationResult,
  ValidateStoryForSaveOptions,
} from './utils'
export { StoryCreationProgress, StoryDetailLoadGuard, StoryEditForm, StoryEmptyState, StoryFlashcards, StoryFiltersPanel, StoryFilterFields, StoryFilterSummary, StoryGenerationLoading, StoryGenerationRecovery, StoryHeader, StoryImagePrompts, StoryMetadata, StoryOutputActions, StoryPages, StoryProjectCard, StoryReadOnlyView, StorySetupForm, StorySetupReview, StoryStatusBadge, StorySuggestionsPanel } from './components'
export type { StoryCreationStep, StoryDetailField, StoryDetailSetupSection, StoryFiltersPanelProps, StoryFlashcardsProps, StoryHeaderProps, StoryImagePromptsProps, StoryMetadataProps, StoryPagesProps } from './components'
export { StoryDetailPage } from './pages'
export {
  getStoryLibrarySortDescription,
  STORY_LIBRARY_SORT_LABELS,
} from './lib/storyLibraryFilters'
export type { StoryLibrarySort } from './lib/storyLibraryFilters'
export { useStoryDetail, useCreateStoryNavigationGuard, useStoryLibraryFilters, useFilteredStoryProjects } from './hooks'
export type {
  StoryDetailLoadStatus,
  UseStoryDetailResult,
  UseStoryEditorResult,
  UseUnsavedStoryChangesResult,
  UseCreateStoryNavigationGuardOptions,
  StoryLibraryFilters,
  UseStoryLibraryFiltersResult,
  UseFilteredStoryProjectsResult,
} from './hooks'
export { useStoryEditor, useUnsavedStoryChanges } from './hooks'

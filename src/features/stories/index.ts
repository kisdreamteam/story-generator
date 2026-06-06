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
  mockStoryProject,
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
  saveStoryDraft,
  storySetupFormDefaults,
  storyPageCountOptions,
  withRecalculatedWordCounts,
} from './utils'
export type { StorySetupFormValues, StorySetupReviewField, StorySetupReviewSection } from './utils'
export { StoryCreationProgress, StoryEditForm, StoryEmptyState, StoryGenerationLoading, StoryOutputActions, StoryProjectCard, StoryReadOnlyView, StorySetupForm, StorySetupReview } from './components'
export type { StoryCreationStep } from './components'

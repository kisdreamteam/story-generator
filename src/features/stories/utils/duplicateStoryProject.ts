import type { GeneratedStory, StoryProject, StorySetupInput } from '../types'
import { attachGeneratedStoryToProject } from './attachGeneratedStoryToProject'
import { createDraftProjectFromSetup } from './createDraftProjectFromSetup'
import { cloneGeneratedStory } from './storyEdit'
import { withStoryLifecycleStatus } from './storyLifecycleStatus'

const COPY_TITLE_SUFFIX = ' (Copy)'

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function duplicateTitle(title: string): string {
  const trimmed = title.trim()
  if (!trimmed) return 'Untitled story (Copy)'
  if (trimmed.endsWith(COPY_TITLE_SUFFIX)) return trimmed
  return `${trimmed}${COPY_TITLE_SUFFIX}`
}

function buildSetupFallbackFromProject(source: StoryProject): StorySetupInput {
  return {
    storyPurpose: '',
    storyTone: '',
    theme: source.theme,
    setting: source.setting,
    vocabularyFocus: '',
    lessonGoal: source.lessonGoal,
    mainEvents: '',
    wordsToInclude: source.vocabularyWords.join(', '),
    wordsToAvoid: '',
    pageCount: source.pageCount,
    notes: source.title,
    ageRange: source.ageRange,
    language: source.language,
    characters: source.characters,
  }
}

function resolveSourceSetup(source: StoryProject): StorySetupInput {
  if (source.setup) return cloneValue(source.setup)
  if (source.planReview?.setup) return cloneValue(source.planReview.setup)
  return buildSetupFallbackFromProject(source)
}

function buildFreshPlanReview(setup: StorySetupInput): StoryProject['planReview'] {
  return {
    setup: cloneValue(setup),
  }
}

/**
 * Build a new story plan from an existing draft — setup only, no generated content.
 * Assigns a new id and timestamps; omits sync metadata and review timestamps.
 */
export function buildDuplicatedStoryPlanProject(source: StoryProject): StoryProject {
  const setup = resolveSourceSetup(source)
  const title = duplicateTitle(source.title)
  const now = new Date().toISOString()
  const base = createDraftProjectFromSetup(setup)

  return withStoryLifecycleStatus(
    {
      ...base,
      title,
      theme: source.theme,
      ageRange: source.ageRange,
      language: source.language,
      pageCount: source.pageCount,
      lessonGoal: source.lessonGoal,
      vocabularyWords: [...source.vocabularyWords],
      setting: source.setting,
      characters: source.characters,
      storyPages: [],
      flashcards: [],
      imagePrompts: [],
      setup,
      planReview: buildFreshPlanReview(setup),
      generatedStory: undefined,
      generationMetadata: undefined,
      createdAt: base.createdAt,
      updatedAt: now,
    },
    'draft',
  )
}

/**
 * Build a new story project from an existing draft and edited generated content.
 * Preserves the source story — assigns a new id, createdAt, and updatedAt on the copy.
 */
export function buildStoryProjectCopyFromEdits(
  source: StoryProject,
  editedStory: GeneratedStory,
): StoryProject {
  const now = new Date().toISOString()
  const setup = resolveSourceSetup(source)
  const title = duplicateTitle(editedStory.title || source.title)

  const clonedGenerated = cloneGeneratedStory(editedStory)
  clonedGenerated.title = title
  clonedGenerated.generatedAt = now

  const base = createDraftProjectFromSetup(setup)
  const withGenerated = attachGeneratedStoryToProject(base, clonedGenerated)

  return withStoryLifecycleStatus(
    {
      ...withGenerated,
      title,
      theme: source.theme,
      ageRange: source.ageRange,
      language: source.language,
      pageCount: clonedGenerated.storyPages.length || source.pageCount,
      lessonGoal: source.lessonGoal,
      vocabularyWords: [...source.vocabularyWords],
      setting: source.setting,
      characters: source.characters,
      storyPages: cloneValue(clonedGenerated.storyPages),
      flashcards: cloneValue(clonedGenerated.flashcards),
      imagePrompts: cloneValue(clonedGenerated.imagePrompts),
      setup,
      planReview: buildFreshPlanReview(setup),
      generatedStory: clonedGenerated,
      generationMetadata: undefined,
      version: 1,
      createdAt: base.createdAt,
      updatedAt: now,
    },
    'edited',
  )
}

/**
 * Build a new story project from an existing draft and generated content.
 * Copies setup, pages, flashcards, and illustration prompts; assigns new id and timestamps.
 */
export function buildDuplicatedStoryProject(
  source: StoryProject,
  generatedStory: GeneratedStory,
): StoryProject {
  const now = new Date().toISOString()
  const setup = resolveSourceSetup(source)
  const title = duplicateTitle(generatedStory.title || source.title)

  const clonedGenerated = cloneGeneratedStory(generatedStory)
  clonedGenerated.title = title
  clonedGenerated.generatedAt = now

  const base = createDraftProjectFromSetup(setup)
  const withGenerated = attachGeneratedStoryToProject(base, clonedGenerated)

  return withStoryLifecycleStatus(
    {
      ...withGenerated,
      title,
      theme: source.theme,
      ageRange: source.ageRange,
      language: source.language,
      pageCount: clonedGenerated.storyPages.length || source.pageCount,
      lessonGoal: source.lessonGoal,
      vocabularyWords: [...source.vocabularyWords],
      setting: source.setting,
      characters: source.characters,
      storyPages: cloneValue(clonedGenerated.storyPages),
      flashcards: cloneValue(clonedGenerated.flashcards),
      imagePrompts: cloneValue(clonedGenerated.imagePrompts),
      setup,
      planReview: buildFreshPlanReview(setup),
      generatedStory: clonedGenerated,
      generationMetadata: undefined,
      createdAt: base.createdAt,
      updatedAt: now,
    },
    'generated',
  )
}

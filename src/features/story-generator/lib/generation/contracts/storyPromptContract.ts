import type { StoryGenerationInput } from '../types'

/** Teacher intent and world-building from the setup form. */
export interface StoryPromptSetupSection {
  storyPurpose: string
  storyTone: string
  theme: string
  setting: string
  lessonGoal: string
  mainEvents: string
  characters: string
  ageRange: string
  language: string
  notes: string
}

/** Structural constraints for the generated story. */
export interface StoryPromptStructureSection {
  pageCount: number
  seriesName: string
}

/** Character and illustration continuity rules. */
export interface StoryPromptContinuitySection {
  characterNotes: string
  visualStyleNotes: string[]
}

/** Vocabulary and language-learning targets. */
export interface StoryPromptVocabularySection {
  vocabularyFocus: string
  wordsToInclude: string
  wordsToAvoid: string
}

/** Required shape and fields for provider responses. */
export interface StoryPromptOutputRequirementsSection {
  requiredPageCount: number
  includeTeachingFocusPerPage: boolean
  includeFlashcards: boolean
  includeImagePromptsPerPage: boolean
  responseFormat: 'json'
}

/**
 * Canonical prompt payload contract for any story generation provider.
 * Providers map this to their own prompt format; UI never builds provider prompts directly.
 */
export interface StoryPromptContract {
  setup: StoryPromptSetupSection
  storyStructure: StoryPromptStructureSection
  continuity: StoryPromptContinuitySection
  vocabulary: StoryPromptVocabularySection
  outputRequirements: StoryPromptOutputRequirementsSection
}

const DEFAULT_SERIES_NAME = 'Nina & Nino'

const DEFAULT_VISUAL_STYLE_NOTES = [
  'Nina (older child) in indigo; Nino (younger child) in emerald green',
  'Warm watercolor illustration style',
  'Nina and Nino are siblings, not twins',
]

/** Build a provider-agnostic prompt contract from teacher setup. */
export function buildStoryPromptContract(input: StoryGenerationInput): StoryPromptContract {
  const { setup } = input

  return {
    setup: {
      storyPurpose: setup.storyPurpose,
      storyTone: setup.storyTone,
      theme: setup.theme,
      setting: setup.setting,
      lessonGoal: setup.lessonGoal,
      mainEvents: setup.mainEvents,
      characters: setup.characters,
      ageRange: setup.ageRange,
      language: setup.language,
      notes: setup.notes,
    },
    storyStructure: {
      pageCount: setup.pageCount,
      seriesName: DEFAULT_SERIES_NAME,
    },
    continuity: {
      characterNotes: setup.characters.trim() || 'Nina (older sibling) and Nino (younger sibling)',
      visualStyleNotes: DEFAULT_VISUAL_STYLE_NOTES,
    },
    vocabulary: {
      vocabularyFocus: setup.vocabularyFocus,
      wordsToInclude: setup.wordsToInclude,
      wordsToAvoid: setup.wordsToAvoid,
    },
    outputRequirements: {
      requiredPageCount: setup.pageCount,
      includeTeachingFocusPerPage: true,
      includeFlashcards: true,
      includeImagePromptsPerPage: true,
      responseFormat: 'json',
    },
  }
}

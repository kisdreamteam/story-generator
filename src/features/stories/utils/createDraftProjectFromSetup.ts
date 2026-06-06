import type { StoryProject, StorySetupInput } from '../types'
import { parseTitleFromNotes } from './storySetupForm'

function createDraftId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `draft-${crypto.randomUUID()}`
    }
  } catch {
    // Fall through to timestamp id.
  }

  return `draft-${Date.now()}`
}

function parseVocabularyWords(wordsToInclude: string): string[] {
  return wordsToInclude
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean)
}

/** Build a StoryProject draft from teacher setup — no generated content yet. */
export function createDraftProjectFromSetup(
  setupData: StorySetupInput,
  options?: { id?: string; createdAt?: string },
): StoryProject {
  const { title } = parseTitleFromNotes(setupData.notes)
  const now = new Date().toISOString()

  return {
    id: options?.id ?? createDraftId(),
    title: title || setupData.theme || 'Untitled story',
    theme: setupData.theme,
    ageRange: setupData.ageRange,
    language: setupData.language,
    pageCount: setupData.pageCount,
    lessonGoal: setupData.lessonGoal,
    vocabularyWords: parseVocabularyWords(setupData.wordsToInclude),
    setting: setupData.setting,
    characters: setupData.characters,
    storyPages: [],
    flashcards: [],
    imagePrompts: [],
    createdAt: options?.createdAt ?? now,
    updatedAt: now,
    setup: setupData,
  }
}

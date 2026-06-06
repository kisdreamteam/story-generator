import type { StoryProject } from '@/features/stories/types'
import type { StoryMemory } from '../models'
import { mergeMemoryLists, parseMemoryList } from './parseMemoryList'

function hasGeneratedContent(project: StoryProject): boolean {
  return Boolean(project.generatedStory) || project.storyPages.length > 0
}

function resolveGeneratedAt(project: StoryProject): string | null {
  if (project.generatedStory?.generatedAt) {
    return project.generatedStory.generatedAt
  }

  if (project.storyPages.length > 0) {
    return project.updatedAt
  }

  return null
}

function extractCharactersUsed(project: StoryProject): string[] {
  const setup = project.setup
  return mergeMemoryLists(
    parseMemoryList(project.characters),
    parseMemoryList(setup?.characters),
  )
}

function extractLocationsUsed(project: StoryProject): string[] {
  const setup = project.setup
  return mergeMemoryLists(
    parseMemoryList(project.setting),
    parseMemoryList(setup?.setting),
  )
}

function extractThemesUsed(project: StoryProject): string[] {
  const setup = project.setup
  return mergeMemoryLists(
    parseMemoryList(project.theme),
    parseMemoryList(setup?.theme),
    parseMemoryList(setup?.storyPurpose),
    parseMemoryList(setup?.storyTone),
  )
}

function extractVocabularyUsed(project: StoryProject): string[] {
  const setup = project.setup
  const flashcardWords = project.flashcards.map((card) => card.word)
  const generatedFlashcardWords =
    project.generatedStory?.flashcards.map((card) => card.word) ?? []

  return mergeMemoryLists(
    project.vocabularyWords,
    flashcardWords,
    generatedFlashcardWords,
    parseMemoryList(setup?.wordsToInclude),
    parseMemoryList(setup?.vocabularyFocus),
  )
}

function resolveTitle(project: StoryProject): string {
  return project.generatedStory?.title || project.title || 'Untitled story'
}

/** Build a StoryMemory snapshot from a saved story project. Returns null when no generated content exists. */
export function extractStoryMemory(project: StoryProject): StoryMemory | null {
  if (!project.id || !hasGeneratedContent(project)) {
    return null
  }

  const generatedAt = resolveGeneratedAt(project)
  if (!generatedAt) {
    return null
  }

  return {
    storyId: project.id,
    title: resolveTitle(project),
    charactersUsed: extractCharactersUsed(project),
    locationsUsed: extractLocationsUsed(project),
    themesUsed: extractThemesUsed(project),
    vocabularyUsed: extractVocabularyUsed(project),
    generatedAt,
  }
}

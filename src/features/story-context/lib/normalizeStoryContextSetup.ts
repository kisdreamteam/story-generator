import type { StorySetupInput } from '@/features/stories/types'
import { parseMemoryList } from '@/features/story-memory'
import type { StoryContextSetup } from '../models'

/** Normalize raw teacher setup into the story context setup shape. */
export function normalizeStoryContextSetup(setup: StorySetupInput): StoryContextSetup {
  return {
    storyPurpose: setup.storyPurpose.trim(),
    storyTone: setup.storyTone.trim(),
    theme: setup.theme.trim(),
    setting: setup.setting.trim(),
    vocabularyFocus: setup.vocabularyFocus.trim(),
    lessonGoal: setup.lessonGoal.trim(),
    mainEvents: setup.mainEvents.trim(),
    wordsToInclude: parseMemoryList(setup.wordsToInclude),
    wordsToAvoid: parseMemoryList(setup.wordsToAvoid),
    pageCount: setup.pageCount,
    notes: setup.notes.trim(),
    ageRange: setup.ageRange.trim(),
    language: setup.language.trim(),
    characters: setup.characters.trim(),
  }
}

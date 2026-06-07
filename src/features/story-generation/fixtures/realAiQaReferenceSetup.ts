import type { StorySetupInput } from '@/features/stories/types'

/**
 * Standard teacher setup for manual real-AI QA runs.
 * Use the same values on local dev and Vercel so results are comparable.
 *
 * See: docs/domain-6-real-ai-qa-checklist.md
 */
export const REAL_AI_QA_REFERENCE_SETUP: StorySetupInput = {
  storyPurpose: 'Practice new vocabulary in a familiar setting',
  storyTone: 'Warm and playful',
  theme: 'Helping at home',
  setting: 'Family kitchen on a sunny morning',
  vocabularyFocus: 'Kitchen and helping words',
  lessonGoal: 'Learn words for simple kitchen actions and objects',
  mainEvents: 'Nina shows Nino how to set the table\nThey find ingredients for breakfast\nThey work together to tidy up',
  wordsToInclude: 'bowl, spoon, help, share',
  wordsToAvoid: 'scary, fight, weapon',
  pageCount: 6,
  notes: 'Keep sentences short for read-aloud in class.',
  ageRange: '4-6',
  language: 'English',
  characters: '',
}

/** Fields most likely to drift between QA runs — log these when filing issues. */
export const REAL_AI_QA_REFERENCE_SETUP_SUMMARY = {
  ageRange: REAL_AI_QA_REFERENCE_SETUP.ageRange,
  pageCount: REAL_AI_QA_REFERENCE_SETUP.pageCount,
  language: REAL_AI_QA_REFERENCE_SETUP.language,
  lessonGoal: REAL_AI_QA_REFERENCE_SETUP.lessonGoal,
} as const

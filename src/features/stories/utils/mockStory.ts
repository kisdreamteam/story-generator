import { getMockGeneratedStoryOutput } from '@/features/story-generator/lib/generation/mockStoryGenerationProvider'
import type { GeneratedStory, StoryProject } from '../types'

const CREATED_AT = '2026-06-06T10:00:00.000Z'
const UPDATED_AT = '2026-06-06T14:00:00.000Z'

/** Sample generated Nina & Nino story — field trip to a fire station (12 pages). */
export const mockGeneratedStory: GeneratedStory = getMockGeneratedStoryOutput()

/** Sample story project wrapping the mock generated story and teacher setup metadata. */
export const mockStoryProject: StoryProject = {
  id: 'story-mock-fire-station-001',
  title: mockGeneratedStory.title,
  theme: 'Field trip to a fire station',
  ageRange: '4-6',
  language: 'English',
  pageCount: 12,
  lessonGoal: 'Learn fire safety words and describe community helpers.',
  vocabularyWords: mockGeneratedStory.flashcards.map((card) => card.word),
  setting: 'City fire station and classroom',
  characters: 'Nina (older sibling), Nino (younger sibling), Ms. Lee, Firefighter Ana, classmates',
  storyPages: mockGeneratedStory.storyPages,
  flashcards: mockGeneratedStory.flashcards,
  imagePrompts: mockGeneratedStory.imagePrompts,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  setup: {
    storyPurpose: 'Field trip preparation',
    storyTone: 'Warm',
    theme: 'Field trip to a fire station',
    setting: 'City fire station and classroom',
    vocabularyFocus: 'Fire safety, community helpers, and field trip words',
    lessonGoal: 'Learn fire safety words and describe community helpers.',
    mainEvents: mockGeneratedStory.storyPages.map((page) => page.text.split('.')[0]).join('\n'),
    wordsToInclude: 'fire station, firefighter, helmet, hose, safety',
    wordsToAvoid: '',
    pageCount: 12,
    notes: 'Nina is the older child; Nino is the younger child — siblings, not twins.',
    ageRange: '4-6',
    language: 'English',
    characters: 'Nina, Nino, Ms. Lee, Firefighter Ana, classmates',
  },
  generatedStory: mockGeneratedStory,
}

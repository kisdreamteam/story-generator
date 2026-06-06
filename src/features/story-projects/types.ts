import type { StoryGenerationInput } from '../story-generation/types'

export type ProjectStatus = 'draft' | 'setup' | 'generated'

export interface StoryProject {
  id: string
  title: string
  seriesId: string
  targetLanguage: string
  ageGroup: string
  status: ProjectStatus
  updatedAt: string
}

export interface StorySetupForm {
  theme: string
  setting: string
  vocabularyFocus: string
  learningGoal: string
  pageCount: string
  notes: string
}

export interface ProjectLocationState {
  title?: string
  seriesId?: string
  targetLanguage?: string
  ageGroup?: string
  setup?: StorySetupForm
  generationInput?: StoryGenerationInput
}

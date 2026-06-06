/** Input contract for mock and future AI story generation. */
export interface StoryGenerationInput {
  projectId: string
  seriesId: string
  language: string
  ageRange: string
  theme: string
  setting: string
  vocabularyFocus: string
  learningGoal: string
  pageCount: number
  notes: string
  visualContinuityNotes: string[]
}

/** Output contract returned by generateStoryOutput. */
export interface StoryGenerationOutput {
  projectId: string
  generatedAt: string
  title: string
  summary: string
  pages: GeneratedStoryPage[]
  flashcards: GeneratedFlashcard[]
  imagePrompts: GeneratedImagePrompt[]
  totalWordCount: number
}

export interface GeneratedStoryPage {
  pageNumber: number
  text: string
  wordCount: number
  teachingFocus: string
}

export interface GeneratedFlashcard {
  word: string
  simpleDefinition: string
  exampleSentence: string
}

export interface GeneratedImagePrompt {
  pageNumber: number
  prompt: string
  continuityReminder: string
}

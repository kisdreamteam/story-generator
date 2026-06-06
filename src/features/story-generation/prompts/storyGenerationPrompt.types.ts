/** Structured sections derived from teacher setup — no provider calls. */
export interface StoryGenerationVocabularySection {
  focus: string
  wordsToInclude: string[]
  wordsToAvoid: string[]
}

export interface StoryGenerationNinaNinoContinuitySection {
  seriesName: string
  rules: string[]
  characterNotes: string
  visualStyleNotes: string[]
}

export interface StoryGenerationFlashcardRequirements {
  minCount: number
  maxCount: number
  requiredFields: readonly ['word', 'simpleDefinition', 'exampleSentence']
  rules: string[]
}

export interface StoryGenerationImagePromptRequirements {
  promptsPerPage: number
  requiredFields: readonly ['pageNumber', 'prompt', 'continuityReminder']
  rules: string[]
}

export interface StoryGenerationStructuredPrompt {
  ageRange: string
  readingLevel: string
  storyPurpose: string
  tone: string
  pageCount: number
  language: string
  lessonGoal: string
  theme: string
  setting: string
  mainEvents: string[]
  notes: string
  vocabulary: StoryGenerationVocabularySection
  ninaNinoContinuity: StoryGenerationNinaNinoContinuitySection
  flashcardRequirements: StoryGenerationFlashcardRequirements
  imagePromptRequirements: StoryGenerationImagePromptRequirements
}

/** Provider-ready prompt strings plus the structured source sections. */
export interface StoryGenerationPrompt {
  structured: StoryGenerationStructuredPrompt
  system: string
  user: string
}

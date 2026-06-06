/** Persisted intelligence snapshot for a generated story. */
export interface StoryMemory {
  storyId: string
  title: string
  charactersUsed: string[]
  locationsUsed: string[]
  themesUsed: string[]
  vocabularyUsed: string[]
  /** ISO timestamp when the story was generated. */
  generatedAt: string
}

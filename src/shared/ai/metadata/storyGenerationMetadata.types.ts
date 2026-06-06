/** Prompt text captured at generation time for audit and reproducibility. */
export interface StoryGenerationPromptSnapshot {
  system: string
  user: string
}

/** Persisted record of how a story was generated. */
export interface StoryGenerationMetadata {
  provider: string
  model: string | null
  prompt: StoryGenerationPromptSnapshot
  timestamp: string
  generationVersion: string
}

export interface BuildStoryGenerationMetadataInput {
  provider: string
  model: string | null
  prompt: StoryGenerationPromptSnapshot
  timestamp?: string
  generationVersion: string
}

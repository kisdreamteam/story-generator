/** A single generated story page in the provider response contract. */
export interface GeneratedStoryPageContract {
  pageNumber: number
  text: string
  wordCount: number
  teachingFocus: string
}

/** Vocabulary flashcard in the provider response contract. */
export interface GeneratedFlashcardContract {
  word: string
  simpleDefinition: string
  exampleSentence: string
}

/** Illustration prompt for one page in the provider response contract. */
export interface GeneratedImagePromptContract {
  pageNumber: number
  prompt: string
  continuityReminder: string
}

/** Top-level metadata for a generated story. */
export interface GeneratedStoryMetadataContract {
  title: string
  summary: string
  totalWordCount: number
  generatedAt: string
}

/**
 * Canonical response contract returned by any story generation provider.
 * Parsed AI JSON should conform to this shape before mapping to app types.
 */
export interface StoryResponseContract {
  metadata: GeneratedStoryMetadataContract
  storyPages: GeneratedStoryPageContract[]
  flashcards: GeneratedFlashcardContract[]
  imagePrompts: GeneratedImagePromptContract[]
}

/** Flat response shape — same fields without nested metadata (for raw JSON parsing). */
export interface StoryResponseContractFlat {
  title: string
  summary: string
  totalWordCount: number
  generatedAt: string
  storyPages: GeneratedStoryPageContract[]
  flashcards: GeneratedFlashcardContract[]
  imagePrompts: GeneratedImagePromptContract[]
}

/** Normalize flat or nested provider payloads into the canonical contract. */
export function normalizeStoryResponseContract(
  value: StoryResponseContract | StoryResponseContractFlat,
): StoryResponseContract {
  if ('metadata' in value && value.metadata) {
    return value
  }

  const flat = value as StoryResponseContractFlat

  return {
    metadata: {
      title: flat.title,
      summary: flat.summary,
      totalWordCount: flat.totalWordCount,
      generatedAt: flat.generatedAt,
    },
    storyPages: flat.storyPages,
    flashcards: flat.flashcards,
    imagePrompts: flat.imagePrompts,
  }
}

import type { GeneratedStory } from '../types'
import { countStoryWords } from './storyEdit'

/** Blocking validation codes — reusable by editor save and generation pipelines. */
export const StorySaveValidationCode = {
  INVALID_STORY: 'invalid_story',
  NO_PAGES: 'no_pages',
  INVALID_PAGE_COUNT: 'invalid_page_count',
  INVALID_METADATA: 'invalid_metadata',
  MISSING_PAGE_TEXT: 'missing_page_text',
  EMPTY_FLASHCARD: 'empty_flashcard',
  INVALID_FLASHCARDS: 'invalid_flashcards',
  DUPLICATE_VOCABULARY: 'duplicate_vocabulary',
  MISSING_IMAGE_PROMPT: 'missing_image_prompt',
  INVALID_IMAGE_PROMPTS: 'invalid_image_prompts',
  PAGE_TOO_LONG: 'page_too_long',
  SAVE_FAILED: 'save_failed',
} as const

export type StorySaveValidationCode =
  (typeof StorySaveValidationCode)[keyof typeof StorySaveValidationCode]

export interface StorySaveValidationError {
  code: StorySaveValidationCode
  message: string
  /** Stable locator — e.g. page-3, flashcard-1, metadata-title. */
  field?: string
  details?: Record<string, unknown>
}

export interface StorySaveValidationResult {
  errors: StorySaveValidationError[]
  errorCount: number
  isValid: boolean
}

export interface ValidateStoryForSaveOptions {
  /** Maximum words allowed on a single page (inclusive). */
  maxPageWords?: number
  /** Minimum number of story pages required. */
  minPages?: number
  /** Maximum number of story pages allowed. */
  maxPages?: number
  /** When set, page count must match this value (e.g. draft pageCount). */
  expectedPageCount?: number
  /** When true, every page must have a non-empty illustration prompt. Default true. */
  requireImagePrompts?: boolean
  /** When true, every flashcard must have a word and definition. Default true. */
  requireFlashcards?: boolean
}

export const STORY_SAVE_VALIDATION_DEFAULTS = {
  maxPageWords: 250,
  minPages: 1,
  maxPages: 100,
  requireImagePrompts: true,
  requireFlashcards: true,
} as const

export interface SafeSaveStorySuccess {
  ok: true
  project: import('../types').StoryProject
}

export interface SafeSaveStoryFailure {
  ok: false
  result: StorySaveValidationResult
  messages: string[]
  friendlySummary: string
}

export type SafeSaveStoryResult = SafeSaveStorySuccess | SafeSaveStoryFailure

function normalizeVocabularyWord(word: string): string {
  return word.trim().toLowerCase()
}

function findImagePromptForPage(story: GeneratedStory, pageNumber: number) {
  return story.imagePrompts.find((item) => item.pageNumber === pageNumber)
}

function invalidStoryError(message: string, field?: string): StorySaveValidationError {
  return {
    code: StorySaveValidationCode.INVALID_STORY,
    field,
    message,
  }
}

function checkStoryShape(story: unknown): StorySaveValidationError[] {
  if (!story || typeof story !== 'object') {
    return [invalidStoryError('Story content is missing or unreadable.')]
  }

  const candidate = story as GeneratedStory
  const errors: StorySaveValidationError[] = []

  if (!Array.isArray(candidate.storyPages)) {
    errors.push(invalidStoryError('Story pages are missing.', 'pages'))
  }

  if (!Array.isArray(candidate.flashcards)) {
    errors.push({
      code: StorySaveValidationCode.INVALID_FLASHCARDS,
      field: 'flashcards',
      message: 'Vocabulary cards are missing or invalid.',
    })
  }

  if (!Array.isArray(candidate.imagePrompts)) {
    errors.push({
      code: StorySaveValidationCode.INVALID_IMAGE_PROMPTS,
      field: 'image-prompts',
      message: 'Illustration prompts are missing or invalid.',
    })
  }

  return errors
}

function checkMetadataValid(story: GeneratedStory): StorySaveValidationError[] {
  const errors: StorySaveValidationError[] = []

  if (!story.title?.trim()) {
    errors.push({
      code: StorySaveValidationCode.INVALID_METADATA,
      field: 'metadata-title',
      message: 'Story title is required.',
    })
  }

  if (!story.generatedAt?.trim()) {
    errors.push({
      code: StorySaveValidationCode.INVALID_METADATA,
      field: 'metadata-generated-at',
      message: 'Story is missing its generation timestamp.',
    })
  } else if (Number.isNaN(Date.parse(story.generatedAt))) {
    errors.push({
      code: StorySaveValidationCode.INVALID_METADATA,
      field: 'metadata-generated-at',
      message: 'Story generation timestamp is invalid.',
    })
  }

  if (typeof story.totalWordCount !== 'number' || story.totalWordCount < 0) {
    errors.push({
      code: StorySaveValidationCode.INVALID_METADATA,
      field: 'metadata-word-count',
      message: 'Story word count is invalid.',
    })
  }

  return errors
}

function checkPagesExist(story: GeneratedStory): StorySaveValidationError[] {
  if (!Array.isArray(story.storyPages) || story.storyPages.length === 0) {
    return [
      {
        code: StorySaveValidationCode.NO_PAGES,
        field: 'pages',
        message: 'Add at least one story page before saving.',
      },
    ]
  }

  return []
}

function checkPageCountValid(
  story: GeneratedStory,
  options: {
    minPages: number
    maxPages: number
    expectedPageCount?: number
  },
): StorySaveValidationError[] {
  if (!Array.isArray(story.storyPages) || story.storyPages.length === 0) {
    return []
  }

  const errors: StorySaveValidationError[] = []
  const pageCount = story.storyPages.length

  if (pageCount < options.minPages) {
    errors.push({
      code: StorySaveValidationCode.INVALID_PAGE_COUNT,
      field: 'pages',
      message: `Story needs at least ${options.minPages} page${options.minPages === 1 ? '' : 's'}.`,
      details: { pageCount, minPages: options.minPages },
    })
  }

  if (pageCount > options.maxPages) {
    errors.push({
      code: StorySaveValidationCode.INVALID_PAGE_COUNT,
      field: 'pages',
      message: `Story cannot have more than ${options.maxPages} pages.`,
      details: { pageCount, maxPages: options.maxPages },
    })
  }

  if (
    options.expectedPageCount !== undefined &&
    pageCount !== options.expectedPageCount
  ) {
    errors.push({
      code: StorySaveValidationCode.INVALID_PAGE_COUNT,
      field: 'pages',
      message: `Story should have ${options.expectedPageCount} pages but has ${pageCount}.`,
      details: { pageCount, expectedPageCount: options.expectedPageCount },
    })
  }

  const pageNumbers = story.storyPages.map((page) => page.pageNumber)
  const uniquePageNumbers = new Set(pageNumbers)

  if (uniquePageNumbers.size !== pageNumbers.length) {
    errors.push({
      code: StorySaveValidationCode.INVALID_PAGE_COUNT,
      field: 'pages',
      message: 'Story pages must use unique page numbers.',
      details: { pageNumbers },
    })
  }

  for (const pageNumber of pageNumbers) {
    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      errors.push({
        code: StorySaveValidationCode.INVALID_PAGE_COUNT,
        field: `page-${pageNumber}`,
        message: 'Each page needs a valid page number starting from 1.',
        details: { pageNumber },
      })
    }
  }

  return errors
}

function checkMissingPageText(story: GeneratedStory): StorySaveValidationError[] {
  const errors: StorySaveValidationError[] = []

  for (const page of story.storyPages) {
    if (!page.text.trim()) {
      errors.push({
        code: StorySaveValidationCode.MISSING_PAGE_TEXT,
        field: `page-${page.pageNumber}`,
        message: `Page ${page.pageNumber} is missing story text.`,
        details: { pageNumber: page.pageNumber },
      })
    }
  }

  return errors
}

function checkExcessivelyLongPages(
  story: GeneratedStory,
  maxPageWords: number,
): StorySaveValidationError[] {
  const errors: StorySaveValidationError[] = []

  for (const page of story.storyPages) {
    const wordCount = countStoryWords(page.text)
    if (wordCount > maxPageWords) {
      errors.push({
        code: StorySaveValidationCode.PAGE_TOO_LONG,
        field: `page-${page.pageNumber}`,
        message: `Page ${page.pageNumber} is too long (${wordCount} words). Shorten to ${maxPageWords} words or fewer.`,
        details: { pageNumber: page.pageNumber, wordCount, maxPageWords },
      })
    }
  }

  return errors
}

function checkFlashcardsValid(story: GeneratedStory): StorySaveValidationError[] {
  if (!Array.isArray(story.flashcards)) {
    return []
  }

  const errors: StorySaveValidationError[] = []

  story.flashcards.forEach((card, index) => {
    if (!card || typeof card !== 'object') {
      errors.push({
        code: StorySaveValidationCode.INVALID_FLASHCARDS,
        field: `flashcard-${index}`,
        message: `Vocabulary card ${index + 1} is invalid.`,
        details: { index },
      })
      return
    }

    const word = card.word.trim()
    const definition = card.simpleDefinition.trim()

    if (!word && !definition && !card.exampleSentence.trim()) {
      errors.push({
        code: StorySaveValidationCode.EMPTY_FLASHCARD,
        field: `flashcard-${index}`,
        message: `Vocabulary card ${index + 1} is empty.`,
        details: { index },
      })
      return
    }

    if (!word || !definition) {
      errors.push({
        code: StorySaveValidationCode.EMPTY_FLASHCARD,
        field: `flashcard-${index}`,
        message: `Vocabulary card ${index + 1} needs a word and definition.`,
        details: { index, word: card.word, hasDefinition: Boolean(definition) },
      })
    }
  })

  errors.push(...checkDuplicateVocabulary(story))

  return errors
}

function checkDuplicateVocabulary(story: GeneratedStory): StorySaveValidationError[] {
  const seen = new Map<string, number[]>()

  story.flashcards.forEach((card, index) => {
    const normalized = normalizeVocabularyWord(card.word)
    if (!normalized) return

    const indices = seen.get(normalized) ?? []
    indices.push(index)
    seen.set(normalized, indices)
  })

  const errors: StorySaveValidationError[] = []

  for (const [word, indices] of seen.entries()) {
    if (indices.length < 2) continue

    errors.push({
      code: StorySaveValidationCode.DUPLICATE_VOCABULARY,
      field: `vocabulary-${word}`,
      message: `The word "${word}" appears on more than one vocabulary card.`,
      details: { word, flashcardIndices: indices },
    })
  }

  return errors
}

function checkImagePromptsValid(story: GeneratedStory): StorySaveValidationError[] {
  if (!Array.isArray(story.imagePrompts) || !Array.isArray(story.storyPages)) {
    return []
  }

  const errors: StorySaveValidationError[] = []
  const pageNumbers = new Set(story.storyPages.map((page) => page.pageNumber))

  for (const page of story.storyPages) {
    const prompt = findImagePromptForPage(story, page.pageNumber)
    const promptText = prompt?.prompt.trim() ?? ''

    if (!promptText) {
      errors.push({
        code: StorySaveValidationCode.MISSING_IMAGE_PROMPT,
        field: `image-prompt-${page.pageNumber}`,
        message: `Page ${page.pageNumber} is missing an illustration prompt.`,
        details: { pageNumber: page.pageNumber },
      })
    }
  }

  for (const prompt of story.imagePrompts) {
    if (!pageNumbers.has(prompt.pageNumber)) {
      errors.push({
        code: StorySaveValidationCode.INVALID_IMAGE_PROMPTS,
        field: `image-prompt-${prompt.pageNumber}`,
        message: `Illustration prompt for page ${prompt.pageNumber} does not match any story page.`,
        details: { pageNumber: prompt.pageNumber },
      })
    }
  }

  return errors
}

function buildValidationResult(errors: StorySaveValidationError[]): StorySaveValidationResult {
  return {
    errors,
    errorCount: errors.length,
    isValid: errors.length === 0,
  }
}

/**
 * Validate generated story content before persisting to storage.
 * Pure function — no UI or adapter dependencies. Never throws.
 */
export function validateStoryForSave(
  story: GeneratedStory | null | undefined,
  options?: ValidateStoryForSaveOptions,
): StorySaveValidationResult {
  const shapeErrors = checkStoryShape(story)
  if (shapeErrors.length > 0) {
    return buildValidationResult(shapeErrors)
  }

  const normalizedStory = story as GeneratedStory
  const maxPageWords = options?.maxPageWords ?? STORY_SAVE_VALIDATION_DEFAULTS.maxPageWords
  const minPages = options?.minPages ?? STORY_SAVE_VALIDATION_DEFAULTS.minPages
  const maxPages = options?.maxPages ?? STORY_SAVE_VALIDATION_DEFAULTS.maxPages
  const requireImagePrompts =
    options?.requireImagePrompts ?? STORY_SAVE_VALIDATION_DEFAULTS.requireImagePrompts
  const requireFlashcards =
    options?.requireFlashcards ?? STORY_SAVE_VALIDATION_DEFAULTS.requireFlashcards

  const errors: StorySaveValidationError[] = [
    ...checkMetadataValid(normalizedStory),
    ...checkPagesExist(normalizedStory),
    ...checkPageCountValid(normalizedStory, {
      minPages,
      maxPages,
      expectedPageCount: options?.expectedPageCount,
    }),
    ...checkMissingPageText(normalizedStory),
    ...checkExcessivelyLongPages(normalizedStory, maxPageWords),
    ...(requireFlashcards ? checkFlashcardsValid(normalizedStory) : []),
    ...(requireImagePrompts ? checkImagePromptsValid(normalizedStory) : []),
  ]

  return buildValidationResult(errors)
}

/** Teacher-facing messages for inline error display. */
export function getStorySaveValidationMessages(result: StorySaveValidationResult): string[] {
  return result.errors.map((error) => error.message)
}

/** Short summary for toasts and save dialogs. */
export function getStorySaveValidationSummary(result: StorySaveValidationResult): string {
  if (result.isValid) {
    return ''
  }

  if (result.errorCount === 1) {
    return result.errors[0]?.message ?? 'Fix this issue before saving.'
  }

  const preview = result.errors
    .slice(0, 2)
    .map((error) => error.message)
    .join(' ')

  return `Fix ${result.errorCount} issues before saving. ${preview}`.trim()
}

export function toSafeSaveStoryFailure(
  result: StorySaveValidationResult,
): SafeSaveStoryFailure {
  return {
    ok: false,
    result,
    messages: getStorySaveValidationMessages(result),
    friendlySummary: getStorySaveValidationSummary(result),
  }
}

/** Throws when invalid — for callers that prefer exception flow. */
export function assertStoryValidForSave(
  story: GeneratedStory,
  options?: ValidateStoryForSaveOptions,
): void {
  const result = validateStoryForSave(story, options)
  if (!result.isValid) {
    throw new StorySaveValidationFailure(result)
  }
}

/** Structured failure for save / generation integration points. */
export class StorySaveValidationFailure extends Error {
  readonly result: StorySaveValidationResult

  constructor(result: StorySaveValidationResult) {
    super(getStorySaveValidationSummary(result) || 'Story validation failed.')
    this.name = 'StorySaveValidationFailure'
    this.result = result
  }
}

export function isStorySaveValidationFailure(error: unknown): error is StorySaveValidationFailure {
  return error instanceof StorySaveValidationFailure
}

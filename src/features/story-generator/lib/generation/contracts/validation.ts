import type { StoryResponseContract, StoryResponseContractFlat } from './storyResponseContract'
import { normalizeStoryResponseContract } from './storyResponseContract'

export interface ContractValidationResult {
  isValid: boolean
  errors: string[]
}

const EMPTY_ERRORS: string[] = []

function result(errors: string[]): ContractValidationResult {
  return { isValid: errors.length === 0, errors }
}

function requireNonEmptyString(
  data: Record<string, unknown>,
  field: string,
  errors: string[],
  prefix?: string,
): void {
  const label = prefix ? `${prefix}.${field}` : field
  const value = data[field]

  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${label} must be a non-empty string`)
  }
}

function requireNumber(
  data: Record<string, unknown>,
  field: string,
  errors: string[],
  prefix?: string,
): void {
  const label = prefix ? `${prefix}.${field}` : field
  const value = data[field]

  if (typeof value !== 'number' || Number.isNaN(value)) {
    errors.push(`${label} must be a number`)
  }
}

function requirePositiveInteger(
  data: Record<string, unknown>,
  field: string,
  errors: string[],
  prefix?: string,
): void {
  const label = prefix ? `${prefix}.${field}` : field
  const value = data[field]

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    errors.push(`${label} must be a positive integer`)
  }
}

function validateStoryPagesArray(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push('storyPages must be an array')
    return
  }

  if (value.length === 0) {
    errors.push('storyPages must contain at least one page')
  }

  value.forEach((page, index) => {
    const prefix = `storyPages[${index}]`

    if (!page || typeof page !== 'object') {
      errors.push(`${prefix} must be an object`)
      return
    }

    const data = page as Record<string, unknown>
    requirePositiveInteger(data, 'pageNumber', errors, prefix)
    requireNonEmptyString(data, 'text', errors, prefix)
    requireNumber(data, 'wordCount', errors, prefix)
    requireNonEmptyString(data, 'teachingFocus', errors, prefix)
  })
}

function validateFlashcardsArray(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push('flashcards must be an array')
    return
  }

  if (value.length === 0) {
    errors.push('flashcards must contain at least one flashcard')
  }

  value.forEach((card, index) => {
    const prefix = `flashcards[${index}]`

    if (!card || typeof card !== 'object') {
      errors.push(`${prefix} must be an object`)
      return
    }

    const data = card as Record<string, unknown>
    requireNonEmptyString(data, 'word', errors, prefix)
    requireNonEmptyString(data, 'simpleDefinition', errors, prefix)
    requireNonEmptyString(data, 'exampleSentence', errors, prefix)
  })
}

function validateImagePromptsArray(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push('imagePrompts must be an array')
    return
  }

  if (value.length === 0) {
    errors.push('imagePrompts must contain at least one image prompt')
  }

  value.forEach((item, index) => {
    const prefix = `imagePrompts[${index}]`

    if (!item || typeof item !== 'object') {
      errors.push(`${prefix} must be an object`)
      return
    }

    const data = item as Record<string, unknown>
    requirePositiveInteger(data, 'pageNumber', errors, prefix)
    requireNonEmptyString(data, 'prompt', errors, prefix)
    requireNonEmptyString(data, 'continuityReminder', errors, prefix)
  })
}

function validateMetadata(value: unknown, errors: string[]): void {
  if (!value || typeof value !== 'object') {
    errors.push('metadata must be an object')
    return
  }

  const data = value as Record<string, unknown>
  requireNonEmptyString(data, 'title', errors, 'metadata')
  requireNonEmptyString(data, 'summary', errors, 'metadata')
  requireNumber(data, 'totalWordCount', errors, 'metadata')
  requireNonEmptyString(data, 'generatedAt', errors, 'metadata')
}

function validateFlatMetadataFields(data: Record<string, unknown>, errors: string[]): void {
  requireNonEmptyString(data, 'title', errors)
  requireNonEmptyString(data, 'summary', errors)
  requireNumber(data, 'totalWordCount', errors)
  requireNonEmptyString(data, 'generatedAt', errors)
}

/** Validate vocabulary flashcards from any provider response. */
export function validateFlashcards(flashcards: unknown): ContractValidationResult {
  const errors: string[] = []
  validateFlashcardsArray(flashcards, errors)
  return result(errors)
}

/** Validate illustration prompts from any provider response. */
export function validateImagePrompts(imagePrompts: unknown): ContractValidationResult {
  const errors: string[] = []
  validateImagePromptsArray(imagePrompts, errors)
  return result(errors)
}

/**
 * Validate a full generated story payload (nested metadata or flat top-level fields).
 * Reusable across mock, fixture, and future AI providers.
 */
export function validateGeneratedStory(output: unknown): ContractValidationResult {
  const errors: string[] = []

  if (!output || typeof output !== 'object') {
    return { isValid: false, errors: ['Output must be a non-null object'] }
  }

  const data = output as Record<string, unknown>

  if (data.metadata !== undefined) {
    validateMetadata(data.metadata, errors)
  } else {
    validateFlatMetadataFields(data, errors)
  }

  validateStoryPagesArray(data.storyPages, errors)

  const flashcardResult = validateFlashcards(data.flashcards)
  if (!flashcardResult.isValid) {
    errors.push(...flashcardResult.errors)
  }

  const imagePromptResult = validateImagePrompts(data.imagePrompts)
  if (!imagePromptResult.isValid) {
    errors.push(...imagePromptResult.errors)
  }

  return result(errors)
}

/** Type guard after successful validation. */
export function isValidStoryResponseContract(
  output: unknown,
): output is StoryResponseContract | StoryResponseContractFlat {
  return validateGeneratedStory(output).isValid
}

/** Map a validated contract payload to the canonical nested shape. */
export function toStoryResponseContract(
  output: StoryResponseContract | StoryResponseContractFlat,
): StoryResponseContract {
  return normalizeStoryResponseContract(output)
}

/** Convenience helper — validate and return canonical contract or null. */
export function parseStoryResponseContract(output: unknown): StoryResponseContract | null {
  if (!validateGeneratedStory(output).isValid) {
    return null
  }

  return normalizeStoryResponseContract(output as StoryResponseContract | StoryResponseContractFlat)
}

/** Shared empty validation result for callers that aggregate checks. */
export const EMPTY_CONTRACT_VALIDATION: ContractValidationResult = {
  isValid: true,
  errors: EMPTY_ERRORS,
}

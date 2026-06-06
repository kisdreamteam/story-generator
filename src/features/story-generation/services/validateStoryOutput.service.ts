import type { StoryGenerationOutput } from '../types'
import type { ValidationResult } from '../validation.types'

/** Shape validation after parse — same rules for mock, fixture, and future AI output. */
export function validateStoryOutput(output: unknown): ValidationResult {
  const errors: string[] = []

  if (!output || typeof output !== 'object') {
    return { isValid: false, errors: ['Output must be a non-null object'] }
  }

  const data = output as Record<string, unknown>

  requireNonEmptyString(data, 'projectId', errors)
  requireNonEmptyString(data, 'generatedAt', errors)
  requireNonEmptyString(data, 'title', errors)
  requireNonEmptyString(data, 'summary', errors)
  requireNumber(data, 'totalWordCount', errors)

  validatePages(data.pages, errors)
  validateFlashcards(data.flashcards, errors)
  validateImagePrompts(data.imagePrompts, errors)

  return { isValid: errors.length === 0, errors }
}

function validatePages(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push('pages must be an array')
    return
  }

  if (value.length === 0) {
    errors.push('pages must contain at least one page')
  }

  value.forEach((page, index) => validatePage(page, index, errors))
}

function validatePage(page: unknown, index: number, errors: string[]): void {
  const prefix = `pages[${index}]`

  if (!page || typeof page !== 'object') {
    errors.push(`${prefix} must be an object`)
    return
  }

  const data = page as Record<string, unknown>
  requireNumber(data, 'pageNumber', errors, prefix)
  requireNonEmptyString(data, 'text', errors, prefix)
  requireNumber(data, 'wordCount', errors, prefix)
  requireNonEmptyString(data, 'teachingFocus', errors, prefix)
}

function validateFlashcards(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push('flashcards must be an array')
    return
  }

  if (value.length === 0) {
    errors.push('flashcards must contain at least one flashcard')
  }

  value.forEach((card, index) => validateFlashcard(card, index, errors))
}

function validateFlashcard(card: unknown, index: number, errors: string[]): void {
  const prefix = `flashcards[${index}]`

  if (!card || typeof card !== 'object') {
    errors.push(`${prefix} must be an object`)
    return
  }

  const data = card as Record<string, unknown>
  requireNonEmptyString(data, 'word', errors, prefix)
  requireNonEmptyString(data, 'simpleDefinition', errors, prefix)
  requireNonEmptyString(data, 'exampleSentence', errors, prefix)
}

function validateImagePrompts(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push('imagePrompts must be an array')
    return
  }

  if (value.length === 0) {
    errors.push('imagePrompts must contain at least one image prompt')
  }

  value.forEach((item, index) => validateImagePrompt(item, index, errors))
}

function validateImagePrompt(item: unknown, index: number, errors: string[]): void {
  const prefix = `imagePrompts[${index}]`

  if (!item || typeof item !== 'object') {
    errors.push(`${prefix} must be an object`)
    return
  }

  const data = item as Record<string, unknown>
  requireNumber(data, 'pageNumber', errors, prefix)
  requireNonEmptyString(data, 'prompt', errors, prefix)
  requireNonEmptyString(data, 'continuityReminder', errors, prefix)
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

/** Type guard for parsed story output. */
export function isValidStoryOutput(output: unknown): output is StoryGenerationOutput {
  return validateStoryOutput(output).isValid
}

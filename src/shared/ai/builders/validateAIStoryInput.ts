import type { AIStoryGenerationInput, AIStoryValidationResult } from '../types'

const MIN_PAGE_COUNT = 1
const MAX_PAGE_COUNT = 24

function requireNonEmpty(value: string, field: string, errors: string[]): void {
  if (value.trim().length === 0) {
    errors.push(`${field} is required`)
  }
}

/** Provider-agnostic setup validation before generation starts. */
export function validateAIStoryInput(input: AIStoryGenerationInput): AIStoryValidationResult {
  const { setup } = input
  const errors: string[] = []

  requireNonEmpty(setup.lessonGoal, 'lessonGoal', errors)
  requireNonEmpty(setup.theme, 'theme', errors)
  requireNonEmpty(setup.setting, 'setting', errors)
  requireNonEmpty(setup.mainEvents, 'mainEvents', errors)
  requireNonEmpty(setup.ageRange, 'ageRange', errors)
  requireNonEmpty(setup.language, 'language', errors)

  if (!Number.isInteger(setup.pageCount) || setup.pageCount < MIN_PAGE_COUNT) {
    errors.push(`pageCount must be at least ${MIN_PAGE_COUNT}`)
  } else if (setup.pageCount > MAX_PAGE_COUNT) {
    errors.push(`pageCount must be at most ${MAX_PAGE_COUNT}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

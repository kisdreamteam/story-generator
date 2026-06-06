import type { GeneratedStoryOutput } from './types'
import { validateGeneratedStory, type ContractValidationResult } from './contracts/validation'

export class GeneratedStoryValidationError extends Error {
  validation: ContractValidationResult

  constructor(message: string, validation: ContractValidationResult) {
    super(message)
    this.name = 'GeneratedStoryValidationError'
    this.validation = validation
  }
}

export function isGeneratedStoryValidationError(
  error: unknown,
): error is GeneratedStoryValidationError {
  return error instanceof GeneratedStoryValidationError
}

/** Validate assembled story output against the shared response contract. */
export function validateGeneratedStoryOutput(output: GeneratedStoryOutput): ContractValidationResult {
  return validateGeneratedStory(output)
}

export function assertValidGeneratedStoryOutput(output: GeneratedStoryOutput): void {
  const validation = validateGeneratedStoryOutput(output)

  if (!validation.isValid) {
    throw new GeneratedStoryValidationError(
      `Generated story failed validation: ${validation.errors.join('; ')}`,
      validation,
    )
  }
}

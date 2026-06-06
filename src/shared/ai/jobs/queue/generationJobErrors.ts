export class GenerationJobBusyError extends Error {
  constructor(message = 'A generation job is already in progress.') {
    super(message)
    this.name = 'GenerationJobBusyError'
  }
}

export function isGenerationJobBusyError(error: unknown): error is GenerationJobBusyError {
  return error instanceof GenerationJobBusyError
}

export class GenerationJobNotFoundError extends Error {
  constructor(message = 'Generation job was not found.') {
    super(message)
    this.name = 'GenerationJobNotFoundError'
  }
}

export class GenerationJobNotRetryableError extends Error {
  constructor(message = 'Generation job cannot be retried.') {
    super(message)
    this.name = 'GenerationJobNotRetryableError'
  }
}

export class GenerationJobRetryExhaustedError extends Error {
  constructor(message = 'Generation job has no remaining retry attempts.') {
    super(message)
    this.name = 'GenerationJobRetryExhaustedError'
  }
}

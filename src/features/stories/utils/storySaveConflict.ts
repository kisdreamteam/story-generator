import type { StoryProject } from '../types'

export interface StorySaveBaseline {
  /** Last known `updatedAt` from when editing started or last successful save. */
  expectedUpdatedAt?: string
  /** Last known content revision when available. */
  expectedVersion?: number
}

/** Thrown when persisted story changed since the editor baseline — blocks in-place overwrite. */
export class StorySaveConflictError extends Error {
  readonly currentProject: StoryProject

  constructor(currentProject: StoryProject) {
    super(
      'This story was updated elsewhere. Reload to see the latest version, or save your edits as a copy.',
    )
    this.name = 'StorySaveConflictError'
    this.currentProject = currentProject
  }
}

export function isStorySaveConflictError(error: unknown): error is StorySaveConflictError {
  return error instanceof StorySaveConflictError
}

/** Returns true when the stored story no longer matches the editor baseline. */
export function hasStorySaveConflict(
  current: StoryProject,
  baseline: StorySaveBaseline,
): boolean {
  const expectedUpdatedAt = baseline.expectedUpdatedAt?.trim()
  const currentUpdatedAt = current.updatedAt?.trim()

  if (expectedUpdatedAt && currentUpdatedAt && currentUpdatedAt !== expectedUpdatedAt) {
    return true
  }

  if (
    baseline.expectedVersion !== undefined &&
    current.version !== undefined &&
    current.version !== baseline.expectedVersion
  ) {
    return true
  }

  return false
}

/** Ensures an in-place save will not clobber a newer persisted version. */
export function assertStorySaveNotStale(
  current: StoryProject,
  baseline: StorySaveBaseline,
): void {
  if (hasStorySaveConflict(current, baseline)) {
    throw new StorySaveConflictError(current)
  }
}

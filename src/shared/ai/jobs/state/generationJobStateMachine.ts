import { GenerationJobStatus, type GenerationJob, type GenerationJobFailure } from '../types/generationJob.types'

const VALID_TRANSITIONS: Record<GenerationJobStatus, readonly GenerationJobStatus[]> = {
  [GenerationJobStatus.IDLE]: [GenerationJobStatus.QUEUED],
  [GenerationJobStatus.QUEUED]: [GenerationJobStatus.RUNNING, GenerationJobStatus.FAILED],
  [GenerationJobStatus.RUNNING]: [GenerationJobStatus.COMPLETED, GenerationJobStatus.FAILED],
  [GenerationJobStatus.COMPLETED]: [GenerationJobStatus.IDLE, GenerationJobStatus.QUEUED],
  [GenerationJobStatus.FAILED]: [GenerationJobStatus.IDLE, GenerationJobStatus.QUEUED],
}

export function canTransitionGenerationJob(
  from: GenerationJobStatus,
  to: GenerationJobStatus,
): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

export function assertGenerationJobTransition(
  from: GenerationJobStatus,
  to: GenerationJobStatus,
): void {
  if (!canTransitionGenerationJob(from, to)) {
    throw new Error(`Invalid generation job transition: ${from} → ${to}`)
  }
}

export function isActiveGenerationJobStatus(status: GenerationJobStatus): boolean {
  return status === GenerationJobStatus.QUEUED || status === GenerationJobStatus.RUNNING
}

export function isTerminalGenerationJobStatus(status: GenerationJobStatus): boolean {
  return status === GenerationJobStatus.COMPLETED || status === GenerationJobStatus.FAILED
}

export function isCancellableGenerationJobStatus(status: GenerationJobStatus): boolean {
  return isActiveGenerationJobStatus(status)
}

export function isRetryableGenerationJob(job: GenerationJob<unknown, unknown>): boolean {
  return (
    job.status === GenerationJobStatus.FAILED &&
    !job.failure?.cancelled &&
    job.attempt < job.maxAttempts
  )
}

export function transitionGenerationJob<TInput, TOutput>(
  job: GenerationJob<TInput, TOutput>,
  to: GenerationJobStatus,
  patch: Partial<GenerationJob<TInput, TOutput>> = {},
): GenerationJob<TInput, TOutput> {
  assertGenerationJobTransition(job.status, to)

  const now = new Date().toISOString()

  return {
    ...job,
    ...patch,
    status: to,
    queuedAt: to === GenerationJobStatus.QUEUED ? patch.queuedAt ?? now : job.queuedAt,
    startedAt: to === GenerationJobStatus.RUNNING ? patch.startedAt ?? now : job.startedAt,
    completedAt:
      to === GenerationJobStatus.COMPLETED || to === GenerationJobStatus.FAILED
        ? patch.completedAt ?? now
        : job.completedAt,
  }
}

export function createGenerationJob<TInput, TOutput>(
  input: TInput,
  inputKey: string,
  maxAttempts: number,
): GenerationJob<TInput, TOutput> {
  return {
    id: crypto.randomUUID(),
    status: GenerationJobStatus.IDLE,
    input,
    inputKey,
    attempt: 1,
    maxAttempts,
    createdAt: new Date().toISOString(),
  }
}

export function markGenerationJobFailed<TInput, TOutput>(
  job: GenerationJob<TInput, TOutput>,
  failure: GenerationJobFailure,
): GenerationJob<TInput, TOutput> {
  return transitionGenerationJob(job, GenerationJobStatus.FAILED, {
    failure,
    output: undefined,
  })
}

export function markGenerationJobCompleted<TInput, TOutput>(
  job: GenerationJob<TInput, TOutput>,
  output: TOutput,
): GenerationJob<TInput, TOutput> {
  return transitionGenerationJob(job, GenerationJobStatus.COMPLETED, {
    output,
    failure: undefined,
  })
}

export function prepareGenerationJobRetry<TInput, TOutput>(
  job: GenerationJob<TInput, TOutput>,
): GenerationJob<TInput, TOutput> {
  if (!isRetryableGenerationJob(job)) {
    throw new Error('Generation job cannot be retried.')
  }

  return transitionGenerationJob(job, GenerationJobStatus.QUEUED, {
    attempt: job.attempt + 1,
    failure: undefined,
    output: undefined,
    startedAt: undefined,
    completedAt: undefined,
  })
}

export function resolveGenerationQueueStatus<TInput, TOutput>(
  activeJob: GenerationJob<TInput, TOutput> | null,
  lastJob: GenerationJob<TInput, TOutput> | null,
): GenerationJobStatus {
  if (activeJob) {
    return activeJob.status
  }

  if (lastJob && isTerminalGenerationJobStatus(lastJob.status)) {
    return lastJob.status
  }

  return GenerationJobStatus.IDLE
}

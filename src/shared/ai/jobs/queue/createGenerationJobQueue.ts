import {
  createGenerationJob,
  isActiveGenerationJobStatus,
  isCancellableGenerationJobStatus,
  isRetryableGenerationJob,
  markGenerationJobCompleted,
  markGenerationJobFailed,
  prepareGenerationJobRetry,
  resolveGenerationQueueStatus,
  transitionGenerationJob,
} from '../state'
import {
  GenerationJobStatus,
  type CreateGenerationJobQueueOptions,
  type EnqueueGenerationJobOptions,
  type GenerationJob,
  type GenerationJobQueue,
  type GenerationJobQueueSnapshot,
  type GenerationJobRunner,
} from '../types/generationJob.types'
import {
  GenerationJobBusyError,
  GenerationJobNotFoundError,
  GenerationJobNotRetryableError,
} from './generationJobErrors'

interface ActiveJobRecord<TInput, TOutput> {
  job: GenerationJob<TInput, TOutput>
  abortController: AbortController
  promise: Promise<TOutput>
}

const DEFAULT_MAX_ATTEMPTS = 3

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Generation failed.'
}

/** Create a single-slot frontend generation queue with retry and cancel support. */
export function createGenerationJobQueue<TInput, TOutput>(
  options: CreateGenerationJobQueueOptions = {},
): GenerationJobQueue<TInput, TOutput> {
  const defaultMaxAttempts = options.defaultMaxAttempts ?? DEFAULT_MAX_ATTEMPTS

  let activeRecord: ActiveJobRecord<TInput, TOutput> | null = null
  let lastJob: GenerationJob<TInput, TOutput> | null = null
  let lastRunner: GenerationJobRunner<TInput, TOutput> | null = null

  function getSnapshot(): GenerationJobQueueSnapshot<TInput, TOutput> {
    return {
      status: resolveGenerationQueueStatus(activeRecord?.job ?? null, lastJob),
      activeJob: activeRecord?.job ?? null,
      lastJob,
    }
  }

  function findJob(jobId?: string): GenerationJob<TInput, TOutput> | null {
    if (jobId) {
      if (activeRecord?.job.id === jobId) return activeRecord.job
      if (lastJob?.id === jobId) return lastJob
      return null
    }

    return lastJob
  }

  function clearActiveIfJob(jobId: string): void {
    if (activeRecord?.job.id === jobId) {
      activeRecord = null
    }
  }

  function cancelActive(jobId: string): boolean {
    if (!activeRecord || activeRecord.job.id !== jobId) {
      return false
    }

    if (!isCancellableGenerationJobStatus(activeRecord.job.status)) {
      return false
    }

    if (!activeRecord.abortController.signal.aborted) {
      activeRecord.abortController.abort('cancelled')
    }

    lastJob = markGenerationJobFailed(activeRecord.job, {
      message: 'Generation job was cancelled.',
      cancelled: true,
    })
    activeRecord = null
    return true
  }

  async function runJob(
    job: GenerationJob<TInput, TOutput>,
    runner: GenerationJobRunner<TInput, TOutput>,
  ): Promise<TOutput> {
    lastRunner = runner

    const abortController = new AbortController()
    const runningJob = transitionGenerationJob(job, GenerationJobStatus.RUNNING)

    const promise = runner(runningJob.input, abortController.signal, runningJob)
      .then((output) => {
        if (abortController.signal.aborted) {
          throw new Error('Generation job was cancelled.')
        }

        lastJob = markGenerationJobCompleted(runningJob, output)
        return output
      })
      .catch((error) => {
        if (activeRecord?.job.id !== runningJob.id) {
          throw error
        }

        const cancelled = abortController.signal.aborted
        lastJob = markGenerationJobFailed(runningJob, {
          message: cancelled ? 'Generation job was cancelled.' : errorMessage(error),
          cancelled,
        })
        throw error
      })
      .finally(() => {
        clearActiveIfJob(runningJob.id)
      })

    activeRecord = {
      job: runningJob,
      abortController,
      promise,
    }

    return promise
  }

  async function enqueue(
    input: TInput,
    inputKey: string,
    run: GenerationJobRunner<TInput, TOutput>,
    enqueueOptions: EnqueueGenerationJobOptions = {},
  ): Promise<TOutput> {
    const maxAttempts = enqueueOptions.maxAttempts ?? defaultMaxAttempts

    if (activeRecord) {
      const { job, promise } = activeRecord

      if (job.inputKey === inputKey && isActiveGenerationJobStatus(job.status) && !enqueueOptions.replace) {
        return promise
      }

      if (!enqueueOptions.replace) {
        throw new GenerationJobBusyError()
      }

      cancelActive(job.id)
    }

    const job = transitionGenerationJob(
      createGenerationJob<TInput, TOutput>(input, inputKey, maxAttempts),
      GenerationJobStatus.QUEUED,
    )

    return runJob(job, run)
  }

  function cancel(jobId?: string): boolean {
    const targetId = jobId ?? activeRecord?.job.id
    if (!targetId) return false
    return cancelActive(targetId)
  }

  async function retry(jobId?: string): Promise<TOutput> {
    const sourceJob = findJob(jobId)

    if (!sourceJob) {
      throw new GenerationJobNotFoundError()
    }

    if (!isRetryableGenerationJob(sourceJob)) {
      throw new GenerationJobNotRetryableError()
    }

    if (activeRecord && isActiveGenerationJobStatus(activeRecord.job.status)) {
      throw new GenerationJobBusyError()
    }

    if (!lastRunner) {
      throw new GenerationJobNotRetryableError(
        'Cannot retry generation job because the original runner is unavailable.',
      )
    }

    const retriedJob = prepareGenerationJobRetry(sourceJob)
    lastJob = retriedJob

    return runJob(retriedJob, lastRunner)
  }

  return {
    enqueue,
    cancel,
    retry,
    getSnapshot,
    getActiveJob: () => activeRecord?.job ?? null,
    getLastJob: () => lastJob,
    getStatus: () => getSnapshot().status,
    isActive: () => activeRecord !== null,
    clear: () => {
      activeRecord = null
      lastJob = null
      lastRunner = null
    },
  }
}

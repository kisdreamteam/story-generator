/** Lifecycle states for a frontend generation job. */
export const GenerationJobStatus = {
  IDLE: 'idle',
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export type GenerationJobStatus = (typeof GenerationJobStatus)[keyof typeof GenerationJobStatus]

export interface GenerationJobFailure {
  message: string
  /** True when the job was stopped via cancel rather than a provider error. */
  cancelled?: boolean
}

/** Tracks one long-running generation attempt on the client. */
export interface GenerationJob<TInput = unknown, TOutput = unknown> {
  id: string
  status: GenerationJobStatus
  input: TInput
  inputKey: string
  output?: TOutput
  failure?: GenerationJobFailure
  attempt: number
  maxAttempts: number
  createdAt: string
  queuedAt?: string
  startedAt?: string
  completedAt?: string
}

export type GenerationJobRunner<TInput, TOutput> = (
  input: TInput,
  signal: AbortSignal,
  job: GenerationJob<TInput, TOutput>,
) => Promise<TOutput>

export interface EnqueueGenerationJobOptions {
  /** Cancel the in-flight job and start this one. */
  replace?: boolean
  maxAttempts?: number
}

export interface GenerationJobQueueSnapshot<TInput = unknown, TOutput = unknown> {
  status: GenerationJobStatus
  activeJob: GenerationJob<TInput, TOutput> | null
  lastJob: GenerationJob<TInput, TOutput> | null
}

export interface GenerationJobQueue<TInput, TOutput> {
  enqueue(
    input: TInput,
    inputKey: string,
    run: GenerationJobRunner<TInput, TOutput>,
    options?: EnqueueGenerationJobOptions,
  ): Promise<TOutput>
  cancel(jobId?: string): boolean
  retry(jobId?: string): Promise<TOutput>
  getSnapshot(): GenerationJobQueueSnapshot<TInput, TOutput>
  getActiveJob(): GenerationJob<TInput, TOutput> | null
  getLastJob(): GenerationJob<TInput, TOutput> | null
  getStatus(): GenerationJobStatus
  isActive(): boolean
  clear(): void
}

export interface CreateGenerationJobQueueOptions {
  defaultMaxAttempts?: number
}

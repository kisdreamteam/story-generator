/** Classified failure modes for frontend generation recovery. */
export const GenerationFailureKind = {
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
  PROVIDER: 'provider',
  VALIDATION: 'validation',
  BUSY: 'busy',
  LIMIT: 'limit',
  NETWORK: 'network',
  UNKNOWN: 'unknown',
} as const

export type GenerationFailureKind = (typeof GenerationFailureKind)[keyof typeof GenerationFailureKind]

export interface GenerationFailureInfo {
  kind: GenerationFailureKind
  message: string
  retryable: boolean
  hasPartialContent: boolean
}

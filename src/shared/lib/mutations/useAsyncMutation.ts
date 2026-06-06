import { useCallback, useRef, useState } from 'react'

export interface RunMutationOptions<T> {
  optimistic?: () => void
  rollback?: () => void
  onSuccess?: (result: T) => void | Promise<void>
  onError?: (error: unknown) => void
  onSettled?: () => void
}

export interface UseAsyncMutationResult {
  isPending: boolean
  run: <T>(fn: () => Promise<T>, options?: RunMutationOptions<T>) => Promise<T | undefined>
}

/**
 * Serializes async mutations — blocks duplicate submissions until the current run settles.
 * Supports optional optimistic apply + rollback on failure.
 */
export function useAsyncMutation(): UseAsyncMutationResult {
  const [isPending, setIsPending] = useState(false)
  const inFlightRef = useRef(false)

  const run = useCallback(
    async <T,>(fn: () => Promise<T>, options?: RunMutationOptions<T>): Promise<T | undefined> => {
      if (inFlightRef.current) {
        return undefined
      }

      inFlightRef.current = true
      setIsPending(true)
      options?.optimistic?.()

      try {
        const result = await fn()
        await options?.onSuccess?.(result)
        return result
      } catch (error) {
        options?.rollback?.()
        options?.onError?.(error)
        return undefined
      } finally {
        inFlightRef.current = false
        setIsPending(false)
        options?.onSettled?.()
      }
    },
    [],
  )

  return { isPending, run }
}

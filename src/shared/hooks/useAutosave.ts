import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_AUTOSAVE_DEBOUNCE_MS,
  type SaveStatus,
} from '@/shared/lib/autosave/saveStatus'

export interface UseAutosaveOptions<T> {
  /** Current value to persist when dirty. */
  value: T | null | undefined
  isDirty: boolean
  /** Bumps when the editable value changes — resets debounce scheduling. */
  revision?: number
  enabled?: boolean
  debounceMs?: number
  /** When this changes, the last-persisted snapshot is cleared (e.g. new draft id). */
  resetKey?: string
  isEqual?: (left: T, right: T) => boolean
  clone?: (value: T) => T
  /** Persist via storage adapter — must not mutate local editor state. */
  onSave: (value: T) => Promise<void>
  onPersisted?: (value: T) => void
  onError?: (error: unknown) => void
}

export interface UseAutosaveResult {
  status: SaveStatus
  isSaving: boolean
  /** Persist immediately — skips debounce. Returns true when storage matches the latest value. */
  flushSave: () => Promise<boolean>
  /** Cancel a scheduled autosave (e.g. before navigation). */
  cancelScheduledSave: () => void
}

/**
 * Debounced autosave after inactivity. Serializes writes and skips duplicate persists
 * when the value matches the last successful save.
 */
export function useAutosave<T>({
  value,
  isDirty,
  revision = 0,
  enabled = true,
  debounceMs = DEFAULT_AUTOSAVE_DEBOUNCE_MS,
  resetKey,
  isEqual = Object.is,
  clone = (current) => current,
  onSave,
  onPersisted,
  onError,
}: UseAutosaveOptions<T>): UseAutosaveResult {
  const [status, setStatus] = useState<SaveStatus>('idle')

  const valueRef = useRef(value)
  const revisionRef = useRef(revision)
  const lastPersistedRef = useRef<T | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlightRef = useRef(false)
  const saveChainRef = useRef<Promise<boolean>>(Promise.resolve(true))

  valueRef.current = value
  revisionRef.current = revision

  useEffect(() => {
    lastPersistedRef.current = null
    saveChainRef.current = Promise.resolve(true)
  }, [resetKey])

  useEffect(() => {
    if (!enabled || value == null) {
      lastPersistedRef.current = null
      setStatus('idle')
      return
    }

    if (!lastPersistedRef.current) {
      lastPersistedRef.current = clone(value)
    }
  }, [enabled, value, clone])

  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  const runPersist = useCallback(async (): Promise<boolean> => {
    if (!enabled || valueRef.current == null) {
      return true
    }

    const current = valueRef.current

    if (lastPersistedRef.current && isEqual(current, lastPersistedRef.current)) {
      setStatus('idle')
      return true
    }

    inFlightRef.current = true
    setStatus('saving')

    try {
      await onSave(current)
      lastPersistedRef.current = clone(current)
      onPersisted?.(current)

      const stillDirty =
        valueRef.current != null &&
        lastPersistedRef.current != null &&
        !isEqual(valueRef.current, lastPersistedRef.current)

      setStatus(stillDirty ? 'pending' : 'saved')
      return !stillDirty
    } catch (error) {
      onError?.(error)
      setStatus('error')
      return false
    } finally {
      inFlightRef.current = false
    }
  }, [enabled, clone, isEqual, onSave, onPersisted, onError])

  const enqueueSave = useCallback(() => {
    saveChainRef.current = saveChainRef.current.then(async () => {
      const result = await runPersist()

      if (
        valueRef.current != null &&
        lastPersistedRef.current != null &&
        !isEqual(valueRef.current, lastPersistedRef.current)
      ) {
        return runPersist()
      }

      return result
    })

    return saveChainRef.current
  }, [isEqual, runPersist])

  const flushSave = useCallback(async (): Promise<boolean> => {
    clearDebounce()
    return enqueueSave()
  }, [clearDebounce, enqueueSave])

  const cancelScheduledSave = useCallback(() => {
    clearDebounce()
  }, [clearDebounce])

  useEffect(() => {
    if (!enabled || value == null) {
      clearDebounce()
      return
    }

    if (!isDirty) {
      clearDebounce()
      if (!inFlightRef.current) {
        setStatus((current) => {
          if (current === 'error') return current
          return lastPersistedRef.current ? 'saved' : 'idle'
        })
      }
      return
    }

    setStatus((current) => (current === 'saving' ? 'saving' : 'pending'))
    clearDebounce()

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
      void enqueueSave()
    }, debounceMs)

    return clearDebounce
  }, [enabled, value, isDirty, revision, debounceMs, clearDebounce, enqueueSave])

  useEffect(() => () => clearDebounce(), [clearDebounce])

  return {
    status,
    isSaving: status === 'saving',
    flushSave,
    cancelScheduledSave,
  }
}

import { useEffect, useMemo } from 'react'
import { useStorageStatus } from '@/features/story-generator/hooks/useStorageStatus'
import { flushCloudSyncQueue } from '@/shared/lib/connection/cloudSyncQueue'
import { checkSupabaseConnection } from '@/shared/lib/supabase/checkSupabaseConnection'
import {
  useConnectionStore,
  type ConnectionPhase,
} from '@/shared/stores/connectionStore'

export type ConnectionStatus = ConnectionPhase

export interface ConnectionStatusState {
  status: ConnectionStatus
  isOnline: boolean
  isOffline: boolean
  isReconnecting: boolean
  /** Teacher expects cloud persistence (signed in + Supabase enabled). */
  cloudExpected: boolean
  /** null when cloud is not in use. */
  cloudAvailable: boolean | null
  cloudUnavailable: boolean
  isSyncing: boolean
  pendingSyncCount: number
  offlineMessage: string
  cloudUnavailableMessage: string
  syncingMessage: string
}

const OFFLINE_MESSAGE =
  'You are offline. Your stories stay saved in this browser until you are back online.'

const CLOUD_UNAVAILABLE_MESSAGE =
  'Your account is temporarily unavailable. Stories still save here in this browser and will sync when cloud access returns.'

export function useConnectionStatus(): ConnectionStatusState {
  const storage = useStorageStatus()
  const browserOnline = useConnectionStore((state) => state.browserOnline)
  const phase = useConnectionStore((state) => state.phase)
  const cloudReachable = useConnectionStore((state) => state.cloudReachable)
  const pendingSyncCount = useConnectionStore((state) => state.pendingCloudOps)
  const isSyncing = useConnectionStore((state) => state.isSyncing)
  const setBrowserOnline = useConnectionStore((state) => state.setBrowserOnline)
  const setPhase = useConnectionStore((state) => state.setPhase)
  const setCloudReachable = useConnectionStore((state) => state.setCloudReachable)

  const cloudExpected = storage.adapter === 'supabase' && storage.cloudEnabled

  useEffect(() => {
    if (!cloudExpected) {
      setCloudReachable(null)
      return
    }

    if (!browserOnline) {
      setCloudReachable(false)
    }
  }, [browserOnline, cloudExpected, setCloudReachable])

  useEffect(() => {
    function handleOnline() {
      setBrowserOnline(true)
      setPhase('reconnecting')
    }

    function handleOffline() {
      setBrowserOnline(false)
      setPhase('offline')
      if (cloudExpected) {
        setCloudReachable(false)
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setBrowserOnline(navigator.onLine)
    setPhase(navigator.onLine ? 'online' : 'offline')

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [cloudExpected, setBrowserOnline, setCloudReachable, setPhase])

  useEffect(() => {
    if (phase !== 'reconnecting') return

    let cancelled = false

    void (async () => {
      if (!cloudExpected) {
        if (!cancelled) setPhase('online')
        return
      }

      const result = await checkSupabaseConnection()

      if (cancelled) return

      const reachable = result.ok
      setCloudReachable(reachable)

      if (reachable) {
        await flushCloudSyncQueue()
      }

      if (!cancelled) {
        setPhase('online')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [phase, cloudExpected, setCloudReachable, setPhase])

  return useMemo(() => {
    const isOffline = phase === 'offline'
    const isReconnecting = phase === 'reconnecting'
    const cloudAvailable = cloudExpected ? cloudReachable : null
    const cloudUnavailable = cloudExpected && cloudReachable === false && !isOffline

    const syncingMessage =
      pendingSyncCount > 0
        ? `Syncing ${pendingSyncCount} saved ${pendingSyncCount === 1 ? 'change' : 'changes'} to your account…`
        : isReconnecting
          ? 'Reconnecting to your account…'
          : 'Syncing to your account…'

    return {
      status: phase,
      isOnline: !isOffline,
      isOffline,
      isReconnecting,
      cloudExpected,
      cloudAvailable,
      cloudUnavailable,
      isSyncing: isSyncing || isReconnecting,
      pendingSyncCount,
      offlineMessage: OFFLINE_MESSAGE,
      cloudUnavailableMessage: CLOUD_UNAVAILABLE_MESSAGE,
      syncingMessage,
    }
  }, [
    phase,
    cloudExpected,
    cloudReachable,
    isSyncing,
    pendingSyncCount,
  ])
}

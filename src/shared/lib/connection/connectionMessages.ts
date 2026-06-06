export type ConnectionStatus = 'online' | 'offline' | 'reconnecting'

export interface ConnectionStatusSnapshot {
  status: ConnectionStatus
  isOnline: boolean
  isOffline: boolean
  isReconnecting: boolean
  /** Teacher expects cloud saves (signed in + cloud enabled). */
  cloudExpected: boolean
  /** False when cloud is expected but unreachable. null when cloud is not in use. */
  cloudAvailable: boolean | null
  cloudUnavailable: boolean
  isSyncing: boolean
  pendingSyncCount: number
  offlineMessage: string
  cloudUnavailableMessage: string
  syncingMessage: string
}

export const OFFLINE_BANNER_MESSAGE =
  'You are offline. You can keep working — stories save in this browser until you are back online.'

export const CLOUD_UNAVAILABLE_MESSAGE =
  'Your account is temporarily unavailable. Stories still save here in this browser and will sync when cloud access returns.'

export const RECONNECTING_MESSAGE = 'Back online — checking your account and syncing saved work…'

export const SYNCING_MESSAGE = 'Syncing saved work to your account…'

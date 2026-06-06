import { create } from 'zustand'

export type ConnectionPhase = 'online' | 'offline' | 'reconnecting'

interface ConnectionStore {
  browserOnline: boolean
  phase: ConnectionPhase
  /** null when cloud sync is not expected for this session. */
  cloudReachable: boolean | null
  pendingCloudOps: number
  isSyncing: boolean
  setBrowserOnline: (online: boolean) => void
  setPhase: (phase: ConnectionPhase) => void
  setCloudReachable: (reachable: boolean | null) => void
  incrementPending: () => void
  decrementPending: () => void
  setSyncing: (syncing: boolean) => void
}

const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

export const useConnectionStore = create<ConnectionStore>((set) => ({
  browserOnline: initialOnline,
  phase: initialOnline ? 'online' : 'offline',
  cloudReachable: null,
  pendingCloudOps: 0,
  isSyncing: false,

  setBrowserOnline: (online) => set({ browserOnline: online }),

  setPhase: (phase) => set({ phase }),

  setCloudReachable: (cloudReachable) => set({ cloudReachable }),

  incrementPending: () =>
    set((state) => ({ pendingCloudOps: state.pendingCloudOps + 1 })),

  decrementPending: () =>
    set((state) => ({ pendingCloudOps: Math.max(0, state.pendingCloudOps - 1) })),

  setSyncing: (isSyncing) => set({ isSyncing }),
}))

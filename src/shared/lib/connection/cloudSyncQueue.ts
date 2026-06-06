import { useConnectionStore } from '@/shared/stores/connectionStore'
import { productAnalytics } from '@/shared/lib/analytics'

interface CloudSyncOperation {
  id: string
  label: string
  run: () => Promise<void>
}

const queue: CloudSyncOperation[] = []
let flushInFlight = false

export function enqueueCloudSync(label: string, run: () => Promise<void>): string {
  const id = crypto.randomUUID()
  queue.push({ id, label, run })
  useConnectionStore.getState().incrementPending()
  return id
}

export function getCloudSyncQueueLength(): number {
  return queue.length
}

/** Retry queued cloud writes — stops on the first failure so ops can run again later. */
export async function flushCloudSyncQueue(): Promise<void> {
  if (flushInFlight || queue.length === 0) return

  flushInFlight = true
  useConnectionStore.getState().setSyncing(true)

  try {
    while (queue.length > 0) {
      const operation = queue[0]

      try {
        await operation.run()
        queue.shift()
        useConnectionStore.getState().decrementPending()
        productAnalytics.cloudSync({
          label: operation.label,
          outcome: 'success',
          destination: 'cloud',
        })
      } catch {
        break
      }
    }
  } finally {
    flushInFlight = false
    useConnectionStore.getState().setSyncing(false)
  }
}

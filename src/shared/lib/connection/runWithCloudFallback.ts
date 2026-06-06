import { enqueueCloudSync } from '@/shared/lib/connection/cloudSyncQueue'
import { isNetworkRelatedError } from '@/shared/lib/connection/isNetworkError'
import { productAnalytics } from '@/shared/lib/analytics'
import { useConnectionStore } from '@/shared/stores/connectionStore'

interface CloudFallbackOptions<T> {
  label: string
  cloud: () => Promise<T>
  local: () => Promise<T>
  retryCloud: () => Promise<T>
}

/**
 * Try cloud persistence first. On network failure, persist locally and queue a cloud retry.
 * Does not block the teacher — local storage remains the fallback.
 */
export async function runWithCloudFallback<T>({
  label,
  cloud,
  local,
  retryCloud,
}: CloudFallbackOptions<T>): Promise<T> {
  const { browserOnline } = useConnectionStore.getState()

  if (!browserOnline) {
    const saved = await local()
    enqueueCloudSync(label, async () => {
      await retryCloud()
    })
    useConnectionStore.getState().setCloudReachable(false)
    productAnalytics.cloudSync({ label, outcome: 'queued', destination: 'local' })
    return saved
  }

  try {
    const saved = await cloud()
    useConnectionStore.getState().setCloudReachable(true)
    productAnalytics.cloudSync({ label, outcome: 'success', destination: 'cloud' })
    return saved
  } catch (error) {
    if (!isNetworkRelatedError(error)) {
      throw error
    }

    const saved = await local()
    enqueueCloudSync(label, async () => {
      await retryCloud()
    })
    useConnectionStore.getState().setCloudReachable(false)
    productAnalytics.cloudSync({ label, outcome: 'queued', destination: 'local' })
    return saved
  }
}

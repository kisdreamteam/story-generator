import { LoadingStoryPage } from '@/shared/components/loading'
import { routeChunkLoadingCopy } from '@/shared/components/loading/presets'

/**
 * Shown while a lazy-loaded route chunk is downloading.
 * Route splitting keeps the first paint smaller — this appears only on navigation.
 */
export function RouteChunkLoading() {
  return (
    <LoadingStoryPage
      variant="default"
      title={routeChunkLoadingCopy.title}
      description={routeChunkLoadingCopy.description}
      statusLabel={routeChunkLoadingCopy.statusLabel}
    />
  )
}

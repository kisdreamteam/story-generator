import { CloudSyncIndicator } from './CloudSyncIndicator'
import { CloudUnavailableNotice } from './CloudUnavailableNotice'
import { OfflineBanner } from './OfflineBanner'

/** Non-blocking connection awareness — offline, sync, and cloud warnings. */
export function ConnectionAwarenessBar() {
  return (
    <div className="sticky top-0 z-40">
      <OfflineBanner />
      <CloudSyncIndicator />
      <CloudUnavailableNotice />
    </div>
  )
}

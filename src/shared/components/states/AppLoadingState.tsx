import { LoadingCard } from '../loading/LoadingCard'
import { LoadingDashboard } from '../loading/LoadingDashboard'
import { LoadingStoryPage } from '../loading/LoadingStoryPage'
import { migrationLoadingCopy } from '../loading/presets'

export type AppLoadingStateKind =
  | 'story-library'
  | 'story-detail'
  | 'story-draft'
  | 'story-generation'
  | 'migration'
  | 'classroom-library'
  | 'classroom-detail'

export interface AppLoadingStateProps {
  kind: AppLoadingStateKind
  className?: string
}

/** Preset loading shells for dashboard, detail, and migration flows. */
export function AppLoadingState({ kind, className = '' }: AppLoadingStateProps) {
  switch (kind) {
    case 'story-library':
      return <LoadingDashboard showHeader={false} className={className} />

    case 'migration':
      return (
        <LoadingCard
          variant="compact"
          showAction={false}
          title={migrationLoadingCopy.title}
          description={migrationLoadingCopy.description}
          ariaLabel={migrationLoadingCopy.statusLabel}
          className={['border-amber-100 bg-amber-50/30', className].filter(Boolean).join(' ')}
        />
      )

    case 'story-detail':
      return <LoadingStoryPage variant="detail" showHeader={false} className={className} />

    case 'story-draft':
      return <LoadingStoryPage variant="draft" className={className} />

    case 'story-generation':
      return <LoadingStoryPage variant="generation" className={className} />

    case 'classroom-library':
      return <LoadingDashboard showHeader={false} className={className} />

    case 'classroom-detail':
      return <LoadingStoryPage variant="detail" showHeader={false} className={className} />
  }
}

import { LoadingGrid } from './LoadingGrid'
import { LoadingText } from './LoadingText'
import { dashboardLoadingCopy } from './presets'

export interface LoadingDashboardProps {
  title?: string
  description?: string
  statusLabel?: string
  showHeader?: boolean
  sectionCount?: number
  cardsPerSection?: number
  className?: string
}

export function LoadingDashboard({
  title = dashboardLoadingCopy.title,
  description = dashboardLoadingCopy.description,
  statusLabel = dashboardLoadingCopy.statusLabel,
  showHeader = true,
  sectionCount = 2,
  cardsPerSection = 3,
  className = '',
}: LoadingDashboardProps) {
  return (
    <div className={className} role="status" aria-live="polite" aria-label={statusLabel}>
      {showHeader ? (
        <div className="mb-6 space-y-2 sm:mb-8">
          <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">{title}</h2>
          {description ? (
            <p className="max-w-2xl text-sm text-stone-600 sm:text-base">{description}</p>
          ) : null}
        </div>
      ) : (
        <p className="sr-only">
          {title}. {description}
        </p>
      )}

      <div className="space-y-8">
        {Array.from({ length: sectionCount }, (_, sectionIndex) => (
          <section key={sectionIndex} className="space-y-3" aria-hidden="true">
            <div className="space-y-1">
              <LoadingText width="short" size="sm" />
              <LoadingText width="medium" size="xs" />
            </div>
            <LoadingGrid
              count={cardsPerSection}
              layout="list"
              ariaLabel={`Loading section ${sectionIndex + 1}`}
            />
          </section>
        ))}
      </div>
    </div>
  )
}

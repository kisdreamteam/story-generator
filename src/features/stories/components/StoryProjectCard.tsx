import { AppButton, AppCard } from '@/shared/components'
import type { StoryProject } from '../types'
import { formatStoryDate, getStoryStatusBadgeClasses } from '../utils/storyFormat'
import { getAgeRangeLabel } from '../utils/storySetupForm'
import { getStoryProjectStatusLabel } from '../utils/storyProjectDisplay'

interface StoryProjectCardProps {
  project: StoryProject
  /** Override status — e.g. "Mock draft" for the sample project. */
  statusLabel?: string
  actionLabel?: string
  onViewPreview?: () => void
  onDelete?: () => void
}

export function StoryProjectCard({
  project,
  statusLabel,
  actionLabel = 'View preview',
  onViewPreview,
  onDelete,
}: StoryProjectCardProps) {
  const badgeLabel = statusLabel ?? getStoryProjectStatusLabel(project)

  return (
    <AppCard padding="md" className="border-stone-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-stone-900">{project.title}</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStoryStatusBadgeClasses(badgeLabel)}`}
            >
              {badgeLabel}
            </span>
          </div>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-stone-500">Theme</dt>
              <dd className="text-stone-800">{project.theme}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-stone-500">Age range</dt>
              <dd className="text-stone-800">{getAgeRangeLabel(project.ageRange)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-stone-500">Language</dt>
              <dd className="text-stone-800">{project.language}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-stone-500">Page count</dt>
              <dd className="text-stone-800">{project.pageCount} pages</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-stone-500">Updated</dt>
              <dd className="text-stone-800">{formatStoryDate(project.updatedAt)}</dd>
            </div>
          </dl>
        </div>

        {(onViewPreview || onDelete) && (
          <div className="flex flex-col gap-2 sm:items-end">
            {onViewPreview && (
              <AppButton type="button" variant="secondary" onClick={onViewPreview}>
                {actionLabel}
              </AppButton>
            )}
            {onDelete && (
              <AppButton type="button" variant="ghost" onClick={onDelete}>
                Delete
              </AppButton>
            )}
          </div>
        )}
      </div>
    </AppCard>
  )
}

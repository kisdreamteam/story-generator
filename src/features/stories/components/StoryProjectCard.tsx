import { memo } from 'react'
import { AppButton, AppCard } from '@/shared/components'
import type { StoryProject } from '../types'
import { formatStoryDate } from '../utils/storyFormat'
import { getStoryStatusLabelForProject } from '../utils/storyStatus'
import { getAgeRangeLabel } from '../utils/storySetupForm'
import { StoryStatusBadge } from './StoryStatusBadge'

interface StoryProjectCardProps {
  project: StoryProject
  /** Override status — e.g. "Sample" for demo content. */
  statusLabel?: string
  actionLabel?: string
  /** Stable handler — receives project id to avoid per-row inline closures in lists. */
  onOpenProject?: (projectId: string) => void
  onDuplicateProject?: (project: StoryProject) => void
  onDeleteProject?: (project: StoryProject) => void
  isDeleting?: boolean
  isDuplicating?: boolean
}

function buildScanMetaLine(project: StoryProject): string {
  const ageGroup = getAgeRangeLabel(project.ageRange)
  const topic = project.theme.trim() || 'No topic yet'
  const created = formatStoryDate(project.createdAt)

  return `${ageGroup} · ${topic} · Created ${created}`
}

/**
 * Library list row — memoized so loading/error state updates elsewhere on the page
 * do not re-render every card when the stories array reference is unchanged.
 */
export const StoryProjectCard = memo(function StoryProjectCard({
  project,
  statusLabel,
  actionLabel = 'Open story',
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
  isDeleting = false,
  isDuplicating = false,
}: StoryProjectCardProps) {
  const badgeLabel = statusLabel ?? getStoryStatusLabelForProject(project)
  const showUpdated =
    project.updatedAt !== project.createdAt &&
    formatStoryDate(project.updatedAt) !== formatStoryDate(project.createdAt)

  return (
    <AppCard padding="md" className="border-stone-200 transition-colors hover:border-stone-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-snug text-stone-900">{project.title}</h3>
            <StoryStatusBadge label={badgeLabel} />
          </div>

          <p className="text-sm leading-relaxed text-stone-600">{buildScanMetaLine(project)}</p>

          {showUpdated && (
            <p className="text-xs text-stone-500">
              Last updated {formatStoryDate(project.updatedAt)}
            </p>
          )}
        </div>

        {(onOpenProject || onDuplicateProject || onDeleteProject) && (
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            {onOpenProject && (
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => onOpenProject(project.id)}
                disabled={isDeleting || isDuplicating}
                fullWidth
                className="sm:w-auto"
              >
                {actionLabel}
              </AppButton>
            )}
            {onDuplicateProject && (
              <AppButton
                type="button"
                variant="ghost"
                onClick={() => onDuplicateProject(project)}
                disabled={isDeleting || isDuplicating}
                fullWidth
                className="sm:w-auto"
              >
                {isDuplicating ? 'Duplicating…' : 'Duplicate'}
              </AppButton>
            )}
            {onDeleteProject && (
              <AppButton
                type="button"
                variant="ghost"
                onClick={() => onDeleteProject(project)}
                disabled={isDeleting || isDuplicating}
                fullWidth
                className="sm:w-auto"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </AppButton>
            )}
          </div>
        )}
      </div>
    </AppCard>
  )
})

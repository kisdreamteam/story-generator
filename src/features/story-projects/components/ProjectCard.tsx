import { Link } from 'react-router-dom'
import { AppButton, AppCard, ComingSoonBadge } from '../../../shared/components'
import { getSeriesById } from '../../series/services/series.service'
import { projectStatusConfig } from '../config/projectStatus'
import type { StoryProject } from '../types'

interface ProjectCardProps {
  project: StoryProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  const series = getSeriesById(project.seriesId)
  const status = projectStatusConfig[project.status]
  const canViewOutput = project.status === 'generated'

  return (
    <AppCard className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-stone-900">{project.title}</h2>
          <p className="mt-0.5 text-sm text-stone-500">{series?.name}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.badgeClassName}`}
          title={status.description}
        >
          {status.label}
        </span>
      </div>

      <p className="mt-2 text-xs text-stone-500">{status.description}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-600">
        <span className="rounded-md bg-stone-100 px-2 py-1">{project.targetLanguage}</span>
        <span className="rounded-md bg-stone-100 px-2 py-1">Ages {project.ageGroup}</span>
      </div>

      <p className="mt-3 text-xs text-stone-400">Updated {project.updatedAt}</p>

      <div className="mt-auto flex flex-col gap-2 border-t border-stone-100 pt-4">
        <Link to={`/projects/${project.id}/setup`}>
          <AppButton variant="primary" size="sm" fullWidth>
            Continue Setup
          </AppButton>
        </Link>

        {canViewOutput ? (
          <Link to={`/projects/${project.id}/output`}>
            <AppButton variant="secondary" size="sm" fullWidth>
              View Output
            </AppButton>
          </Link>
        ) : (
          <AppButton
            variant="secondary"
            size="sm"
            fullWidth
            disabled
            title="Generate a story first to view output"
          >
            View Output
          </AppButton>
        )}

        <div className="flex items-center justify-between gap-2">
          <AppButton variant="ghost" size="sm" disabled className="flex-1">
            Duplicate Project
          </AppButton>
          <ComingSoonBadge />
        </div>
      </div>
    </AppCard>
  )
}

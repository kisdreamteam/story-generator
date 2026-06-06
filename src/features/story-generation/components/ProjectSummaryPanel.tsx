import { Link } from 'react-router-dom'
import { AppButton, SectionCard } from '../../../shared/components'
import type { ProjectSummaryField } from '../types/projectSummary.types'

interface ProjectSummaryPanelProps {
  projectId: string
  fields: ProjectSummaryField[]
}

export function ProjectSummaryPanel({ projectId, fields }: ProjectSummaryPanelProps) {
  return (
    <SectionCard
      title="Project Summary"
      description="Review what you configured before exploring the generated story"
    >
      <dl className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="rounded-lg bg-stone-50 px-3 py-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {field.label}
            </dt>
            <dd className="mt-1 text-sm text-stone-800">{field.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-col gap-2 border-t border-stone-100 pt-4 sm:flex-row">
        <Link to={`/projects/${projectId}/setup`} className="sm:flex-1">
          <AppButton variant="secondary" fullWidth>
            Back to Setup
          </AppButton>
        </Link>
        <Link to="/projects/new" className="sm:flex-1">
          <AppButton variant="primary" fullWidth>
            Create Another Story
          </AppButton>
        </Link>
      </div>
    </SectionCard>
  )
}

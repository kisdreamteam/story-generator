import type { ProjectStatus } from '../types'

export interface ProjectStatusConfig {
  label: string
  description: string
  badgeClassName: string
}

export const projectStatusConfig: Record<ProjectStatus, ProjectStatusConfig> = {
  draft: {
    label: 'Draft',
    description: 'Project created — story setup not started',
    badgeClassName: 'bg-stone-100 text-stone-700 ring-1 ring-stone-200',
  },
  setup: {
    label: 'Setup',
    description: 'Story settings in progress',
    badgeClassName: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  },
  generated: {
    label: 'Generated',
    description: 'Mock story output available',
    badgeClassName: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  },
}

import type { StoryProject } from '../types'
import type { StoryLifecycleStatus } from '../types/storyLifecycle.types'
import {
  STORY_LIFECYCLE_STATUS_LABELS,
  STORY_LIFECYCLE_STATUSES,
} from '../types/storyLifecycle.types'
import { hasGeneratedStoryContent } from '@/features/story-generator/lib/story-project'

export function isStoryLifecycleStatus(value: unknown): value is StoryLifecycleStatus {
  return typeof value === 'string' && STORY_LIFECYCLE_STATUSES.includes(value as StoryLifecycleStatus)
}

/** Derive lifecycle status from project content when no explicit override applies. */
export function deriveStoryLifecycleStatus(project: StoryProject): StoryLifecycleStatus {
  if (!hasGeneratedStoryContent(project)) {
    return 'draft'
  }

  if ((project.version ?? 0) > 0) {
    return 'edited'
  }

  return 'generated'
}

/** Resolved status — honors explicit `completed`, otherwise derives from content. */
export function resolveStoryLifecycleStatus(project: StoryProject): StoryLifecycleStatus {
  if (project.lifecycleStatus === 'completed') {
    return 'completed'
  }

  return deriveStoryLifecycleStatus(project)
}

export function getStoryLifecycleStatusLabel(status: StoryLifecycleStatus): string {
  return STORY_LIFECYCLE_STATUS_LABELS[status]
}

export function getStoryLifecycleStatusLabelForProject(
  project: StoryProject,
  options?: { mockSample?: boolean },
): string {
  if (options?.mockSample) {
    return 'Sample story'
  }

  return getStoryLifecycleStatusLabel(resolveStoryLifecycleStatus(project))
}

export function getStoryLifecycleBadgeClasses(status: StoryLifecycleStatus): string {
  switch (status) {
    case 'draft':
      return 'bg-amber-50 text-amber-900'
    case 'generated':
      return 'bg-sky-50 text-sky-900'
    case 'edited':
      return 'bg-brand-50 text-brand-800'
    case 'completed':
      return 'bg-emerald-50 text-emerald-900'
    default:
      return 'bg-stone-100 text-stone-700'
  }
}

export function withStoryLifecycleStatus(
  project: StoryProject,
  lifecycleStatus: StoryLifecycleStatus,
): StoryProject {
  return {
    ...project,
    lifecycleStatus,
  }
}

/** Map lifecycle status to existing Supabase `story_projects.status` values — no schema change. */
export function toSupabaseProjectStatus(
  project: StoryProject,
): 'draft' | 'generated' | 'saved' | 'archived' {
  switch (resolveStoryLifecycleStatus(project)) {
    case 'draft':
      return 'draft'
    case 'generated':
      return 'generated'
    case 'edited':
    case 'completed':
      return 'saved'
    default:
      return 'draft'
  }
}

/** Infer lifecycle status from a Supabase row when JSON metadata is missing. */
export function lifecycleStatusFromSupabaseRow(
  rowStatus: string,
  project: StoryProject,
): StoryLifecycleStatus {
  if (project.lifecycleStatus && isStoryLifecycleStatus(project.lifecycleStatus)) {
    return project.lifecycleStatus === 'completed'
      ? 'completed'
      : deriveStoryLifecycleStatus({ ...project, lifecycleStatus: project.lifecycleStatus })
  }

  if (rowStatus === 'draft') {
    return 'draft'
  }

  if (rowStatus === 'generated') {
    return hasGeneratedStoryContent(project) ? 'generated' : 'draft'
  }

  if (rowStatus === 'saved' || rowStatus === 'archived') {
    if (!hasGeneratedStoryContent(project)) {
      return 'draft'
    }

    return (project.version ?? 0) > 0 ? 'edited' : 'generated'
  }

  return deriveStoryLifecycleStatus(project)
}

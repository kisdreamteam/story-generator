import type { StoryProject } from '../types'
import type { StoryLifecycleStatus } from '../types/storyLifecycle.types'
import {
  deriveStoryLifecycleStatus,
  getStoryLifecycleStatusLabel,
  getStoryLifecycleStatusLabelForProject,
  resolveStoryLifecycleStatus,
} from './storyLifecycleStatus'

/** @deprecated Use {@link StoryLifecycleStatus} — kept for create-flow compatibility. */
export type StoryTeacherStatus = 'setup-draft' | 'generated-story' | 'saved-story'

/** @deprecated Use {@link STORY_LIFECYCLE_STATUS_LABELS}. */
export const STORY_STATUS_LABELS: Record<StoryTeacherStatus, string> = {
  'setup-draft': 'Draft',
  'generated-story': 'Generated',
  'saved-story': 'Edited',
}

/** Review step badge when the plan was saved to Your stories. */
export const STORY_PLAN_SAVED_LABEL = 'Plan saved'

export {
  deriveStoryLifecycleStatus,
  getStoryLifecycleStatusLabel,
  getStoryLifecycleStatusLabelForProject,
  resolveStoryLifecycleStatus,
}

export type { StoryLifecycleStatus }

export function getStoryStatusLabel(status: StoryTeacherStatus): string {
  return STORY_STATUS_LABELS[status]
}

/** @deprecated Use {@link getStoryLifecycleStatusLabelForProject}. */
export function getStoryStatusLabelForProject(
  project: StoryProject,
  options?: { mockSample?: boolean },
): string {
  return getStoryLifecycleStatusLabelForProject(project, options)
}

export type CreateFlowStep = 'form' | 'review' | 'generated'

/** Derive status during the create-story flow from step and save flags. */
export function deriveCreateFlowStoryStatus(options: {
  step: CreateFlowStep
  hasGeneratedStory: boolean
  storySaved: boolean
}): StoryTeacherStatus | null {
  if (options.step === 'form') {
    return null
  }

  if (options.step === 'review') {
    return 'setup-draft'
  }

  if (!options.hasGeneratedStory) {
    return 'setup-draft'
  }

  return options.storySaved ? 'saved-story' : 'generated-story'
}

export function getCreateFlowStoryStatusLabel(options: {
  step: CreateFlowStep
  hasGeneratedStory: boolean
  storySaved: boolean
}): string | null {
  const status = deriveCreateFlowStoryStatus(options)
  if (!status) return null

  if (status === 'setup-draft') return 'Draft'
  if (status === 'generated-story') return 'Generated'
  return 'Edited'
}

/** Map create-flow teacher status to lifecycle status. */
export function createFlowStatusToLifecycle(
  status: StoryTeacherStatus | null,
): StoryLifecycleStatus | null {
  if (!status) return null
  if (status === 'setup-draft') return 'draft'
  if (status === 'generated-story') return 'generated'
  return 'edited'
}

/** @deprecated Use {@link deriveStoryLifecycleStatus}. */
export function deriveStoryStatus(project: StoryProject): StoryTeacherStatus {
  const lifecycle = deriveStoryLifecycleStatus(project)
  if (lifecycle === 'draft') return 'setup-draft'
  if (lifecycle === 'generated' || lifecycle === 'completed') return 'generated-story'
  return 'saved-story'
}

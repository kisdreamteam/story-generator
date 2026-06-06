import type { StoryProject } from '../types'

/** Teacher-facing story status derived from existing project fields. */
export type StoryTeacherStatus = 'setup-draft' | 'generated-story' | 'saved-story'

export const STORY_STATUS_LABELS: Record<StoryTeacherStatus, string> = {
  'setup-draft': 'Story plan',
  'generated-story': 'Not saved yet',
  'saved-story': 'Saved to library',
}

/** Review step badge when the plan was saved to Your stories. */
export const STORY_PLAN_SAVED_LABEL = 'Plan saved'

function hasGeneratedStoryContent(project: StoryProject): boolean {
  return Boolean(project.generatedStory) || project.storyPages.length > 0
}

/** Derive status from a stored story project — no schema changes. */
export function deriveStoryStatus(project: StoryProject): StoryTeacherStatus {
  if (!hasGeneratedStoryContent(project)) {
    return 'setup-draft'
  }

  if (project.generatedStory) {
    return 'saved-story'
  }

  return 'generated-story'
}

export function getStoryStatusLabel(status: StoryTeacherStatus): string {
  return STORY_STATUS_LABELS[status]
}

export function getStoryStatusLabelForProject(
  project: StoryProject,
  options?: { mockSample?: boolean },
): string {
  if (options?.mockSample) {
    return 'Sample story'
  }

  return getStoryStatusLabel(deriveStoryStatus(project))
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
  return status ? getStoryStatusLabel(status) : null
}

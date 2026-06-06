import type { StoryProject } from '../types'
import { buildStorySetupReviewSections, getAgeRangeLabel } from './storySetupForm'
import type { StoryDetailField, StoryDetailSetupSection } from '../components/story-detail/types'

/** Fallback setup fields when a project has no saved setup snapshot. */
export function buildStoryDetailFallbackFields(project: StoryProject): StoryDetailField[] {
  return [
    { label: 'Topic', value: displayDetailValue(project.theme) },
    { label: 'Setting', value: displayDetailValue(project.setting) },
    { label: 'Characters', value: displayDetailValue(project.characters), multiline: true },
    { label: 'Lesson goal', value: displayDetailValue(project.lessonGoal), multiline: true },
    { label: 'Age group', value: displayDetailValue(getAgeRangeLabel(project.ageRange)) },
    { label: 'Language', value: displayDetailValue(project.language) },
  ]
}

/** Teacher-friendly fallback for optional text fields. */
export function displayDetailValue(value: string | undefined, fallback = 'Not provided'): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

export function mapStorySetupReviewSections(setup: StoryProject['setup']): StoryDetailSetupSection[] {
  if (!setup) return []

  return buildStorySetupReviewSections(setup).map((section) => ({
    title: section.title,
    events: section.events,
    fields: section.fields.map((field) => ({
      label: field.label,
      value: field.value,
      multiline: field.multiline,
    })),
  }))
}

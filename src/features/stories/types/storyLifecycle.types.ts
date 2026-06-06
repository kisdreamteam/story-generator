/** Teacher-facing lifecycle status stored on each story project. */
export type StoryLifecycleStatus = 'draft' | 'generated' | 'edited' | 'completed'

export const STORY_LIFECYCLE_STATUSES: readonly StoryLifecycleStatus[] = [
  'draft',
  'generated',
  'edited',
  'completed',
]

export const STORY_LIFECYCLE_STATUS_LABELS: Record<StoryLifecycleStatus, string> = {
  draft: 'Draft',
  generated: 'Generated',
  edited: 'Edited',
  completed: 'Completed',
}

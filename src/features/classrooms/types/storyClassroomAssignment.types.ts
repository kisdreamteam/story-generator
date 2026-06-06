import type { StoryLifecycleStatus } from '@/features/stories/types/storyLifecycle.types'

/** Link between a saved story project and a classroom. */
export interface StoryClassroomAssignment {
  storyId: string
  classroomId: string
  assignedAt: string
}

export interface ClassroomAssignedStory {
  id: string
  title: string
  theme: string
  isGenerated: boolean
  lifecycleStatus: StoryLifecycleStatus
  updatedAt: string
}

export type ClassroomStoryLibraryStatusFilter = '' | StoryLifecycleStatus

export interface ClassroomStoryLibraryFilterState {
  search: string
  status: ClassroomStoryLibraryStatusFilter
}

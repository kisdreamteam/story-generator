import { AppInput, AppSelect } from '@/shared/components'
import {
  STORY_LIFECYCLE_STATUSES,
  STORY_LIFECYCLE_STATUS_LABELS,
} from '@/features/stories/types/storyLifecycle.types'
import type { ClassroomStoryLibraryStatusFilter } from '../types/storyClassroomAssignment.types'

const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  ...STORY_LIFECYCLE_STATUSES.map((status) => ({
    value: status,
    label: STORY_LIFECYCLE_STATUS_LABELS[status],
  })),
]

export interface ClassroomStoryLibraryFiltersProps {
  search: string
  status: ClassroomStoryLibraryStatusFilter
  onSearchChange: (value: string) => void
  onStatusChange: (value: ClassroomStoryLibraryStatusFilter) => void
}

export function ClassroomStoryLibraryFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: ClassroomStoryLibraryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <AppInput
        label="Search stories"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by title or topic"
        autoComplete="off"
        className="min-w-0 flex-1"
      />

      <AppSelect
        label="Status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as ClassroomStoryLibraryStatusFilter)}
        options={statusFilterOptions}
        className="sm:w-44"
      />
    </div>
  )
}

import { AppInput, AppSelect } from '@/shared/components'
import {
  STORY_LIFECYCLE_STATUSES,
  STORY_LIFECYCLE_STATUS_LABELS,
} from '../../types/storyLifecycle.types'
import {
  STORY_LIBRARY_SORT_LABELS,
  STORY_LIBRARY_SORT_OPTIONS,
  type StoryLibraryFilters,
  type StoryLibrarySort,
} from '../../lib/storyLibraryFilters'

interface StoryFilterFieldsProps {
  filters: StoryLibraryFilters
  sort: StoryLibrarySort
  onFilterChange: (key: keyof StoryLibraryFilters, value: string) => void
  onSortChange: (sort: StoryLibrarySort) => void
}

const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  ...STORY_LIFECYCLE_STATUSES.map((status) => ({
    value: status,
    label: STORY_LIFECYCLE_STATUS_LABELS[status],
  })),
]

const sortOptions = STORY_LIBRARY_SORT_OPTIONS.map((sort) => ({
  value: sort,
  label: STORY_LIBRARY_SORT_LABELS[sort],
}))

export function StoryLibrarySearchSortRow({
  filters,
  sort,
  onFilterChange,
  onSortChange,
}: StoryFilterFieldsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <AppInput
        label="Search stories"
        value={filters.search}
        onChange={(event) => onFilterChange('search', event.target.value)}
        placeholder="Search title, topic, or vocabulary"
        autoComplete="off"
        className="min-w-0 flex-1"
      />

      <AppSelect
        label="Sort by"
        value={sort}
        onChange={(event) => onSortChange(event.target.value as StoryLibrarySort)}
        options={sortOptions}
        className="sm:w-44"
      />
    </div>
  )
}

export function StoryLibraryAdvancedFilters({
  filters,
  onFilterChange,
}: Pick<StoryFilterFieldsProps, 'filters' | 'onFilterChange'>) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <AppInput
        label="Filter by title"
        value={filters.title}
        onChange={(event) => onFilterChange('title', event.target.value)}
        placeholder="Exact title match"
        autoComplete="off"
      />

      <AppSelect
        label="Status"
        value={filters.status}
        onChange={(event) => onFilterChange('status', event.target.value)}
        options={statusFilterOptions}
      />

      <AppInput
        label="Created date"
        type="date"
        value={filters.createdDate}
        onChange={(event) => onFilterChange('createdDate', event.target.value)}
        hint="Stories created on this day."
      />
    </div>
  )
}

/** Search, sort, and filter controls for the story library dashboard. */
export function StoryFilterFields(props: StoryFilterFieldsProps) {
  return (
    <div className="space-y-3">
      <StoryLibrarySearchSortRow {...props} />
      <StoryLibraryAdvancedFilters filters={props.filters} onFilterChange={props.onFilterChange} />
    </div>
  )
}

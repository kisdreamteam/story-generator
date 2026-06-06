import { AppInput, AppSelect } from '@/shared/components'
import { ageGroupOptions } from '@/features/story-projects/config/formOptions'
import type { StoryLibraryFilters } from '../../lib/storyLibraryFilters'

interface StoryFilterFieldsProps {
  filters: StoryLibraryFilters
  onFilterChange: (key: keyof StoryLibraryFilters, value: string) => void
}

const ageFilterOptions = [{ value: '', label: 'All age groups' }, ...ageGroupOptions]

export function StoryFilterFields({ filters, onFilterChange }: StoryFilterFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <AppInput
        label="Search title"
        value={filters.title}
        onChange={(event) => onFilterChange('title', event.target.value)}
        placeholder="e.g. Fire station visit"
        autoComplete="off"
      />

      <AppInput
        label="Search vocabulary"
        value={filters.vocabulary}
        onChange={(event) => onFilterChange('vocabulary', event.target.value)}
        placeholder="e.g. firefighter, helmet"
        autoComplete="off"
      />

      <AppInput
        label="Search topic"
        value={filters.topic}
        onChange={(event) => onFilterChange('topic', event.target.value)}
        placeholder="e.g. community helpers"
        autoComplete="off"
      />

      <AppSelect
        label="Age group"
        value={filters.ageGroup}
        onChange={(event) => onFilterChange('ageGroup', event.target.value)}
        options={ageFilterOptions}
      />

      <AppInput
        label="Created date"
        type="date"
        value={filters.createdDate}
        onChange={(event) => onFilterChange('createdDate', event.target.value)}
        hint="Filter stories created on this day."
        className="sm:col-span-2"
      />
    </div>
  )
}

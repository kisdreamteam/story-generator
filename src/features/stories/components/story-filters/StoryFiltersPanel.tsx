import { useState } from 'react'
import { AppButton } from '@/shared/components/AppButton'
import type { StoryLibraryFilters } from '../../lib/storyLibraryFilters'
import { StoryFilterFields } from './StoryFilterFields'
import { StoryFilterSummary, countActiveStoryLibraryFilters, storyFilterCountLabel } from './StoryFilterSummary'

export interface StoryFiltersPanelProps {
  filters: StoryLibraryFilters
  filteredCount: number
  totalCount: number
  hasActiveFilters: boolean
  onFilterChange: (key: keyof StoryLibraryFilters, value: string) => void
  onClearFilters: () => void
}

export function StoryFiltersPanel({
  filters,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onFilterChange,
  onClearFilters,
}: StoryFiltersPanelProps) {
  const activeCount = countActiveStoryLibraryFilters(filters)
  const [isExpanded, setIsExpanded] = useState(hasActiveFilters)

  return (
    <section aria-label="Story filters" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-stone-900">Find stories</h3>
          <p className="text-xs leading-relaxed text-stone-500">
            Search by title, vocabulary, topic, age group, or created date.
          </p>
        </div>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 sm:hidden"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? 'Hide' : storyFilterCountLabel(activeCount)}
        </AppButton>
      </div>

      <div className={`space-y-3 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
        <StoryFilterFields filters={filters} onFilterChange={onFilterChange} />
        <StoryFilterSummary
          filteredCount={filteredCount}
          totalCount={totalCount}
          hasActiveFilters={hasActiveFilters}
          onClear={onClearFilters}
        />
      </div>
    </section>
  )
}

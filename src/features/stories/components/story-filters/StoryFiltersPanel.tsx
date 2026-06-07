import { useState } from 'react'
import { AppButton } from '@/shared/components'
import { insetPanelShellClass } from '@/shared/styles/surfaceClasses'
import type { StoryLibraryFilters, StoryLibrarySort } from '../../lib/storyLibraryFilters'
import { StoryLibraryAdvancedFilters, StoryLibrarySearchSortRow } from './StoryFilterFields'
import { StoryFilterSummary, countActiveStoryLibraryFilters, storyFilterCountLabel } from './StoryFilterSummary'

export interface StoryFiltersPanelProps {
  filters: StoryLibraryFilters
  sort: StoryLibrarySort
  filteredCount: number
  totalCount: number
  hasActiveFilters: boolean
  onFilterChange: (key: keyof StoryLibraryFilters, value: string) => void
  onSortChange: (sort: StoryLibrarySort) => void
  onClearFilters: () => void
}

export function StoryFiltersPanel({
  filters,
  sort,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onFilterChange,
  onSortChange,
  onClearFilters,
}: StoryFiltersPanelProps) {
  const activeCount = countActiveStoryLibraryFilters(filters)
  const [isExpanded, setIsExpanded] = useState(hasActiveFilters)

  return (
    <section
      aria-label="Search and filter stories"
      className={`${insetPanelShellClass} p-3 sm:p-4`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <h3 className="text-sm font-semibold text-stone-900">Search &amp; filter</h3>
          <p className="text-xs leading-relaxed text-stone-500">
            Find stories locally — search, filter by status or date, and change sort order.
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
          {isExpanded ? 'Hide filters' : storyFilterCountLabel(activeCount)}
        </AppButton>
      </div>

      <div className="space-y-3">
        <StoryLibrarySearchSortRow
          filters={filters}
          sort={sort}
          onFilterChange={onFilterChange}
          onSortChange={onSortChange}
        />

        <div className={`space-y-3 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
          <StoryLibraryAdvancedFilters filters={filters} onFilterChange={onFilterChange} />
          <StoryFilterSummary
            filteredCount={filteredCount}
            totalCount={totalCount}
            hasActiveFilters={hasActiveFilters}
            onClear={onClearFilters}
          />
        </div>
      </div>
    </section>
  )
}

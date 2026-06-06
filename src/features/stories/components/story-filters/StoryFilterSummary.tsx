import { AppButton } from '@/shared/components/AppButton'
import { countActiveStoryLibraryFilters } from '../../lib/storyLibraryFilters'

interface StoryFilterSummaryProps {
  filteredCount: number
  totalCount: number
  hasActiveFilters: boolean
  onClear: () => void
}

export function StoryFilterSummary({
  filteredCount,
  totalCount,
  hasActiveFilters,
  onClear,
}: StoryFilterSummaryProps) {
  if (!hasActiveFilters) return null

  const matchLabel =
    filteredCount === 1 ? '1 story matches' : `${filteredCount} stories match`

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-stone-700">
        {matchLabel} your filters
        <span className="text-stone-500"> · {totalCount} total</span>
      </p>
      <AppButton type="button" variant="ghost" size="sm" onClick={onClear} className="self-start sm:self-auto">
        Clear filters
      </AppButton>
    </div>
  )
}

export function storyFilterCountLabel(activeCount: number): string {
  if (activeCount === 0) return 'Filters'
  if (activeCount === 1) return '1 filter active'
  return `${activeCount} filters active`
}

export { countActiveStoryLibraryFilters }

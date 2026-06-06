import { AppButton, AppCard } from '@/shared/components'
import type { StoryRevisionSummary } from '../types/storyRevision.types'

export interface StoryRevisionListProps {
  revisions: StoryRevisionSummary[]
  onRestore: (revisionId: string) => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
}

export function StoryRevisionList({
  revisions,
  onRestore,
  disabled = false,
  isLoading = false,
  className = '',
}: StoryRevisionListProps) {
  if (isLoading) {
    return (
      <AppCard padding="md" className={`border-stone-200 bg-stone-50/40 ${className}`.trim()}>
        <p className="text-sm text-stone-600">Loading previous versions…</p>
      </AppCard>
    )
  }

  if (revisions.length === 0) {
    return null
  }

  return (
    <AppCard padding="md" className={`border-stone-200 bg-stone-50/40 ${className}`.trim()}>
      <div className="mb-3 space-y-1">
        <h2 className="text-sm font-semibold text-stone-900">Previous versions</h2>
        <p className="text-xs leading-relaxed text-stone-600">
          Snapshots are saved when you save the story. Restore replaces your current working copy.
        </p>
      </div>

      <ul className="space-y-2">
        {revisions.map((revision) => (
          <li
            key={revision.id}
            className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-stone-900">{revision.label}</p>
              <p className="text-xs text-stone-500">{revision.formattedRevisionAt}</p>
            </div>
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onRestore(revision.id)}
              disabled={disabled}
              className="self-start sm:shrink-0"
            >
              Restore revision
            </AppButton>
          </li>
        ))}
      </ul>
    </AppCard>
  )
}

import { AppButton, AppCard } from '@/shared/components'
import type { StoryVersionSummary } from '../types/storyVersion.types'

interface StoryVersionListProps {
  versions: StoryVersionSummary[]
  onRestore: (versionId: string) => void
  disabled?: boolean
  className?: string
}

export function StoryVersionList({
  versions,
  onRestore,
  disabled = false,
  className = '',
}: StoryVersionListProps) {
  if (versions.length === 0) {
    return null
  }

  return (
    <AppCard padding="md" className={`border-stone-200 bg-stone-50/40 ${className}`.trim()}>
      <div className="mb-3 space-y-1">
        <h2 className="text-sm font-semibold text-stone-900">Previous versions</h2>
        <p className="text-xs leading-relaxed text-stone-600">
          Snapshots are saved before major edits. Restore replaces your current working copy.
        </p>
      </div>

      <ul className="space-y-2">
        {versions.map((version) => (
          <li
            key={version.id}
            className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-stone-900">{version.label}</p>
              <p className="text-xs text-stone-500">{version.formattedCreatedAt}</p>
            </div>
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onRestore(version.id)}
              disabled={disabled}
              className="self-start sm:shrink-0"
            >
              Restore
            </AppButton>
          </li>
        ))}
      </ul>
    </AppCard>
  )
}

import { Link } from 'react-router-dom'
import { AppButton, SectionCard } from '@/shared/components'
import type { ClassroomAssignedStory } from '../types/storyClassroomAssignment.types'
import { formatClassroomDate } from '../lib/classroomFormat'

export interface ClassroomStoriesSectionProps {
  stories: ClassroomAssignedStory[]
  isLoading?: boolean
  error?: string | null
  onReload?: () => void
}

export function ClassroomStoriesSection({
  stories,
  isLoading = false,
  error = null,
  onReload,
}: ClassroomStoriesSectionProps) {
  return (
    <SectionCard
      title="Assigned stories"
      description="Stories linked to this classroom from Your stories."
    >
      {isLoading ? (
        <p className="text-sm text-stone-600">Loading assigned stories…</p>
      ) : error ? (
        <div className="space-y-3">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
          {onReload ? (
            <AppButton type="button" variant="secondary" size="sm" onClick={onReload}>
              Try again
            </AppButton>
          ) : null}
        </div>
      ) : stories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50/70 px-4 py-5 text-sm text-stone-600">
          No stories assigned yet. Open a story and choose Assign to classroom to add it here.
        </p>
      ) : (
        <ul className="space-y-2" aria-label="Assigned stories">
          {stories.map((story) => (
            <li key={story.id}>
              <Link
                to={`/dashboard/stories/${encodeURIComponent(story.id)}`}
                className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
              >
                <span>
                  <span className="block text-sm font-medium text-stone-900">{story.title}</span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {story.isGenerated ? 'Finished story' : 'Story plan'} · Updated{' '}
                    {formatClassroomDate(story.updatedAt)}
                  </span>
                </span>
                <span className="text-xs font-medium text-brand-700">Open</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

import { memo } from 'react'
import { Link } from 'react-router-dom'
import { AppButton, AppCard } from '@/shared/components'
import { StoryStatusBadge } from '@/features/stories/components/StoryStatusBadge'
import { formatClassroomDate } from '../lib/classroomFormat'
import type { ClassroomAssignedStory } from '../types/storyClassroomAssignment.types'

export interface ClassroomStoryLibraryCardProps {
  story: ClassroomAssignedStory
  isRemoving?: boolean
  onRemove: () => void
}

export const ClassroomStoryLibraryCard = memo(function ClassroomStoryLibraryCard({
  story,
  isRemoving = false,
  onRemove,
}: ClassroomStoryLibraryCardProps) {
  const storyPath = `/dashboard/stories/${encodeURIComponent(story.id)}`
  const readerPath = `/dashboard/stories/${encodeURIComponent(story.id)}/read`
  const canRead = story.isGenerated

  return (
    <AppCard padding="md" className="border-stone-200">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold leading-snug text-stone-900">{story.title}</h3>
              <StoryStatusBadge status={story.lifecycleStatus} />
            </div>
            <p className="text-sm text-stone-600">
              {story.theme.trim() || 'No topic yet'} · Updated {formatClassroomDate(story.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link to={storyPath} className="w-full sm:w-auto">
            <AppButton type="button" variant="secondary" fullWidth className="sm:w-auto">
              Open story
            </AppButton>
          </Link>

          {canRead ? (
            <Link to={readerPath} className="w-full sm:w-auto">
              <AppButton type="button" fullWidth className="sm:w-auto">
                Read aloud
              </AppButton>
            </Link>
          ) : (
            <AppButton type="button" variant="secondary" disabled fullWidth className="sm:w-auto">
              Generate to read
            </AppButton>
          )}

          <AppButton
            type="button"
            variant="ghost"
            onClick={onRemove}
            disabled={isRemoving}
            fullWidth
            className="sm:w-auto sm:text-red-700"
          >
            {isRemoving ? 'Removing…' : 'Remove from classroom'}
          </AppButton>
        </div>
      </div>
    </AppCard>
  )
})

import { useNavigate } from 'react-router-dom'
import { AppButton, AppEmptyState, LoadingCard, SectionCard } from '@/shared/components'
import { classroomStoryLibraryCountLabel } from '../lib/classroomStoryLibraryFilters'
import { confirmRemoveStoryFromClassroom } from '../lib/confirmRemoveStoryFromClassroom'
import type { ClassroomAssignedStory } from '../types/storyClassroomAssignment.types'
import { ClassroomStoryLibraryCard } from './ClassroomStoryLibraryCard'
import { ClassroomStoryLibraryFilters } from './ClassroomStoryLibraryFilters'
import type { ClassroomStoryLibraryFiltersProps } from './ClassroomStoryLibraryFilters'

export interface ClassroomStoryLibraryProps extends ClassroomStoryLibraryFiltersProps {
  stories: ClassroomAssignedStory[]
  filteredStories: ClassroomAssignedStory[]
  isLoading?: boolean
  error?: string | null
  hasActiveFilters?: boolean
  removingStoryId?: string | null
  onReload?: () => void
  onClearFilters?: () => void
  onRemoveStory: (storyId: string) => Promise<boolean>
}

export function ClassroomStoryLibrary({
  stories,
  filteredStories,
  search,
  status,
  onSearchChange,
  onStatusChange,
  isLoading = false,
  error = null,
  hasActiveFilters = false,
  removingStoryId = null,
  onReload,
  onClearFilters,
  onRemoveStory,
}: ClassroomStoryLibraryProps) {
  const navigate = useNavigate()

  async function handleRemove(story: ClassroomAssignedStory) {
    if (!confirmRemoveStoryFromClassroom(story.title)) {
      return
    }

    await onRemoveStory(story.id)
  }

  return (
    <SectionCard
      title="Story library"
      description="Stories assigned to this classroom — search, filter, read aloud, or remove."
    >
      <div className="space-y-4">
        <ClassroomStoryLibraryFilters
          search={search}
          status={status}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
        />

        {!isLoading && !error ? (
          <p className="text-xs font-medium text-stone-500">
            {classroomStoryLibraryCountLabel(filteredStories.length, stories.length)}
          </p>
        ) : null}

        {isLoading ? (
          <LoadingCard
            variant="compact"
            showAction={false}
            title="Loading stories"
            description="Fetching stories assigned to this classroom…"
            ariaLabel="Loading assigned stories"
          />
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
          <AppEmptyState
            kind="classroom-story-library-empty"
            layout="section"
            onAction={() => navigate('/dashboard/stories')}
          />
        ) : filteredStories.length === 0 ? (
          <AppEmptyState
            kind="story-library-no-results"
            layout="section"
            onAction={hasActiveFilters && onClearFilters ? onClearFilters : undefined}
            actionLabel={hasActiveFilters && onClearFilters ? 'Clear filters' : undefined}
          />
        ) : (
          <ul className="space-y-3" aria-label="Classroom story library">
            {filteredStories.map((story) => (
              <li key={story.id}>
                <ClassroomStoryLibraryCard
                  story={story}
                  isRemoving={removingStoryId === story.id}
                  onRemove={() => void handleRemove(story)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  )
}

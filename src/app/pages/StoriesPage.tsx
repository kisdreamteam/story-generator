import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton, ErrorState, LoadingDashboard, PageHeader, SectionCard } from '@/shared/components'
import { DashboardLibraryEmptyState } from '@/app/components/DashboardLibraryEmptyState'
import { getStoryDrafts } from '@/features/story-generator'
import {
  classifyStoryDeleteError,
  classifyStoryLoadError,
  type StoryLoadErrorPresentation,
} from '@/features/story-generator/lib/story-route-guards'
import { storyFeedback } from '@/shared/feedback'
import { deleteStory, duplicateStory } from '@/features/stories/api/storyStorageApi'
import { confirmDeleteStory } from '@/features/stories/lib/confirmDeleteStory'
import { StorageStatusIndicator } from '@/app/components/StorageStatusIndicator'
import { LocalStoryMigrationPrompt } from '@/app/components/LocalStoryMigrationPrompt'
import { useAuth } from '@/shared/lib/supabase/useAuth'
import {
  getStoryProjectActionLabel,
  hasGeneratedStoryContent,
  mockGeneratedStory,
  StoryFiltersPanel,
  StoryProjectCard,
  StoryReadOnlyView,
  useFilteredStoryProjects,
  useStoryLibraryFilters,
  type StoryProject,
} from '@/features/stories'

const STORY_PREVIEW_ID = 'story-preview'

function sortByUpdatedAtNewestFirst(stories: StoryProject[]): StoryProject[] {
  return [...stories].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

function storyCountLabel(count: number): string {
  if (count === 1) return '1 story'
  return `${count} stories`
}

function partitionLibraryStories(stories: StoryProject[]) {
  const finishedStories = stories.filter((project) => hasGeneratedStoryContent(project))
  const storyPlans = stories.filter((project) => !hasGeneratedStoryContent(project))
  return { finishedStories, storyPlans }
}

function LibraryStoryList({
  stories,
  deletingStoryId,
  duplicatingStoryId,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
}: {
  stories: StoryProject[]
  deletingStoryId: string | null
  duplicatingStoryId: string | null
  onOpenProject: (projectId: string) => void
  onDuplicateProject: (project: StoryProject) => void
  onDeleteProject: (project: StoryProject) => void
}) {
  return (
    <ul className="space-y-3" aria-label="Your stories">
      {stories.map((project) => (
        <li key={project.id}>
          <StoryProjectCard
            project={project}
            actionLabel={getStoryProjectActionLabel(project)}
            onOpenProject={onOpenProject}
            onDuplicateProject={onDuplicateProject}
            onDeleteProject={onDeleteProject}
            isDeleting={deletingStoryId === project.id}
            isDuplicating={duplicatingStoryId === project.id}
          />
        </li>
      ))}
    </ul>
  )
}

export function StoriesPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const story = mockGeneratedStory
  const [userStories, setUserStories] = useState<StoryProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<StoryLoadErrorPresentation | null>(null)
  const [actionError, setActionError] = useState<StoryLoadErrorPresentation | null>(null)
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null)
  const [duplicatingStoryId, setDuplicatingStoryId] = useState<string | null>(null)
  const deleteInFlightRef = useRef(false)
  const duplicateInFlightRef = useRef(false)

  const { filters, debouncedFilters, setFilter, clearFilters, hasActiveFilters } =
    useStoryLibraryFilters()

  const { filteredStories, totalCount, filteredCount, isFiltered } = useFilteredStoryProjects(
    userStories,
    debouncedFilters,
  )

  const { finishedStories, storyPlans } = useMemo(
    () => partitionLibraryStories(filteredStories),
    [filteredStories],
  )

  const refreshRecentStories = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const drafts = await getStoryDrafts()
      setUserStories(sortByUpdatedAtNewestFirst(drafts))
    } catch (error) {
      setUserStories([])
      setLoadError(classifyStoryLoadError(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthLoading) return
    void refreshRecentStories()
  }, [isAuthLoading, isAuthenticated, refreshRecentStories])

  function handleCreateStory() {
    navigate('/dashboard/create')
  }

  const handleOpenProject = useCallback(
    (projectId: string) => {
      const project = userStories.find((entry) => entry.id === projectId)
      if (!project) return

      if (hasGeneratedStoryContent(project)) {
        navigate(`/dashboard/stories/${encodeURIComponent(projectId)}`)
        return
      }

      navigate(`/dashboard/create?draftId=${encodeURIComponent(projectId)}`)
    },
    [navigate, userStories],
  )

  const handleDuplicateStory = useCallback(
    (project: StoryProject) => {
      if (deletingStoryId || duplicatingStoryId || duplicateInFlightRef.current) return

      duplicateInFlightRef.current = true
      setDuplicatingStoryId(project.id)
      setActionError(null)

      void (async () => {
        try {
          const duplicated = await duplicateStory(project.id)
          storyFeedback.storyDuplicated(duplicated.title)
          await refreshRecentStories()
          navigate(`/dashboard/stories/${encodeURIComponent(duplicated.id)}`)
        } catch (error) {
          const presentation = classifyStoryLoadError(error)
          setActionError(presentation)
          storyFeedback.cloudSyncFailed(presentation.description)
        } finally {
          duplicateInFlightRef.current = false
          setDuplicatingStoryId(null)
        }
      })()
    },
    [deletingStoryId, duplicatingStoryId, navigate, refreshRecentStories],
  )

  const handleDeleteStory = useCallback(
    (project: StoryProject) => {
      if (deletingStoryId || deleteInFlightRef.current) return
      if (!confirmDeleteStory(project.title)) return

      deleteInFlightRef.current = true
      setDeletingStoryId(project.id)
      setActionError(null)

      const previousStories = userStories
      setUserStories((stories) => stories.filter((story) => story.id !== project.id))

      void (async () => {
        try {
          await deleteStory(project.id)
          storyFeedback.storyDeleted(project.title)
        } catch (error) {
          setUserStories(previousStories)
          const presentation = classifyStoryDeleteError(error)
          setActionError(presentation)
          storyFeedback.deleteFailed(presentation.description)
          storyFeedback.optimisticRollback('The story was put back in your library.')
        } finally {
          deleteInFlightRef.current = false
          setDeletingStoryId(null)
        }
      })()
    },
    [deletingStoryId, userStories],
  )

  const isPageLoading = isLoading || isAuthLoading
  const hasUserStories = userStories.length > 0
  const hasVisibleStories = filteredStories.length > 0
  const listDescription = isPageLoading
    ? 'Loading your stories…'
    : hasUserStories
      ? isFiltered
        ? `${filteredCount} of ${storyCountLabel(totalCount)} match your filters — newest first.`
        : `${storyCountLabel(totalCount)} — newest first. Open a story to read or edit it.`
      : 'Your story plans and finished stories will show up here.'

  return (
    <>
      <PageHeader
        title="Your stories"
        description="Story plans and finished Nina & Nino stories for your class — all in one place."
      />

      <div className="mx-auto max-w-2xl space-y-8 px-1 sm:px-0">
        <SectionCard
          title="Story library"
          description={listDescription}
          badge={<StorageStatusIndicator compact />}
        >
          <LocalStoryMigrationPrompt
            className="mb-4"
            onMigrationComplete={() => void refreshRecentStories()}
          />

          {loadError && (
            <div className="mb-4">
              <ErrorState title={loadError.title} description={loadError.description}>
                <AppButton type="button" variant="secondary" onClick={() => void refreshRecentStories()}>
                  Try again
                </AppButton>
              </ErrorState>
            </div>
          )}

          {actionError && !loadError && (
            <div className="mb-4">
              <ErrorState title={actionError.title} description={actionError.description}>
                <AppButton type="button" variant="secondary" onClick={() => setActionError(null)}>
                  Dismiss
                </AppButton>
              </ErrorState>
            </div>
          )}

          {isPageLoading ? (
            <LoadingDashboard />
          ) : !hasUserStories && !loadError ? (
            <DashboardLibraryEmptyState kind="no-stories" onCreateStory={handleCreateStory} />
          ) : hasUserStories ? (
            <div className="space-y-8">
              <StoryFiltersPanel
                filters={filters}
                filteredCount={filteredCount}
                totalCount={totalCount}
                hasActiveFilters={hasActiveFilters}
                onFilterChange={setFilter}
                onClearFilters={clearFilters}
              />

              {!hasVisibleStories ? (
                <ErrorState
                  variant="inline"
                  tone="info"
                  title="No stories match these filters"
                  description="Try different search words or clear filters to see your full library."
                />
              ) : null}

              {hasVisibleStories ? (
                <>
              <section aria-labelledby="finished-stories-heading">
                <div className="mb-3 space-y-1">
                  <h3 id="finished-stories-heading" className="text-sm font-semibold text-stone-900">
                    Finished stories
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-500">
                    Generated stories ready to read, edit, or print for class.
                  </p>
                </div>
                {finishedStories.length === 0 ? (
                  <DashboardLibraryEmptyState
                    kind="no-finished-stories"
                    layout="section"
                    hasStoryPlans={storyPlans.length > 0}
                    onCreateStory={handleCreateStory}
                  />
                ) : (
                  <LibraryStoryList
                    stories={finishedStories}
                    deletingStoryId={deletingStoryId}
                    duplicatingStoryId={duplicatingStoryId}
                    onOpenProject={handleOpenProject}
                    onDuplicateProject={handleDuplicateStory}
                    onDeleteProject={handleDeleteStory}
                  />
                )}
              </section>

              <section aria-labelledby="story-plans-heading">
                <div className="mb-3 space-y-1">
                  <h3 id="story-plans-heading" className="text-sm font-semibold text-stone-900">
                    Story plans
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-500">
                    Saved lesson setups — open one to edit or generate your story.
                  </p>
                </div>
                {storyPlans.length === 0 ? (
                  <DashboardLibraryEmptyState
                    kind="no-story-plans"
                    layout="section"
                    onCreateStory={handleCreateStory}
                  />
                ) : (
                  <LibraryStoryList
                    stories={storyPlans}
                    deletingStoryId={deletingStoryId}
                    duplicatingStoryId={duplicatingStoryId}
                    onOpenProject={handleOpenProject}
                    onDuplicateProject={handleDuplicateStory}
                    onDeleteProject={handleDeleteStory}
                  />
                )}
              </section>
                </>
              ) : null}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Sample story"
          description="See what a finished classroom story looks like before you create your own."
        >
          <div id={STORY_PREVIEW_ID} className="scroll-mt-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-semibold text-stone-900">{story.title}</h3>
                <p className="text-sm leading-relaxed text-stone-600">{story.summary}</p>
              </div>
              <AppButton
                type="button"
                variant="secondary"
                onClick={handleCreateStory}
                fullWidth
                className="shrink-0 sm:w-auto"
              >
                Create your own story
              </AppButton>
            </div>

            <StoryReadOnlyView story={story} />
          </div>
        </SectionCard>
      </div>
    </>
  )
}

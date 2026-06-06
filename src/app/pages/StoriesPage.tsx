import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton, ErrorState, PageHeader, SectionCard } from '@/shared/components'
import { deleteStoryDraft, getStoryDrafts } from '@/features/story-generator'
import { classifyStoryLoadError } from '@/features/story-generator/lib/story-route-guards'
import { StorageStatusIndicator } from '@/app/components/StorageStatusIndicator'
import { LocalStoryMigrationPrompt } from '@/app/components/LocalStoryMigrationPrompt'
import { useAuth } from '@/shared/lib/supabase/useAuth'
import {
  getStoryProjectActionLabel,
  getStoryProjectStatusLabel,
  hasGeneratedStoryContent,
  mockGeneratedStory,
  mockStoryProject,
  StoryEmptyState,
  StoryProjectCard,
  StoryReadOnlyView,
  type StoryProject,
} from '@/features/stories'

const STORY_PREVIEW_ID = 'story-preview'

function sortByUpdatedAtNewestFirst(stories: StoryProject[]): StoryProject[] {
  return [...stories].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

/** Local drafts plus mock sample, deduped by id and sorted newest first. */
function buildRecentStories(localDrafts: StoryProject[]): StoryProject[] {
  const storiesById = new Map<string, StoryProject>()

  for (const draft of localDrafts) {
    storiesById.set(draft.id, draft)
  }

  storiesById.set(mockStoryProject.id, mockStoryProject)

  return sortByUpdatedAtNewestFirst([...storiesById.values()])
}

function isMockSample(project: StoryProject): boolean {
  return project.id === mockStoryProject.id
}

function isLocalStory(project: StoryProject): boolean {
  return !isMockSample(project)
}

export function StoriesPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const story = mockGeneratedStory
  const [recentStories, setRecentStories] = useState<StoryProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const refreshRecentStories = useCallback(async () => {
    setIsLoading(true)
    setListError(null)

    try {
      const drafts = await getStoryDrafts()
      setRecentStories(buildRecentStories(drafts))
    } catch (error) {
      setRecentStories(buildRecentStories([]))
      setListError(classifyStoryLoadError(error).description)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthLoading) return
    void refreshRecentStories()
  }, [isAuthLoading, isAuthenticated, refreshRecentStories])

  function scrollToPreview() {
    document.getElementById(STORY_PREVIEW_ID)?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleViewStory(projectId: string) {
    navigate(`/dashboard/stories/${encodeURIComponent(projectId)}`)
  }

  function handleContinueEditing(projectId: string) {
    navigate(`/dashboard/create?draftId=${encodeURIComponent(projectId)}`)
  }

  function handleCreateStory() {
    navigate('/dashboard/create')
  }

  function handleDeleteDraft(projectId: string) {
    if (!window.confirm('Delete this draft from this device?')) return

    void (async () => {
      try {
        await deleteStoryDraft(projectId)
        await refreshRecentStories()
      } catch (error) {
        setListError(classifyStoryLoadError(error).description)
      }
    })()
  }

  return (
    <>
      <PageHeader
        title="Stories"
        description="Your saved and recent stories will appear here. Preview mock content below."
      />

      <div className="mx-auto max-w-2xl space-y-8">
        <SectionCard title="Recent stories" description="Drafts and recently updated story projects.">
          <StorageStatusIndicator className="mb-4" />
          <LocalStoryMigrationPrompt
            className="mb-4"
            onMigrationComplete={() => void refreshRecentStories()}
          />

          {listError && (
            <div className="mb-4">
              <ErrorState title="Could not load stories" description={listError}>
                <AppButton type="button" variant="secondary" onClick={() => void refreshRecentStories()}>
                  Try again
                </AppButton>
              </ErrorState>
            </div>
          )}

          {isLoading || isAuthLoading ? (
            <p className="text-sm text-stone-500">Loading stories…</p>
          ) : recentStories.length === 0 && !listError ? (
            <StoryEmptyState
              title="No stories yet"
              description="Create your first Nina & Nino story to see drafts and generated previews here."
              actionLabel="Create story"
              onAction={handleCreateStory}
            />
          ) : (
            <div className="space-y-4">
              {recentStories.map((project) => (
                <StoryProjectCard
                  key={project.id}
                  project={project}
                  statusLabel={
                    isMockSample(project)
                      ? getStoryProjectStatusLabel(project, { mockSample: true })
                      : undefined
                  }
                  actionLabel={
                    isMockSample(project)
                      ? 'View preview'
                      : getStoryProjectActionLabel(project)
                  }
                  onViewPreview={
                    isMockSample(project)
                      ? scrollToPreview
                      : hasGeneratedStoryContent(project)
                        ? () => handleViewStory(project.id)
                        : () => handleContinueEditing(project.id)
                  }
                  onDelete={
                    isLocalStory(project) ? () => handleDeleteDraft(project.id) : undefined
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>

        <section id={STORY_PREVIEW_ID} className="scroll-mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{story.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{story.summary}</p>
          </div>

          <StoryReadOnlyView story={story} />
        </section>
      </div>
    </>
  )
}

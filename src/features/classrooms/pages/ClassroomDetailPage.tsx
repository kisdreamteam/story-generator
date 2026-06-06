import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader, SectionCard } from '@/shared/components'
import { storyFeedback } from '@/shared/feedback'
import {
  ClassroomDetailLoadGuard,
  ClassroomDetailNav,
  ClassroomStoryLibrary,
  ClassroomStudentsPlaceholder,
} from '../components'
import { useClassroomDetail, useClassroomStoryLibrary } from '../hooks'
import {
  formatClassroomDate,
  getClassroomAgeRangeLabel,
  getClassroomLanguageLabel,
} from '../lib/classroomFormat'

export function ClassroomDetailPage() {
  const navigate = useNavigate()
  const { classroomId } = useParams<{ classroomId: string }>()
  const { status, classroom, presentation, reload } = useClassroomDetail(classroomId)
  const storyLibrary = useClassroomStoryLibrary(classroomId)

  function handleBack() {
    navigate('/dashboard/classrooms')
  }

  async function handleRemoveStory(storyId: string) {
    const story = storyLibrary.stories.find((item) => item.id === storyId)
    const removed = await storyLibrary.removeStoryFromClassroom(storyId)

    if (removed) {
      storyFeedback.storyRemovedFromClassroom(story?.title)
    }

    return removed
  }

  return (
    <ClassroomDetailLoadGuard
      status={status}
      presentation={presentation}
      pageTitle={classroom?.name ?? 'Classroom'}
      pageDescription="Review classroom details and assigned stories."
    >
      {classroom ? (
        <>
          <PageHeader
            title={classroom.name}
            description="Classroom overview — story library and read-aloud access. Student rosters are coming soon."
            actions={<ClassroomDetailNav onBack={handleBack} />}
          />

          <div className="mx-auto max-w-2xl space-y-8 px-1 sm:px-0">
            <SectionCard title="Overview">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Age range
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {getClassroomAgeRangeLabel(classroom.ageRange)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Language
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {getClassroomLanguageLabel(classroom.language)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {formatClassroomDate(classroom.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Last updated
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {formatClassroomDate(classroom.updatedAt)}
                  </dd>
                </div>
              </dl>
            </SectionCard>

            <ClassroomStoryLibrary
              stories={storyLibrary.stories}
              filteredStories={storyLibrary.filteredStories}
              search={storyLibrary.filters.search}
              status={storyLibrary.filters.status}
              onSearchChange={storyLibrary.setSearch}
              onStatusChange={storyLibrary.setStatus}
              isLoading={storyLibrary.isLoading}
              error={storyLibrary.error}
              hasActiveFilters={storyLibrary.hasActiveFilters}
              removingStoryId={storyLibrary.removingStoryId}
              onReload={() => void storyLibrary.reload()}
              onClearFilters={storyLibrary.clearFilters}
              onRemoveStory={handleRemoveStory}
            />
            <ClassroomStudentsPlaceholder />

            <SectionCard title="Need to refresh?">
              <p className="text-sm text-stone-600">
                If you expected changes here, reload the classroom. Full editing will arrive in a
                later release.
              </p>
              <button
                type="button"
                onClick={() => {
                  reload()
                  void storyLibrary.reload()
                }}
                className="mt-3 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                Reload classroom
              </button>
            </SectionCard>
          </div>
        </>
      ) : null}
    </ClassroomDetailLoadGuard>
  )
}

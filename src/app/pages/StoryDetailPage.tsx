import { Link, useParams } from 'react-router-dom'
import { AppButton, PageHeader } from '@/shared/components'
import {
  formatStoryDate,
  getStoryProjectStatusLabel,
  getStoryStatusBadgeClasses,
  StoryReadOnlyView,
} from '@/features/stories'
import { getAgeRangeLabel } from '@/features/stories/utils/storySetupForm'
import { StoryLoadGuardView } from './story/StoryLoadGuardView'
import { useStoryGeneratedLoader } from './story/useStoryGeneratedLoader'

export function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const { status, loaded, presentation, isAuthLoading } = useStoryGeneratedLoader(storyId)

  return (
    <StoryLoadGuardView
      pageTitle="Story"
      pageDescription="View a saved story from this device or your account."
      status={status}
      presentation={presentation}
      isAuthLoading={isAuthLoading}
    >
      {loaded && (
        <>
          <PageHeader title={loaded.draft.title} description="Saved story preview." />

          <div className="mx-auto max-w-2xl space-y-6">
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-stone-900">{loaded.draft.title}</h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStoryStatusBadgeClasses(getStoryProjectStatusLabel(loaded.draft))}`}
                  >
                    {getStoryProjectStatusLabel(loaded.draft)}
                  </span>
                </div>
                <Link to={`/dashboard/stories/${encodeURIComponent(loaded.draft.id)}/edit`}>
                  <AppButton type="button" variant="secondary">
                    Edit story
                  </AppButton>
                </Link>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-stone-500">Theme</dt>
                  <dd className="text-stone-800">{loaded.draft.theme}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-stone-500">Age range</dt>
                  <dd className="text-stone-800">{getAgeRangeLabel(loaded.draft.ageRange)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-stone-500">Language</dt>
                  <dd className="text-stone-800">{loaded.draft.language}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-stone-500">Updated</dt>
                  <dd className="text-stone-800">{formatStoryDate(loaded.draft.updatedAt)}</dd>
                </div>
              </dl>
            </div>

            <StoryReadOnlyView story={loaded.generatedStory} />
          </div>
        </>
      )}
    </StoryLoadGuardView>
  )
}

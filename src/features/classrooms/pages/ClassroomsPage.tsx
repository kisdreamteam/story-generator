import { useNavigate } from 'react-router-dom'
import { dashboardPageStackClass } from '@/shared/styles/pageShellClasses'
import {
  AppButton,
  AppErrorState,
  AppLoadingState,
  PageHeader,
  SectionCard,
} from '@/shared/components'
import {
  ClassroomCard,
  ClassroomCreatePlaceholder,
  ClassroomEmptyState,
} from '../components'
import { useClassroomList } from '../hooks'
import { classroomCountLabel } from '../lib/classroomFormat'

export function ClassroomsPage() {
  const navigate = useNavigate()
  const { classrooms, isLoading, error, reload } = useClassroomList()

  function handleOpenClassroom(classroomId: string) {
    navigate(`/dashboard/classrooms/${encodeURIComponent(classroomId)}`)
  }

  function handleBrowseStories() {
    navigate('/dashboard/stories')
  }

  return (
    <>
      <PageHeader
        title="Your classrooms"
        description="Organize classes and prepare shared story access. Student accounts are not required."
      />

      <div className={dashboardPageStackClass}>
        <ClassroomCreatePlaceholder />

        <SectionCard
          title="Classroom library"
          description={
            isLoading
              ? 'Loading your classrooms…'
              : classrooms.length > 0
                ? classroomCountLabel(classrooms.length)
                : 'No classrooms yet'
          }
        >
          {isLoading ? (
            <AppLoadingState kind="classroom-library" />
          ) : error ? (
            <AppErrorState presentation={error}>
              <AppButton type="button" variant="secondary" onClick={reload}>
                Try again
              </AppButton>
            </AppErrorState>
          ) : classrooms.length === 0 ? (
            <ClassroomEmptyState kind="classroom-library-empty" onAction={handleBrowseStories} />
          ) : (
            <ul className="space-y-3" aria-label="Your classrooms">
              {classrooms.map((classroom) => (
                <li key={classroom.id}>
                  <ClassroomCard
                    classroom={classroom}
                    onOpenClassroom={handleOpenClassroom}
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  )
}

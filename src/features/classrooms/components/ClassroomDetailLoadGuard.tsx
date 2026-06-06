import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton, AppEmptyState, AppErrorState, AppLoadingState, PageHeader } from '@/shared/components'
import type { ClassroomLoadErrorPresentation, ClassroomLoadStatus } from '../types'

interface ClassroomDetailLoadGuardProps {
  status: ClassroomLoadStatus
  presentation: ClassroomLoadErrorPresentation | null
  pageTitle?: string
  pageDescription?: string
  children: ReactNode
}

export function ClassroomDetailLoadGuard({
  status,
  presentation,
  pageTitle = 'Classroom',
  pageDescription = 'Open a classroom from Your classrooms.',
  children,
}: ClassroomDetailLoadGuardProps) {
  const navigate = useNavigate()

  function goToClassrooms() {
    navigate('/dashboard/classrooms')
  }

  if (status === 'loading') {
    return (
      <>
        <PageHeader title={pageTitle} description={pageDescription} />
        <div className="mx-auto max-w-2xl">
          <AppLoadingState kind="classroom-detail" />
        </div>
      </>
    )
  }

  if (status === 'ready') {
    return <>{children}</>
  }

  const copy = presentation ?? {
    title: 'Classroom not found',
    description: 'We could not find this classroom. Return to Your classrooms and try again.',
  }

  return (
    <>
      <PageHeader title={pageTitle} description={pageDescription} />

      <div className="mx-auto max-w-2xl">
        {status === 'error' ? (
          <AppErrorState presentation={copy}>
            <AppButton type="button" onClick={goToClassrooms}>
              Back to classrooms
            </AppButton>
          </AppErrorState>
        ) : (
          <AppEmptyState
            kind="classroom-not-found"
            title={copy.title}
            description={copy.description}
            actionLabel="Back to classrooms"
            onAction={goToClassrooms}
          />
        )}
      </div>
    </>
  )
}

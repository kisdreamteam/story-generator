import { useNavigate } from 'react-router-dom'
import { AppButton, AppEmptyState, LoadingCard, SectionCard } from '@/shared/components'
import type { Classroom } from '../types'

export interface AssignStoryToClassroomPanelProps {
  classrooms: Classroom[]
  selectedClassroomIds: string[]
  isLoading?: boolean
  isSaving?: boolean
  isDirty?: boolean
  onToggleClassroom: (classroomId: string) => void
  onSave: () => void
  onCancel: () => void
}

export function AssignStoryToClassroomPanel({
  classrooms,
  selectedClassroomIds,
  isLoading = false,
  isSaving = false,
  isDirty = false,
  onToggleClassroom,
  onSave,
  onCancel,
}: AssignStoryToClassroomPanelProps) {
  const navigate = useNavigate()

  return (
    <SectionCard
      title="Assign to classrooms"
      description="Choose one or more classrooms for this story. Assignments are saved on this device for now."
    >
      {isLoading ? (
        <LoadingCard
          variant="compact"
          showAction={false}
          title="Loading classrooms"
          description="Fetching your classroom list…"
          ariaLabel="Loading classrooms"
        />
      ) : classrooms.length === 0 ? (
        <AppEmptyState
          kind="classroom-library-empty"
          layout="section"
          title="No classrooms yet"
          description="Classroom setup is coming soon. When classrooms are available, return here to assign this story."
          actionLabel="Go to classrooms"
          onAction={() => navigate('/dashboard/classrooms')}
        />
      ) : (
        <div className="space-y-4">
          <ul className="space-y-2" aria-label="Available classrooms">
            {classrooms.map((classroom) => {
              const checked = selectedClassroomIds.includes(classroom.id)

              return (
                <li key={classroom.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 px-3 py-3 hover:border-stone-300">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                      checked={checked}
                      onChange={() => onToggleClassroom(classroom.id)}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-stone-900">{classroom.name}</span>
                      <span className="mt-0.5 block text-xs text-stone-500">
                        Ages {classroom.ageRange} · {classroom.language}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row">
            <AppButton
              type="button"
              onClick={onSave}
              disabled={!isDirty || isSaving}
              fullWidth
              className="sm:w-auto"
            >
              {isSaving ? 'Saving…' : 'Save assignments'}
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSaving}
              fullWidth
              className="sm:w-auto"
            >
              Cancel
            </AppButton>
          </div>
        </div>
      )}
    </SectionCard>
  )
}

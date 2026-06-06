import { Link } from 'react-router-dom'
import { AppEmptyState, LoadingCard, SectionCard } from '@/shared/components'
import type { Classroom } from '../types'
import { getClassroomAgeRangeLabel } from '../lib/classroomFormat'

export interface StoryClassroomsSectionProps {
  assignedClassrooms: Classroom[]
  isLoading?: boolean
}

export function StoryClassroomsSection({
  assignedClassrooms,
  isLoading = false,
}: StoryClassroomsSectionProps) {
  return (
    <SectionCard
      title="Classrooms"
      description="Classrooms where this story is assigned."
    >
      {isLoading ? (
        <LoadingCard
          variant="compact"
          showAction={false}
          title="Loading assignments"
          description="Checking classroom links for this story…"
          ariaLabel="Loading classroom assignments"
        />
      ) : assignedClassrooms.length === 0 ? (
        <AppEmptyState kind="story-classroom-assignments-empty" layout="section" />
      ) : (
        <ul className="space-y-2" aria-label="Assigned classrooms">
          {assignedClassrooms.map((classroom) => (
            <li key={classroom.id}>
              <Link
                to={`/dashboard/classrooms/${encodeURIComponent(classroom.id)}`}
                className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
              >
                <span>
                  <span className="block text-sm font-medium text-stone-900">{classroom.name}</span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {getClassroomAgeRangeLabel(classroom.ageRange)} · {classroom.language}
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

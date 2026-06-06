import { memo } from 'react'
import { AppButton, AppCard } from '@/shared/components'
import type { Classroom } from '../types'
import {
  formatClassroomDate,
  getClassroomAgeRangeLabel,
  getClassroomLanguageLabel,
} from '../lib/classroomFormat'

interface ClassroomCardProps {
  classroom: Classroom
  onOpenClassroom?: (classroomId: string) => void
}

function buildClassroomMetaLine(classroom: Classroom): string {
  const ageRange = getClassroomAgeRangeLabel(classroom.ageRange)
  const language = getClassroomLanguageLabel(classroom.language)
  const created = formatClassroomDate(classroom.createdAt)

  return `${ageRange} · ${language} · Created ${created}`
}

export const ClassroomCard = memo(function ClassroomCard({
  classroom,
  onOpenClassroom,
}: ClassroomCardProps) {
  const showUpdated =
    classroom.updatedAt !== classroom.createdAt &&
    formatClassroomDate(classroom.updatedAt) !== formatClassroomDate(classroom.createdAt)

  return (
    <AppCard padding="md" className="border-stone-200 transition-colors hover:border-stone-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-base font-semibold leading-snug text-stone-900">{classroom.name}</h3>
          <p className="text-sm leading-relaxed text-stone-600">{buildClassroomMetaLine(classroom)}</p>

          {showUpdated ? (
            <p className="text-xs text-stone-500">
              Last updated {formatClassroomDate(classroom.updatedAt)}
            </p>
          ) : null}
        </div>

        {onOpenClassroom ? (
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => onOpenClassroom(classroom.id)}
              fullWidth
              className="sm:w-auto"
            >
              Open classroom
            </AppButton>
          </div>
        ) : null}
      </div>
    </AppCard>
  )
})

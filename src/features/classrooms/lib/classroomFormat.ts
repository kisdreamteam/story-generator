import { getAgeRangeLabel, getLanguageLabel } from '@/features/story-projects/config/formOptions'

export function formatClassroomDate(iso: string): string {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function classroomCountLabel(count: number): string {
  if (count === 1) return '1 classroom'
  return `${count} classrooms`
}

export function getClassroomAgeRangeLabel(value: string): string {
  return getAgeRangeLabel(value)
}

export function getClassroomLanguageLabel(value: string): string {
  return getLanguageLabel(value)
}

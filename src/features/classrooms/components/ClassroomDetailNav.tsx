import { AppButton } from '@/shared/components'

interface ClassroomDetailNavProps {
  onBack: () => void
}

export function ClassroomDetailNav({ onBack }: ClassroomDetailNavProps) {
  return (
    <AppButton type="button" variant="secondary" onClick={onBack}>
      Back to classrooms
    </AppButton>
  )
}

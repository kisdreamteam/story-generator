import { AppEmptyState } from '@/shared/components'
import type { AppEmptyStateKind } from '@/shared/components/states/emptyStatePresets'

export interface ClassroomEmptyStateProps {
  kind: Extract<AppEmptyStateKind, 'classroom-library-empty' | 'classroom-not-found'>
  onAction?: () => void
}

/** Classroom-specific empty states built on shared presets. */
export function ClassroomEmptyState({ kind, onAction }: ClassroomEmptyStateProps) {
  return <AppEmptyState kind={kind} onAction={onAction} />
}

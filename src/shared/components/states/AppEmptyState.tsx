import type { ReactNode } from 'react'
import { EmptyState, type EmptyStateProps } from '../EmptyState'
import {
  getAppEmptyStatePreset,
  type AppEmptyStateKind,
  type AppEmptyStatePresetOptions,
} from './emptyStatePresets'

export interface AppEmptyStateProps
  extends Omit<EmptyStateProps, 'title' | 'description' | 'hints' | 'actionLabel' | 'onAction'>,
    AppEmptyStatePresetOptions {
  kind: AppEmptyStateKind
  title?: string
  description?: string
  hints?: string[]
  actionLabel?: string
  onAction?: () => void
  children?: ReactNode
}

/** Preset empty states for story flows — single source for library, detail, and editor shells. */
export function AppEmptyState({
  kind,
  hasStoryPlans,
  title,
  description,
  hints,
  actionLabel,
  onAction,
  children,
  layout,
  showIcon,
  className,
}: AppEmptyStateProps) {
  const preset = getAppEmptyStatePreset(kind, { hasStoryPlans })

  return (
    <EmptyState
      layout={layout ?? preset.layout ?? 'card'}
      showIcon={showIcon ?? preset.showIcon ?? false}
      title={title ?? preset.title}
      description={description ?? preset.description}
      hints={hints ?? preset.hints}
      actionLabel={actionLabel ?? preset.actionLabel}
      onAction={onAction}
      className={className}
    >
      {children}
    </EmptyState>
  )
}

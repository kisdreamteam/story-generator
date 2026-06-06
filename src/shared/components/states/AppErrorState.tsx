import type { ReactNode } from 'react'
import { ErrorState } from '../ErrorState'
import {
  getAppErrorStatePreset,
  presentationToErrorPreset,
  type AppErrorStateKind,
  type AppErrorStatePresetOptions,
} from './errorStatePresets'
import type { StoryLoadErrorPresentation } from '@/features/story-generator/lib/story-route-guards'

export interface AppErrorStateProps extends AppErrorStatePresetOptions {
  kind?: AppErrorStateKind
  /** Use classified route-guard copy instead of a preset kind. */
  presentation?: StoryLoadErrorPresentation | null
  title?: string
  description?: string
  variant?: 'panel' | 'inline'
  tone?: 'error' | 'warning' | 'info'
  children?: ReactNode
  className?: string
}

/** Preset error states for storage, migration, and missing-story flows. */
export function AppErrorState({
  kind = 'generic',
  presentation,
  signedIn,
  error,
  failedCount,
  copiedCount,
  title,
  description,
  variant,
  tone,
  children,
  className,
}: AppErrorStateProps) {
  const preset = presentation
    ? presentationToErrorPreset(presentation)
    : getAppErrorStatePreset(kind, { signedIn, error, failedCount, copiedCount })

  const resolvedVariant = variant ?? preset.variant ?? 'panel'
  const resolvedTone = tone ?? preset.tone ?? 'error'

  if (className && resolvedVariant === 'panel') {
    return (
      <div className={className}>
        <ErrorState
          variant={resolvedVariant}
          tone={resolvedTone}
          title={title ?? preset.title}
          description={description ?? preset.description}
        >
          {children}
        </ErrorState>
      </div>
    )
  }

  return (
    <ErrorState
      variant={resolvedVariant}
      tone={resolvedTone}
      title={title ?? preset.title}
      description={description ?? preset.description}
    >
      {children}
    </ErrorState>
  )
}

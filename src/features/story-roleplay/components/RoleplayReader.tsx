import type { RoleplayScript } from '../types'
import { useRoleplayReader } from '../hooks/useRoleplayReader'
import { RoleplayReaderFullScript } from './RoleplayReaderFullScript'
import { RoleplayReaderLineCard } from './RoleplayReaderLineCard'
import { RoleplayReaderNavigation } from './RoleplayReaderNavigation'
import { RoleplayReaderViewToggle } from './RoleplayReaderViewToggle'

export interface RoleplayReaderProps {
  script: RoleplayScript
  className?: string
}

export function RoleplayReader({ script, className = '' }: RoleplayReaderProps) {
  const reader = useRoleplayReader(script)

  function handleSelectLine(index: number) {
    reader.goToIndex(index)
    reader.setView('step')
  }

  return (
    <div className={['space-y-6', className].filter(Boolean).join(' ')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-stone-900 sm:text-2xl">{script.title}</h2>
          {script.summary ? (
            <p className="mt-1 text-sm leading-relaxed text-stone-600 sm:text-base">{script.summary}</p>
          ) : null}
        </div>
        <RoleplayReaderViewToggle view={reader.view} onViewChange={reader.setView} />
      </div>

      {reader.view === 'step' ? (
        <div className="space-y-6">
          {reader.currentLine ? (
            <RoleplayReaderLineCard line={reader.currentLine} />
          ) : (
            <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-10 text-center text-stone-600">
              This story does not have any roleplay lines yet.
            </p>
          )}

          {reader.totalLines > 0 ? (
            <RoleplayReaderNavigation
              canGoPrevious={reader.canGoPrevious}
              canGoNext={reader.canGoNext}
              progressLabel={reader.progressLabel}
              progressPercent={reader.progressPercent}
              onPrevious={reader.goPrevious}
              onNext={reader.goNext}
            />
          ) : null}
        </div>
      ) : (
        <RoleplayReaderFullScript
          script={script}
          activeLineId={reader.currentLine?.id}
          onSelectLine={handleSelectLine}
        />
      )}
    </div>
  )
}

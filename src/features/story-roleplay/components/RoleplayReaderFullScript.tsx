import type { RoleplayScript } from '../types'
import { getRoleplayRoleLabel, getRoleplayRoleToneClasses } from '../lib/roleplayRoleDisplay'
import { RoleplayScriptLine } from './RoleplayScriptLine'

export interface RoleplayReaderFullScriptProps {
  script: RoleplayScript
  activeLineId?: string
  onSelectLine?: (index: number) => void
}

export function RoleplayReaderFullScript({
  script,
  activeLineId,
  onSelectLine,
}: RoleplayReaderFullScriptProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <h2 className="text-lg font-semibold text-stone-900">Cast</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {script.cast.map((role) => (
            <span
              key={role}
              className={[
                'inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 sm:text-sm',
                getRoleplayRoleToneClasses(role),
              ].join(' ')}
            >
              {getRoleplayRoleLabel(role)}
            </span>
          ))}
        </div>
      </section>

      {script.sections.map((section) => (
        <section key={section.pageNumber} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            {section.label}
          </h2>
          <div className="space-y-3">
            {section.lines.map((line) => {
              const lineIndex = script.lines.findIndex((item) => item.id === line.id)
              const isActive = line.id === activeLineId

              return (
                <button
                  key={line.id}
                  type="button"
                  className={[
                    'w-full rounded-xl text-left transition-colors',
                    isActive ? 'ring-2 ring-brand-500 ring-offset-2' : '',
                    onSelectLine ? 'cursor-pointer hover:opacity-95' : 'cursor-default',
                  ].join(' ')}
                  onClick={
                    onSelectLine && lineIndex >= 0 ? () => onSelectLine(lineIndex) : undefined
                  }
                >
                  <RoleplayScriptLine line={line} />
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

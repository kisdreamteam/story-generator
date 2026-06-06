import type { RoleplayLine } from '../types'
import { getRoleplayRoleLabel, getRoleplayRoleToneClasses } from '../lib/roleplayRoleDisplay'

export function RoleplayScriptLine({ line }: { line: RoleplayLine }) {
  const isNarrator = line.role === 'narrator'

  return (
    <div className="break-inside-avoid rounded-xl border border-stone-200 bg-white px-4 py-3 print:border-stone-300 print:py-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <span
          className={[
            'inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 print:ring-0',
            getRoleplayRoleToneClasses(line.role),
          ].join(' ')}
        >
          {getRoleplayRoleLabel(line.role)}
        </span>
        <p
          className={[
            'min-w-0 flex-1 text-base leading-relaxed text-stone-900 print:text-[13pt]',
            isNarrator ? 'italic text-stone-700' : 'font-medium',
          ].join(' ')}
        >
          {isNarrator ? line.text : `“${line.text}”`}
        </p>
      </div>
    </div>
  )
}

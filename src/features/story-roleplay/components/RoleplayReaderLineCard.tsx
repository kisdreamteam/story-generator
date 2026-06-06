import type { RoleplayLine } from '../types'
import {
  getRoleplayRoleLabel,
  getRoleplayRoleToneClasses,
} from '../lib/roleplayRoleDisplay'

export interface RoleplayReaderLineCardProps {
  line: RoleplayLine
}

export function RoleplayReaderLineCard({ line }: RoleplayReaderLineCardProps) {
  const isNarrator = line.role === 'narrator'
  const roleLabel = getRoleplayRoleLabel(line.role)

  return (
    <article
      className={[
        'rounded-3xl border px-5 py-8 shadow-sm sm:px-10 sm:py-12',
        isNarrator
          ? 'border-stone-200 bg-stone-50/90'
          : 'border-stone-200 bg-white',
      ].join(' ')}
      aria-label={`${roleLabel} line`}
    >
      <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-stone-500 sm:text-left">
        Scene {line.pageNumber}
      </p>

      <div className="mt-5 flex flex-col items-center gap-4 sm:items-start">
        <span
          className={[
            'inline-flex rounded-full px-4 py-2 text-sm font-semibold ring-1 sm:text-base',
            getRoleplayRoleToneClasses(line.role),
          ].join(' ')}
        >
          {roleLabel}
        </span>

        <p
          className={[
            'max-w-3xl text-center text-2xl leading-[1.55] sm:text-left sm:text-4xl sm:leading-[1.45]',
            isNarrator ? 'italic font-normal text-stone-600' : 'font-semibold text-stone-900',
          ].join(' ')}
        >
          {isNarrator ? line.text : `“${line.text}”`}
        </p>
      </div>
    </article>
  )
}

import type { RoleplayScript } from '../types'
import {
  getRoleplayRoleLabel,
  getRoleplayRoleToneClasses,
  ROLEPLAY_CAST_HINTS,
} from '../lib/roleplayRoleDisplay'
import { RoleplayScriptLine } from './RoleplayScriptLine'

export interface RoleplayScriptDocumentProps {
  script: RoleplayScript
}

export function RoleplayScriptDocument({ script }: RoleplayScriptDocumentProps) {
  return (
    <div id="roleplay-print-area" className="space-y-8">
      <header className="rounded-2xl border border-stone-200 bg-white px-5 py-6 shadow-sm print:border-stone-300 print:shadow-none sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 print:text-stone-700">
          Classroom roleplay script
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900 print:text-[22pt] sm:text-3xl">
          {script.title}
        </h1>
        {script.summary ? (
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-stone-600 print:text-[11pt]">
            {script.summary}
          </p>
        ) : null}
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white px-5 py-6 shadow-sm print:border-stone-300 print:shadow-none sm:px-8">
        <h2 className="text-lg font-semibold text-stone-900 print:text-[14pt]">Cast</h2>
        <p className="mt-1 text-sm text-stone-600 print:text-[10pt]">
          Assign these roles before you read. Narrator lines can be shared or read by the teacher.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {script.cast.map((role) => (
            <li
              key={role}
              className="rounded-xl border border-stone-100 bg-stone-50/80 px-4 py-3 print:border-stone-200 print:bg-white"
            >
              <span
                className={[
                  'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 print:ring-0',
                  getRoleplayRoleToneClasses(role),
                ].join(' ')}
              >
                {getRoleplayRoleLabel(role)}
              </span>
              <p className="mt-2 text-sm text-stone-600 print:text-[10pt]">{ROLEPLAY_CAST_HINTS[role]}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-8">
        {script.sections.map((section) => (
          <section key={section.pageNumber} className="space-y-3 break-inside-avoid-page">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 print:text-[10pt]">
              {section.label}
            </h2>
            <div className="space-y-3">
              {section.lines.map((line) => (
                <RoleplayScriptLine key={line.id} line={line} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

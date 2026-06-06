import type { ReactNode } from 'react'

interface SetupFieldChromeProps {
  label: string
  required?: boolean
  optional?: boolean
  ideasButton?: boolean
  ideasButtonSlot?: ReactNode
  children: ReactNode
}

export function SetupFieldChrome({
  label,
  required = false,
  optional = false,
  ideasButton = false,
  ideasButtonSlot,
  children,
}: SetupFieldChromeProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-stone-700">{label}</span>
          {required && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              Required
            </span>
          )}
          {optional && (
            <span className="text-xs text-stone-400">Optional</span>
          )}
        </div>
        {ideasButton && ideasButtonSlot}
      </div>
      {children}
    </div>
  )
}

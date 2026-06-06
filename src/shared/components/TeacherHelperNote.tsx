import type { ReactNode } from 'react'

interface TeacherHelperNoteProps {
  children: ReactNode
  className?: string
  /** Section intro (default) or smaller text under actions. */
  variant?: 'default' | 'subtle'
}

export function TeacherHelperNote({
  children,
  className = '',
  variant = 'default',
}: TeacherHelperNoteProps) {
  const styles =
    variant === 'subtle'
      ? 'text-xs leading-relaxed text-stone-500'
      : 'rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm leading-relaxed text-stone-600'

  return <p className={`${styles} ${className}`.trim()}>{children}</p>
}

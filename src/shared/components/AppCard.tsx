import type { HTMLAttributes, ReactNode } from 'react'
import { panelShellClass } from '@/shared/styles/surfaceClasses'

interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function AppCard({
  children,
  padding = 'md',
  hoverable = false,
  className = '',
  ...props
}: AppCardProps) {
  return (
    <div
      className={[
        `${panelShellClass} shadow-sm`,
        paddingClasses[padding],
        hoverable ? 'transition-shadow hover:shadow-md' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

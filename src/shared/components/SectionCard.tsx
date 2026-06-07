import type { ReactNode } from 'react'
import { AppCard } from './AppCard'

interface SectionCardProps {
  title: string
  description?: string
  children: ReactNode
  badge?: ReactNode
  className?: string
}

export function SectionCard({ title, description, children, badge, className = '' }: SectionCardProps) {
  return (
    <AppCard className={className}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-stone-600">{description}</p>}
        </div>
        {badge}
      </div>
      {children}
    </AppCard>
  )
}

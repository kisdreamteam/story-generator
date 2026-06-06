import type { ReactNode } from 'react'

/** Groups generated story sections (pages, cards, prompts) with consistent spacing. */
export function StoryGeneratedContentSections({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8 border-t border-stone-200 pt-8">
      <p className="text-sm font-medium text-stone-700">Classroom story content</p>
      {children}
    </div>
  )
}

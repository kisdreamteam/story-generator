import { AppCard, SectionCard } from '../../../shared/components'
import type { GeneratedStoryPage } from '../types'
import { StoryPageActions } from './StoryPageActions'

interface StoryPageListProps {
  pages: GeneratedStoryPage[]
}

export function StoryPageList({ pages }: StoryPageListProps) {
  return (
    <SectionCard
      title="Story Pages"
      description={`${pages.length} pages — review text and teaching focus before publishing`}
    >
      <div className="space-y-4">
        {pages.map((page) => (
          <AppCard
            key={page.pageNumber}
            padding="sm"
            className="border-stone-200 bg-white shadow-none"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {page.pageNumber}
                </span>
                <span className="text-sm font-medium text-stone-700">
                  Page {page.pageNumber}
                </span>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                {page.wordCount} {page.wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-800">{page.text}</p>
            <p className="mt-3 text-xs text-stone-500">
              <span className="font-medium text-stone-600">Teaching focus:</span>{' '}
              {page.teachingFocus}
            </p>
            <StoryPageActions />
          </AppCard>
        ))}
      </div>
    </SectionCard>
  )
}

import { SectionCard } from '@/shared/components'
import { StoryDetailSectionFallback } from './StoryDetailSectionFallback'
import { StoryPageReadCard } from './StoryPageReadCard'
import type { StoryPagesProps } from './types'

export function StoryPages({
  pages,
  imagePrompts = [],
  showImageActions = false,
  isPageGenerating,
  onRegeneratePageImage,
}: StoryPagesProps) {
  return (
    <SectionCard
      title="Story for your class"
      description="Read aloud, project for shared reading, or print for small groups."
    >
      {pages.length === 0 ? (
        <StoryDetailSectionFallback message="No story pages yet. Continue in the creator to generate your classroom story." />
      ) : (
        <div className="space-y-5">
          {pages.map((page) => (
            <StoryPageReadCard
              key={page.pageNumber}
              page={page}
              imagePrompts={imagePrompts}
              showImageActions={showImageActions}
              isGenerating={isPageGenerating?.(page.pageNumber) ?? false}
              onRegenerate={
                onRegeneratePageImage
                  ? () => onRegeneratePageImage(page.pageNumber)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </SectionCard>
  )
}

import { AppCard, SectionCard } from '@/shared/components'
import { displayDetailValue } from '../../utils/storyDetailView'
import { StoryDetailSectionFallback } from './StoryDetailSectionFallback'
import type { StoryImagePromptsProps } from './types'

export function StoryImagePrompts({ imagePrompts }: StoryImagePromptsProps) {
  return (
    <SectionCard
      title="Illustration ideas"
      description="Art notes for each page — helpful if you add pictures or slides later."
    >
      {imagePrompts.length === 0 ? (
        <StoryDetailSectionFallback message="No illustration prompts were saved for this story." />
      ) : (
        <div className="space-y-4">
          {imagePrompts.map((item) => (
            <AppCard key={item.pageNumber} padding="md" className="border-stone-200 bg-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Page {item.pageNumber}
              </p>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-stone-500">Illustration</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-800 sm:text-base">
                    {displayDetailValue(item.prompt, 'No illustration note for this page.')}
                  </p>
                </div>
                <div className="rounded-lg border border-stone-100 bg-stone-50/80 px-3 py-2.5">
                  <p className="text-xs font-medium text-stone-500">Keep characters consistent</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-700">
                    {displayDetailValue(item.continuityReminder, 'No continuity note provided.')}
                  </p>
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

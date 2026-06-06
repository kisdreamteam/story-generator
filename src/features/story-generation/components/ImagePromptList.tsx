import { SectionCard } from '../../../shared/components'
import type { GeneratedImagePrompt } from '../types'

interface ImagePromptListProps {
  imagePrompts: GeneratedImagePrompt[]
}

export function ImagePromptList({ imagePrompts }: ImagePromptListProps) {
  return (
    <SectionCard
      title="Image Prompts"
      description="Illustration-ready prompts — styled as expandable cards for future editing"
    >
      <div className="space-y-3">
        {imagePrompts.map((item) => (
          <div
            key={item.pageNumber}
            className="overflow-hidden rounded-lg border border-stone-200 bg-white"
          >
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 bg-stone-50 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-stone-800">
                  Page {item.pageNumber} — Image Prompt
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 text-xs text-stone-600 ring-1 ring-stone-200">
                  Continuity
                </span>
              </div>
              <span className="text-xs text-stone-400" aria-hidden="true">
                ▾
              </span>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed text-stone-700">{item.prompt}</p>
              <p className="mt-3 border-t border-stone-100 pt-3 text-xs text-stone-500">
                <span className="font-medium text-stone-600">Continuity reminder:</span>{' '}
                {item.continuityReminder}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

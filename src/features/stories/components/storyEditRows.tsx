import { memo } from 'react'
import { AppCard, AppInput, AppTextarea } from '@/shared/components'
import type { StoryFlashcard, StoryImagePrompt, StoryPage } from '../types'

interface StoryEditPageRowProps {
  page: StoryPage
  onPageTextChange: (pageNumber: number, text: string) => void
}

/**
 * Single editable story page — memoized so typing in one page does not re-render
 * every textarea in a typical 12-page classroom story.
 */
export const StoryEditPageRow = memo(function StoryEditPageRow({
  page,
  onPageTextChange,
}: StoryEditPageRowProps) {
  return (
    <AppCard padding="sm" className="border-stone-200 bg-stone-50/50">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-stone-700">Page {page.pageNumber}</span>
        <span className="text-xs text-stone-500">{page.wordCount} words</span>
      </div>
      <AppTextarea
        label={`Page ${page.pageNumber} text`}
        value={page.text}
        onChange={(event) => onPageTextChange(page.pageNumber, event.target.value)}
        className="min-h-[120px]"
      />
      <p className="mt-2 text-xs text-stone-500">
        <span className="font-medium text-stone-600">Teaching focus:</span> {page.teachingFocus}
      </p>
    </AppCard>
  )
})

interface StoryEditFlashcardRowProps {
  card: StoryFlashcard
  index: number
  onFlashcardChange: (index: number, patch: Partial<StoryFlashcard>) => void
}

export const StoryEditFlashcardRow = memo(function StoryEditFlashcardRow({
  card,
  index,
  onFlashcardChange,
}: StoryEditFlashcardRowProps) {
  return (
    <AppCard padding="sm" className="border-stone-200 bg-white">
      <AppInput
        label="Word"
        value={card.word}
        onChange={(event) => onFlashcardChange(index, { word: event.target.value })}
      />
      <div className="mt-3">
        <AppTextarea
          label="Definition"
          value={card.simpleDefinition}
          onChange={(event) => onFlashcardChange(index, { simpleDefinition: event.target.value })}
          className="min-h-[72px]"
        />
      </div>
      <div className="mt-3">
        <AppTextarea
          label="Example sentence"
          value={card.exampleSentence}
          onChange={(event) => onFlashcardChange(index, { exampleSentence: event.target.value })}
          className="min-h-[72px]"
        />
      </div>
    </AppCard>
  )
})

interface StoryEditImagePromptRowProps {
  item: StoryImagePrompt
  onImagePromptChange: (pageNumber: number, patch: Partial<StoryImagePrompt>) => void
}

export const StoryEditImagePromptRow = memo(function StoryEditImagePromptRow({
  item,
  onImagePromptChange,
}: StoryEditImagePromptRowProps) {
  return (
    <AppCard padding="sm" className="border-stone-200 bg-white">
      <AppTextarea
        label={`Page ${item.pageNumber} prompt`}
        value={item.prompt}
        onChange={(event) => onImagePromptChange(item.pageNumber, { prompt: event.target.value })}
        className="min-h-[80px]"
      />
      <div className="mt-3">
        <AppTextarea
          label="Continuity reminder"
          value={item.continuityReminder}
          onChange={(event) =>
            onImagePromptChange(item.pageNumber, { continuityReminder: event.target.value })
          }
          className="min-h-[64px]"
        />
      </div>
    </AppCard>
  )
})

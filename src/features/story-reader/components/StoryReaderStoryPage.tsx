import { StoryImage } from '@/features/story-images'
import { resolveStoryPageImageFields } from '@/features/story-images/lib/storyImageDisplay'
import type { StoryImagePrompt } from '@/features/stories/types'
import type { StoryReaderStorySlide } from '../types'

interface StoryReaderStoryPageProps {
  slide: StoryReaderStorySlide
  imagePrompts?: StoryImagePrompt[]
}

export function StoryReaderStoryPage({ slide, imagePrompts = [] }: StoryReaderStoryPageProps) {
  const { page, index, total } = slide
  const imageFields = resolveStoryPageImageFields(page, imagePrompts)

  return (
    <article className="mx-auto w-full max-w-2xl">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
          Page {index} of {total}
        </span>
        <span className="text-xs text-stone-500">{page.wordCount} words</span>
      </header>

      <StoryImage
        {...imageFields}
        alt={`Illustration for page ${page.pageNumber}`}
        className="mb-4"
      />

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="whitespace-pre-line text-lg leading-[1.85] text-stone-900 sm:text-xl">
          {page.text}
        </p>
      </div>

      {page.teachingFocus ? (
        <aside className="mt-4 rounded-xl border border-stone-100 bg-stone-50/90 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Teaching focus
          </p>
          <p className="mt-1 text-sm leading-relaxed text-stone-700">{page.teachingFocus}</p>
        </aside>
      ) : null}
    </article>
  )
}

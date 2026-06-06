import { StoryImage } from '@/features/story-images'
import { resolveStoryPageImageFields } from '@/features/story-images/lib/storyImageDisplay'
import type { StoryImagePrompt } from '@/features/stories/types'
import type { StudentStorySlide } from '../types'

interface StudentStoryPageViewProps {
  slide: Extract<StudentStorySlide, { kind: 'page' }>
  imagePrompts?: StoryImagePrompt[]
}

export function StudentStoryPageView({ slide, imagePrompts = [] }: StudentStoryPageViewProps) {
  const { page, index, total } = slide
  const imageFields = resolveStoryPageImageFields(page, imagePrompts)

  return (
    <article className="mx-auto w-full max-w-3xl">
      <figure className="mb-6 overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 shadow-sm">
        <StoryImage
          {...imageFields}
          alt={`Picture for page ${page.pageNumber}`}
          className="rounded-none border-0"
        />
      </figure>

      <div className="rounded-3xl bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-8">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-700">
          Page {index} of {total}
        </p>
        <p className="whitespace-pre-line text-2xl leading-[1.7] text-stone-900 sm:text-3xl sm:leading-[1.65]">
          {page.text}
        </p>
      </div>
    </article>
  )
}

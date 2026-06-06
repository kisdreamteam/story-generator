import type { GeneratedStory } from '../types'
import { TeacherHelperNote } from '@/shared/components'
import {
  StoryFlashcards,
  StoryGeneratedContentSections,
  StoryImagePrompts,
  StoryPages,
} from './story-detail'

interface StoryReadOnlyViewProps {
  story: GeneratedStory
  /** When true, shows that the story preview is not yet saved to the library. */
  showUnsavedHint?: boolean
  /** When true, shows a saved pill instead of the generic preview label. */
  savedToLibrary?: boolean
}

export function StoryReadOnlyView({
  story,
  showUnsavedHint = false,
  savedToLibrary = false,
}: StoryReadOnlyViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 sm:text-sm">
          {story.storyPages.length} pages
        </span>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 sm:text-sm">
          {story.totalWordCount} words
        </span>
        {showUnsavedHint ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200 sm:text-sm">
            Not saved yet
          </span>
        ) : savedToLibrary ? (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 sm:text-sm">
            Saved to library
          </span>
        ) : (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 sm:text-sm">
            Preview
          </span>
        )}
      </div>

      {story.summary && (
        <p className="text-sm leading-relaxed text-stone-600 sm:text-base">{story.summary}</p>
      )}

      {showUnsavedHint && (
        <TeacherHelperNote>
          This is a preview only. Save to Your stories when you are ready — you can still edit pages,
          vocabulary, and illustration notes afterward.
        </TeacherHelperNote>
      )}

      <StoryGeneratedContentSections>
        <StoryPages pages={story.storyPages} />
        <StoryFlashcards flashcards={story.flashcards} />
        <StoryImagePrompts imagePrompts={story.imagePrompts} />
      </StoryGeneratedContentSections>
    </div>
  )
}

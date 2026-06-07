import type { GeneratedStory } from '../types'
import { AppBadge, TeacherHelperNote } from '@/shared/components'
import {
  ImagePromptReviewPanel,
  type ImagePromptReviewPanelProps,
} from '@/features/story-images'
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
  /** When set, replaces read-only illustration notes with the review editor. */
  imagePromptReview?: Omit<ImagePromptReviewPanelProps, 'pages'>
}

export function StoryReadOnlyView({
  story,
  showUnsavedHint = false,
  savedToLibrary = false,
  imagePromptReview,
}: StoryReadOnlyViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <AppBadge>{story.storyPages.length} pages</AppBadge>
        <AppBadge>{story.totalWordCount} words</AppBadge>
        {showUnsavedHint ? (
          <AppBadge tone="warning">Not saved yet</AppBadge>
        ) : savedToLibrary ? (
          <AppBadge tone="brand">Saved to library</AppBadge>
        ) : (
          <AppBadge tone="brand">Preview</AppBadge>
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
        <StoryPages pages={story.storyPages} imagePrompts={story.imagePrompts} />
        <StoryFlashcards flashcards={story.flashcards} />
        {imagePromptReview ? (
          <ImagePromptReviewPanel pages={story.storyPages} {...imagePromptReview} />
        ) : (
          <StoryImagePrompts imagePrompts={story.imagePrompts} />
        )}
      </StoryGeneratedContentSections>
    </div>
  )
}

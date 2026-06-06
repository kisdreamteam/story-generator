import { SectionCard } from '../../../shared/components'
import type { GeneratedStory, StoryFlashcard, StoryImagePrompt } from '../types'
import {
  StoryEditFlashcardRow,
  StoryEditImagePromptRow,
  StoryEditPageRow,
} from './storyEditRows'

export interface StoryEditFormProps {
  story: GeneratedStory
  onPageTextChange: (pageNumber: number, text: string) => void
  onFlashcardChange: (index: number, patch: Partial<StoryFlashcard>) => void
  onImagePromptChange: (pageNumber: number, patch: Partial<StoryImagePrompt>) => void
}

export function StoryEditForm({
  story,
  onPageTextChange,
  onFlashcardChange,
  onImagePromptChange,
}: StoryEditFormProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Story pages"
        description="Edit page text. Word counts update automatically."
      >
        <div className="space-y-4">
          {story.storyPages.map((page) => (
            <StoryEditPageRow
              key={page.pageNumber}
              page={page}
              onPageTextChange={onPageTextChange}
            />
          ))}
        </div>
      </SectionCard>

      {story.flashcards.length > 0 && (
        <SectionCard title="Flashcards" description="Edit vocabulary on each card.">
          <div className="grid gap-3 sm:grid-cols-2">
            {story.flashcards.map((card, index) => (
              <StoryEditFlashcardRow
                key={`${card.word}-${index}`}
                card={card}
                index={index}
                onFlashcardChange={onFlashcardChange}
              />
            ))}
          </div>
        </SectionCard>
      )}

      {story.imagePrompts.length > 0 && (
        <SectionCard title="Image prompts" description="Edit illustration notes for each page.">
          <div className="space-y-3">
            {story.imagePrompts.map((item) => (
              <StoryEditImagePromptRow
                key={item.pageNumber}
                item={item}
                onImagePromptChange={onImagePromptChange}
              />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

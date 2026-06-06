import { AppCard, AppInput, AppTextarea, SectionCard } from '../../../shared/components'
import type { GeneratedStory } from '../types'
import { countStoryWords } from '../utils/storyEdit'

interface StoryEditFormProps {
  story: GeneratedStory
  onChange: (story: GeneratedStory) => void
}

export function StoryEditForm({ story, onChange }: StoryEditFormProps) {
  function updatePageText(pageNumber: number, text: string) {
    const storyPages = story.storyPages.map((page) =>
      page.pageNumber === pageNumber
        ? { ...page, text, wordCount: countStoryWords(text) }
        : page,
    )

    onChange({
      ...story,
      storyPages,
      totalWordCount: storyPages.reduce((sum, page) => sum + page.wordCount, 0),
    })
  }

  function updateFlashcardWord(index: number, word: string) {
    const flashcards = story.flashcards.map((card, cardIndex) =>
      cardIndex === index ? { ...card, word } : card,
    )

    onChange({ ...story, flashcards })
  }

  function updateImagePrompt(pageNumber: number, prompt: string) {
    const imagePrompts = story.imagePrompts.map((item) =>
      item.pageNumber === pageNumber ? { ...item, prompt } : item,
    )

    onChange({ ...story, imagePrompts })
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Story pages"
        description="Edit page text. Word counts update automatically."
      >
        <div className="space-y-4">
          {story.storyPages.map((page) => (
            <AppCard key={page.pageNumber} padding="sm" className="border-stone-200 bg-stone-50/50">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-stone-700">Page {page.pageNumber}</span>
                <span className="text-xs text-stone-500">{page.wordCount} words</span>
              </div>
              <AppTextarea
                label={`Page ${page.pageNumber} text`}
                value={page.text}
                onChange={(e) => updatePageText(page.pageNumber, e.target.value)}
                className="min-h-[120px]"
              />
              <p className="mt-2 text-xs text-stone-500">
                <span className="font-medium text-stone-600">Teaching focus:</span> {page.teachingFocus}
              </p>
            </AppCard>
          ))}
        </div>
      </SectionCard>

      {story.flashcards.length > 0 && (
        <SectionCard title="Flashcards" description="Edit vocabulary words shown on each card.">
          <div className="grid gap-3 sm:grid-cols-2">
            {story.flashcards.map((card, index) => (
              <AppCard key={`${card.word}-${index}`} padding="sm" className="border-stone-200 bg-white">
                <AppInput
                  label="Word"
                  value={card.word}
                  onChange={(e) => updateFlashcardWord(index, e.target.value)}
                />
                <p className="mt-3 text-sm text-stone-600">{card.simpleDefinition}</p>
                <p className="mt-2 text-xs italic text-stone-500">&ldquo;{card.exampleSentence}&rdquo;</p>
              </AppCard>
            ))}
          </div>
        </SectionCard>
      )}

      {story.imagePrompts.length > 0 && (
        <SectionCard title="Image prompts" description="Edit illustration notes for each page.">
          <div className="space-y-3">
            {story.imagePrompts.map((item) => (
              <AppCard key={item.pageNumber} padding="sm" className="border-stone-200 bg-white">
                <AppTextarea
                  label={`Page ${item.pageNumber} prompt`}
                  value={item.prompt}
                  onChange={(e) => updateImagePrompt(item.pageNumber, e.target.value)}
                  className="min-h-[80px]"
                />
                <p className="mt-2 text-xs text-stone-500">{item.continuityReminder}</p>
              </AppCard>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

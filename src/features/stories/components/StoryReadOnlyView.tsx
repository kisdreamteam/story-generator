import { AppCard, SectionCard } from '../../../shared/components'
import type { GeneratedStory } from '../types'

interface StoryReadOnlyViewProps {
  story: GeneratedStory
}

export function StoryReadOnlyView({ story }: StoryReadOnlyViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">
          {story.storyPages.length} pages
        </span>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">
          {story.totalWordCount} words
        </span>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
          Read-only preview
        </span>
      </div>

      <SectionCard
        title="Story pages"
        description="Page text and teaching focus for classroom use"
      >
        <div className="space-y-4">
          {story.storyPages.map((page) => (
            <AppCard key={page.pageNumber} padding="sm" className="border-stone-200 bg-stone-50/50">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-stone-700">Page {page.pageNumber}</span>
                <span className="text-xs text-stone-500">{page.wordCount} words</span>
              </div>
              <p className="text-sm leading-relaxed text-stone-800">{page.text}</p>
              <p className="mt-3 text-xs text-stone-500">
                <span className="font-medium text-stone-600">Teaching focus:</span> {page.teachingFocus}
              </p>
            </AppCard>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Flashcards" description="Key vocabulary from the story">
        <div className="grid gap-3 sm:grid-cols-2">
          {story.flashcards.map((card) => (
            <AppCard key={card.word} padding="sm" className="border-stone-200 bg-white">
              <p className="font-medium text-stone-900">{card.word}</p>
              <p className="mt-1 text-sm text-stone-600">{card.simpleDefinition}</p>
              <p className="mt-2 text-xs italic text-stone-500">&ldquo;{card.exampleSentence}&rdquo;</p>
            </AppCard>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Image prompts" description="Short illustration notes per page">
        <div className="space-y-3">
          {story.imagePrompts.map((item) => (
            <AppCard key={item.pageNumber} padding="sm" className="border-stone-200 bg-white">
              <p className="text-xs font-medium text-stone-500">Page {item.pageNumber}</p>
              <p className="mt-1 text-sm text-stone-800">{item.prompt}</p>
              <p className="mt-2 text-xs text-stone-500">{item.continuityReminder}</p>
            </AppCard>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

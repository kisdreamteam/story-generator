import type { GeneratedStory } from '@/features/stories/types'
import { displayDetailValue } from '@/features/stories/utils/storyDetailView'

interface StoryPrintDocumentProps {
  story: GeneratedStory
  projectTitle: string
}

export function StoryPrintDocument({ story, projectTitle }: StoryPrintDocumentProps) {
  const title = projectTitle.trim() || story.title.trim() || 'Untitled story'

  return (
    <article className="mx-auto max-w-3xl bg-white px-6 py-8 text-stone-900 print:max-w-none print:px-0 print:py-0">
      <header className="border-b border-stone-300 pb-6 print:pb-4">
        <h1 className="text-3xl font-bold leading-tight">{title}</h1>
        {story.summary.trim() ? (
          <p className="mt-3 text-base leading-relaxed text-stone-700">{story.summary.trim()}</p>
        ) : null}
      </header>

      <section className="mt-8 space-y-8 print:mt-6 print:space-y-6">
        {story.storyPages.map((page) => (
          <div key={page.pageNumber} className="break-inside-avoid">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Page {page.pageNumber}
            </h2>
            <p className="mt-3 whitespace-pre-line text-lg leading-[1.75] text-stone-900">
              {page.text}
            </p>
            {page.teachingFocus.trim() ? (
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                <span className="font-medium text-stone-700">Teaching focus:</span>{' '}
                {page.teachingFocus.trim()}
              </p>
            ) : null}
          </div>
        ))}
      </section>

      {story.flashcards.length > 0 ? (
        <section className="mt-10 break-before-page print:mt-8">
          <h2 className="border-b border-stone-300 pb-2 text-xl font-semibold text-stone-900">
            Vocabulary cards
          </h2>
          <ul className="mt-4 space-y-4">
            {story.flashcards.map((card, index) => (
              <li key={`${card.word}-${index}`} className="break-inside-avoid">
                <p className="text-lg font-semibold text-stone-900">
                  {displayDetailValue(card.word)}
                </p>
                <p className="mt-1 text-base leading-relaxed text-stone-700">
                  {displayDetailValue(card.simpleDefinition)}
                </p>
                {card.exampleSentence.trim() ? (
                  <p className="mt-2 text-sm italic leading-relaxed text-stone-600">
                    {displayDetailValue(card.exampleSentence)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}

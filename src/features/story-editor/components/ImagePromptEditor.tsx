import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppButton, AppCard, AppInput, AppTextarea } from '@/shared/components'
import type { StoryImagePrompt, StoryPage } from '@/features/stories/types'

export interface ImagePromptEditorProps {
  pages: StoryPage[]
  imagePrompts: StoryImagePrompt[]
  disabled?: boolean
  selectedPageNumber?: number | null
  onSelectPage?: (pageNumber: number) => void
  onPromptChange: (pageNumber: number, patch: Partial<StoryImagePrompt>) => void
  onRegeneratePrompt: (pageNumber: number) => void
  onMovePrompt: (pageNumber: number, direction: 'up' | 'down') => void
  className?: string
}

function promptPreview(prompt: string): string {
  const trimmed = prompt.trim()
  if (!trimmed) return 'No prompt yet'
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed
}

function findPrompt(
  imagePrompts: StoryImagePrompt[],
  pageNumber: number,
): StoryImagePrompt {
  return (
    imagePrompts.find((item) => item.pageNumber === pageNumber) ?? {
      pageNumber,
      prompt: '',
      continuityReminder: '',
    }
  )
}

export function ImagePromptEditor({
  pages,
  imagePrompts,
  disabled = false,
  selectedPageNumber,
  onSelectPage,
  onPromptChange,
  onRegeneratePrompt,
  onMovePrompt,
  className = '',
}: ImagePromptEditorProps) {
  const sortedPages = useMemo(
    () => [...pages].sort((left, right) => left.pageNumber - right.pageNumber),
    [pages],
  )

  const [internalPageNumber, setInternalPageNumber] = useState<number | null>(
    () => sortedPages[0]?.pageNumber ?? null,
  )

  useEffect(() => {
    if (selectedPageNumber == null) return
    setInternalPageNumber(selectedPageNumber)
  }, [selectedPageNumber])

  const activePageNumber =
    internalPageNumber && sortedPages.some((page) => page.pageNumber === internalPageNumber)
      ? internalPageNumber
      : sortedPages[0]?.pageNumber

  const activePage = sortedPages.find((page) => page.pageNumber === activePageNumber)
  const activePrompt = activePageNumber ? findPrompt(imagePrompts, activePageNumber) : null
  const activeIndex = sortedPages.findIndex((page) => page.pageNumber === activePageNumber)

  const handleSelectPage = useCallback(
    (pageNumber: number) => {
      setInternalPageNumber(pageNumber)
      onSelectPage?.(pageNumber)
    },
    [onSelectPage],
  )

  if (!activePage || !activePrompt || activePageNumber == null) {
    return null
  }

  const canMoveUp = activeIndex > 0
  const canMoveDown = activeIndex >= 0 && activeIndex < sortedPages.length - 1

  return (
    <div className={['space-y-4', className].filter(Boolean).join(' ')}>
      <div>
        <h3 className="text-sm font-semibold text-stone-900">Illustration prompts</h3>
        <p className="mt-1 text-xs text-stone-500">
          Edit illustration notes separately from story page text. Drafts are built locally — no AI
          calls.
        </p>
      </div>

      <div className="overflow-x-auto pb-1">
        <ul className="flex min-w-min gap-2" aria-label="Illustration prompts">
          {sortedPages.map((page) => {
            const prompt = findPrompt(imagePrompts, page.pageNumber)
            const isActive = page.pageNumber === activePageNumber

            return (
              <li key={page.pageNumber}>
                <button
                  type="button"
                  onClick={() => handleSelectPage(page.pageNumber)}
                  disabled={disabled}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'flex w-36 shrink-0 flex-col rounded-lg border px-3 py-2 text-left transition',
                    isActive
                      ? 'border-stone-900 bg-white shadow-sm ring-1 ring-stone-900/10'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80',
                    disabled ? 'cursor-not-allowed opacity-60' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="text-xs font-semibold text-stone-900">
                    Page {page.pageNumber}
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600">
                    {promptPreview(prompt.prompt)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div
        className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3"
        aria-label="Illustration prompt actions"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-stone-800">
            Prompt for page {activePageNumber}{' '}
            <span className="font-normal text-stone-500">of {sortedPages.length}</span>
          </p>
          <p className="text-xs text-stone-500">Reorder or draft prompt text from the page.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onMovePrompt(activePageNumber, 'up')}
            disabled={disabled || !canMoveUp}
            fullWidth
            className="sm:w-auto"
          >
            Move up
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onMovePrompt(activePageNumber, 'down')}
            disabled={disabled || !canMoveDown}
            fullWidth
            className="sm:w-auto"
          >
            Move down
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onRegeneratePrompt(activePageNumber)}
            disabled={disabled}
            fullWidth
            className="sm:col-span-2 sm:w-auto"
          >
            Regenerate from page text
          </AppButton>
        </div>
      </div>

      <AppCard padding="md" className="space-y-4 border-stone-200 bg-white">
        <p className="text-xs text-stone-500">
          Page text preview:{' '}
          <span className="text-stone-700">
            {activePage.text.trim() || 'This page has no story text yet.'}
          </span>
        </p>

        <AppTextarea
          label="Illustration prompt"
          value={activePrompt.prompt}
          onChange={(event) => onPromptChange(activePageNumber, { prompt: event.target.value })}
          disabled={disabled}
          rows={4}
          hint="Describe what the picture on this page should show."
        />
        <AppInput
          label="Continuity reminder"
          value={activePrompt.continuityReminder}
          onChange={(event) =>
            onPromptChange(activePageNumber, { continuityReminder: event.target.value })
          }
          disabled={disabled}
          hint="Keep characters and style consistent with earlier pages."
        />
      </AppCard>
    </div>
  )
}

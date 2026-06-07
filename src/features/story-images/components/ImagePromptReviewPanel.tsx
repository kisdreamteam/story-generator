import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppButton, AppInput, AppTextarea, SectionCard } from '@/shared/components'
import type { StoryImagePrompt, StoryPage } from '@/features/stories/types'
import {
  findImagePromptForPage,
  imagePromptChipLabel,
} from '../lib/imagePromptReview.utils'

export interface ImagePromptReviewPanelProps {
  pages: StoryPage[]
  prompts: StoryImagePrompt[]
  originalPrompts: StoryImagePrompt[]
  onPromptChange: (pageNumber: number, patch: Partial<StoryImagePrompt>) => void
  onResetPage: (pageNumber: number) => void
  onResetAll?: () => void
  isPageModified?: (pageNumber: number) => boolean
  isDirty?: boolean
  onSave?: () => void
  isSaving?: boolean
  disabled?: boolean
  className?: string
}

export function ImagePromptReviewPanel({
  pages,
  prompts,
  originalPrompts,
  onPromptChange,
  onResetPage,
  onResetAll,
  isPageModified,
  isDirty = false,
  onSave,
  isSaving = false,
  disabled = false,
  className = '',
}: ImagePromptReviewPanelProps) {
  const sortedPages = useMemo(
    () => [...pages].sort((left, right) => left.pageNumber - right.pageNumber),
    [pages],
  )

  const [activePageNumber, setActivePageNumber] = useState<number | null>(
    () => sortedPages[0]?.pageNumber ?? null,
  )

  useEffect(() => {
    if (
      activePageNumber != null &&
      sortedPages.some((page) => page.pageNumber === activePageNumber)
    ) {
      return
    }

    setActivePageNumber(sortedPages[0]?.pageNumber ?? null)
  }, [activePageNumber, sortedPages])

  const activePage = sortedPages.find((page) => page.pageNumber === activePageNumber)
  const activePrompt = activePageNumber
    ? findImagePromptForPage(prompts, activePageNumber)
    : null
  const originalPrompt = activePageNumber
    ? findImagePromptForPage(originalPrompts, activePageNumber)
    : null

  const pageIsModified =
    activePageNumber != null &&
    (isPageModified?.(activePageNumber) ??
      !promptsEqualForPage(activePrompt, originalPrompt))

  const handleSelectPage = useCallback((pageNumber: number) => {
    setActivePageNumber(pageNumber)
  }, [])

  if (sortedPages.length === 0) {
    return (
      <SectionCard
        title="Illustration prompts"
        description="Review prompts before generating illustrations. Edit scene descriptions and continuity reminders for each page."
      >
        <p className="text-sm text-stone-600">This story has no pages yet.</p>
      </SectionCard>
    )
  }

  if (!activePage || !activePrompt || activePageNumber == null) {
    return null
  }

  const isBusy = disabled || isSaving

  return (
    <div className={className}>
      <SectionCard
        title="Illustration prompts"
        description="Review and edit prompts for each page before illustrations are generated."
      >
      <div className="space-y-4">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <ul className="flex min-w-min gap-2" aria-label="Story pages">
            {sortedPages.map((page) => {
              const prompt = findImagePromptForPage(prompts, page.pageNumber)
              const modified =
                isPageModified?.(page.pageNumber) ??
                !promptsEqualForPage(
                  prompt,
                  findImagePromptForPage(originalPrompts, page.pageNumber),
                )
              const isActive = page.pageNumber === activePageNumber

              return (
                <li key={page.pageNumber}>
                  <button
                    type="button"
                    onClick={() => handleSelectPage(page.pageNumber)}
                    disabled={isBusy}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'flex w-[8.75rem] shrink-0 flex-col rounded-lg border px-3 py-2 text-left transition sm:w-36',
                      isActive
                        ? 'border-stone-900 bg-white shadow-sm ring-1 ring-stone-900/10'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80',
                      isBusy ? 'cursor-not-allowed opacity-60' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                      Page {page.pageNumber}
                      {modified ? (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-900">
                          Edited
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600">
                      {imagePromptChipLabel(prompt)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/60 p-3 sm:p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-900">
              Page {activePageNumber}{' '}
              <span className="font-normal text-stone-500">of {sortedPages.length}</span>
            </p>
            <p className="text-xs leading-relaxed text-stone-600">
              Story text:{' '}
              <span className="text-stone-800">
                {activePage.text.trim() || 'No story text on this page.'}
              </span>
            </p>
          </div>

          <AppTextarea
            label="Illustration prompt"
            value={activePrompt.prompt}
            onChange={(event) =>
              onPromptChange(activePageNumber, { prompt: event.target.value })
            }
            disabled={isBusy}
            rows={4}
            hint="Describe the scene you want illustrated on this page."
          />

          <AppInput
            label="Continuity reminder"
            value={activePrompt.continuityReminder}
            onChange={(event) =>
              onPromptChange(activePageNumber, { continuityReminder: event.target.value })
            }
            disabled={isBusy}
            hint="Notes to keep characters and style consistent."
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onResetPage(activePageNumber)}
              disabled={isBusy || !pageIsModified}
              fullWidth
              className="sm:w-auto"
            >
              Reset to original
            </AppButton>
          </div>
        </div>

        {(onResetAll || onSave) && (
          <div className="flex flex-col gap-2 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-stone-500">
              {isDirty
                ? 'You have unsaved prompt changes.'
                : 'Prompts match the last saved version.'}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {onResetAll ? (
                <AppButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onResetAll}
                  disabled={isBusy || !isDirty}
                  fullWidth
                  className="sm:w-auto"
                >
                  Reset all
                </AppButton>
              ) : null}
              {onSave ? (
                <AppButton
                  type="button"
                  size="sm"
                  onClick={onSave}
                  disabled={isBusy || !isDirty}
                  fullWidth
                  className="sm:w-auto"
                >
                  {isSaving ? 'Saving…' : 'Save prompts'}
                </AppButton>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
    </div>
  )
}

function promptsEqualForPage(
  left: StoryImagePrompt | null,
  right: StoryImagePrompt | null,
): boolean {
  if (!left || !right) {
    return false
  }

  return (
    left.prompt.trim() === right.prompt.trim() &&
    left.continuityReminder.trim() === right.continuityReminder.trim()
  )
}

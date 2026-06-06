import { useCallback, useEffect } from 'react'
import { AppCard } from '@/shared/components'
import type { StoryPage } from '@/features/stories/types'
import { useStoryPageNavigation } from '../hooks/useStoryPageNavigation'
import { StoryPageEditor } from './StoryPageEditor'
import { StoryPageToolbar } from './StoryPageToolbar'

export interface StoryPageListEditorProps {
  pages: StoryPage[]
  disabled?: boolean
  selectedPageNumber?: number | null
  onSelectPage?: (pageNumber: number) => void
  onTextChange: (pageNumber: number, text: string) => void
  onTeachingFocusChange?: (pageNumber: number, teachingFocus: string) => void
  onAddPage: (afterPageNumber?: number) => void
  onRemovePage: (pageNumber: number) => void
  onMovePage: (pageNumber: number, direction: 'up' | 'down') => void
  className?: string
}

function pagePreview(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return 'Empty page'
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed
}

export function StoryPageListEditor({
  pages,
  disabled = false,
  selectedPageNumber,
  onSelectPage,
  onTextChange,
  onTeachingFocusChange,
  onAddPage,
  onRemovePage,
  onMovePage,
  className = '',
}: StoryPageListEditorProps) {
  const navigation = useStoryPageNavigation(pages)

  useEffect(() => {
    if (selectedPageNumber == null) return
    navigation.goToPage(selectedPageNumber)
  }, [navigation, selectedPageNumber])

  const currentPage = navigation.currentPage

  const handleSelectPage = useCallback(
    (pageNumber: number) => {
      navigation.goToPage(pageNumber)
      onSelectPage?.(pageNumber)
    },
    [navigation, onSelectPage],
  )

  const handleRemovePage = useCallback(() => {
    if (!currentPage) return

    if (
      !window.confirm(
        `Remove page ${currentPage.pageNumber}? This cannot be undone until you reset changes.`,
      )
    ) {
      return
    }

    onRemovePage(currentPage.pageNumber)
  }, [currentPage, onRemovePage])

  if (!currentPage) {
    return null
  }

  return (
    <div className={['space-y-4', className].filter(Boolean).join(' ')}>
      <div className="overflow-x-auto pb-1">
        <ul className="flex min-w-min gap-2" aria-label="Story pages">
          {navigation.sortedPages.map((page) => {
            const isActive = page.pageNumber === currentPage.pageNumber

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
                  <span className="text-xs font-semibold text-stone-900">Page {page.pageNumber}</span>
                  <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600">
                    {pagePreview(page.text)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <StoryPageToolbar
        currentPageNumber={currentPage.pageNumber}
        totalPages={navigation.totalPages}
        canMoveUp={navigation.canGoPrevious}
        canMoveDown={navigation.canGoNext}
        disabled={disabled}
        onAddPage={() => onAddPage(currentPage.pageNumber)}
        onRemovePage={handleRemovePage}
        onMoveUp={() => onMovePage(currentPage.pageNumber, 'up')}
        onMoveDown={() => onMovePage(currentPage.pageNumber, 'down')}
      />

      <AppCard padding="md" className="border-stone-200 bg-white">
        <StoryPageEditor
          page={currentPage}
          disabled={disabled}
          onTextChange={(text) => onTextChange(currentPage.pageNumber, text)}
          onTeachingFocusChange={
            onTeachingFocusChange
              ? (teachingFocus) => onTeachingFocusChange(currentPage.pageNumber, teachingFocus)
              : undefined
          }
        />
      </AppCard>
    </div>
  )
}

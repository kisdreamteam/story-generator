import { AppTextarea } from '@/shared/components'
import type { StoryPage } from '@/features/stories/types'
import { countStoryWords } from '../utils/countStoryWords'

export interface StoryPageEditorProps {
  page: StoryPage
  disabled?: boolean
  onTextChange: (text: string) => void
  className?: string
}

export function StoryPageEditor({
  page,
  disabled = false,
  onTextChange,
  className = '',
}: StoryPageEditorProps) {
  const wordCount = countStoryWords(page.text)

  return (
    <div className={className}>
      <AppTextarea
        label={`Page ${page.pageNumber} text`}
        value={page.text}
        onChange={(event) => onTextChange(event.target.value)}
        disabled={disabled}
        rows={8}
        hint={`${wordCount} word${wordCount === 1 ? '' : 's'} on this page`}
      />
    </div>
  )
}

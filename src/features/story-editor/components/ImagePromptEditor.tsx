import { AppInput, AppTextarea } from '@/shared/components'
import type { StoryImagePrompt } from '@/features/stories/types'

export interface ImagePromptEditorProps {
  pageNumber: number
  imagePrompt: StoryImagePrompt
  disabled?: boolean
  onPromptChange: (prompt: string) => void
  onContinuityChange: (continuityReminder: string) => void
  className?: string
}

export function ImagePromptEditor({
  pageNumber,
  imagePrompt,
  disabled = false,
  onPromptChange,
  onContinuityChange,
  className = '',
}: ImagePromptEditorProps) {
  return (
    <div className={['space-y-4', className].filter(Boolean).join(' ')}>
      <h3 className="text-sm font-semibold text-stone-900">
        Illustration notes — page {pageNumber}
      </h3>
      <AppTextarea
        label="Illustration prompt"
        value={imagePrompt.prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        disabled={disabled}
        rows={4}
        hint="Describe what the picture on this page should show."
      />
      <AppInput
        label="Continuity reminder"
        value={imagePrompt.continuityReminder}
        onChange={(event) => onContinuityChange(event.target.value)}
        disabled={disabled}
        hint="Keep characters and style consistent with earlier pages."
      />
    </div>
  )
}

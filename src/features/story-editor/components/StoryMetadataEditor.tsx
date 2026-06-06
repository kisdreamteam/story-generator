import { AppInput } from '@/shared/components'
import type { StoryEditorMetadata } from '../types/storyEditorState.types'

export interface StoryMetadataEditorProps {
  metadata: StoryEditorMetadata
  disabled?: boolean
  onTitleChange: (title: string) => void
  className?: string
}

export function StoryMetadataEditor({
  metadata,
  disabled = false,
  onTitleChange,
  className = '',
}: StoryMetadataEditorProps) {
  return (
    <div className={className}>
      <AppInput
        label="Story title"
        value={metadata.title}
        onChange={(event) => onTitleChange(event.target.value)}
        disabled={disabled}
        hint="Shown at the top of your story when you preview or print."
      />
    </div>
  )
}

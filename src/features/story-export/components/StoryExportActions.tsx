import { AppButton, SectionCard } from '@/shared/components'
import { useStoryExport } from '../hooks'
import type { GeneratedStory } from '@/features/stories/types'

interface StoryExportActionsProps {
  story: GeneratedStory
  projectTitle: string
  storyId: string
}

export function StoryExportActions({ story, projectTitle, storyId }: StoryExportActionsProps) {
  const { isCopying, copyStoryText, downloadJson, openPrintView } = useStoryExport({
    story,
    projectTitle,
    storyId,
  })

  return (
    <SectionCard
      title="Export"
      description="Copy, download, or print this story for classroom use."
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <AppButton
          type="button"
          variant="secondary"
          onClick={() => void copyStoryText()}
          disabled={isCopying}
          fullWidth
          className="sm:w-auto"
        >
          {isCopying ? 'Copying…' : 'Copy story text'}
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          onClick={downloadJson}
          fullWidth
          className="sm:w-auto"
        >
          Download JSON
        </AppButton>
        <AppButton type="button" onClick={openPrintView} fullWidth className="sm:w-auto">
          Print-friendly view
        </AppButton>
      </div>
    </SectionCard>
  )
}

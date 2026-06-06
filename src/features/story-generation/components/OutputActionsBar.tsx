import { AppButton, ComingSoonBadge, SectionCard } from '../../../shared/components'
import type { CopyFeedback } from '../types/clipboard.types'

interface OutputActionsBarProps {
  onCopyStory: () => void
  onCopyFlashcards: () => void
  onCopyImagePrompts: () => void
  feedback: CopyFeedback
}

function CopyAction({
  label,
  onClick,
  message,
}: {
  label: string
  onClick: () => void
  message?: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <AppButton variant="secondary" className="justify-center" onClick={onClick}>
        {label}
      </AppButton>
      {message && (
        <span
          className={[
            'text-center text-xs',
            message === 'Copied!' ? 'text-emerald-600' : 'text-red-600',
          ].join(' ')}
        >
          {message}
        </span>
      )}
    </div>
  )
}

function PlaceholderAction({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <AppButton variant="secondary" disabled className="justify-center">
        {label}
      </AppButton>
      <div className="flex justify-center">
        <ComingSoonBadge />
      </div>
    </div>
  )
}

export function OutputActionsBar({
  onCopyStory,
  onCopyFlashcards,
  onCopyImagePrompts,
  feedback,
}: OutputActionsBarProps) {
  return (
    <SectionCard title="Export & Actions" description="Copy content now — full export tools coming later">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <CopyAction
            label="Copy Story"
            onClick={onCopyStory}
            message={feedback.story}
          />
          <CopyAction
            label="Copy Flashcards"
            onClick={onCopyFlashcards}
            message={feedback.flashcards}
          />
          <CopyAction
            label="Copy Image Prompts"
            onClick={onCopyImagePrompts}
            message={feedback.imagePrompts}
          />
        </div>

        <div className="border-t border-stone-100 pt-4">
          {/* TODO: Wire real export (Slides/PDF) and image generation in a later phase. */}
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-500">
            Export placeholders
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <PlaceholderAction label="Export to Slides" />
            <PlaceholderAction label="Generate Images" />
            <PlaceholderAction label="Download PDF" />
            <PlaceholderAction label="Share" />
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

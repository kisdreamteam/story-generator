export type StoryImagePlaceholderViewState = 'placeholder' | 'queued' | 'generating' | 'failed'

export interface StoryImagePlaceholderDisplay {
  viewState: StoryImagePlaceholderViewState
  statusLabel?: string
  imagePrompt?: string
}

export interface StoryImagePlaceholderProps {
  display: StoryImagePlaceholderDisplay
  alt?: string
  className?: string
}

const VIEW_STATE_STYLES: Record<
  StoryImagePlaceholderViewState,
  { border: string; background: string; emoji: string }
> = {
  placeholder: { border: 'border-stone-200', background: 'bg-stone-50/80', emoji: '🖼️' },
  queued: { border: 'border-sky-200', background: 'bg-sky-50/60', emoji: '⏳' },
  generating: { border: 'border-brand-200', background: 'bg-brand-50/50', emoji: '🎨' },
  failed: { border: 'border-red-200', background: 'bg-red-50/70', emoji: '⚠️' },
}

/** Shared illustration placeholder for missing, queued, generating, or failed page images. */
export function StoryImagePlaceholder({
  display,
  alt = 'Story illustration placeholder',
  className = '',
}: StoryImagePlaceholderProps) {
  const styles = VIEW_STATE_STYLES[display.viewState]
  const caption =
    display.statusLabel ??
    (display.viewState === 'failed'
      ? 'Illustration unavailable'
      : display.viewState === 'placeholder'
        ? 'Illustration coming soon'
        : 'Illustration pending')

  return (
    <figure
      className={[
        'flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 text-center',
        styles.border,
        styles.background,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={alt}
    >
      <span className="text-3xl" aria-hidden>
        {styles.emoji}
      </span>
      <figcaption className="mt-3 text-sm font-medium text-stone-700">{caption}</figcaption>
      {display.imagePrompt ? (
        <p className="mt-2 line-clamp-3 max-w-sm text-xs leading-relaxed text-stone-500">
          {display.imagePrompt}
        </p>
      ) : (
        <p className="mt-2 text-xs text-stone-500">No illustration has been added for this page yet.</p>
      )}
    </figure>
  )
}

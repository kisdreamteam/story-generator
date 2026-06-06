import type { StoryPageImageFields } from '../types'
import { buildStoryImageDisplayModel } from '../lib/storyImageDisplay'
import { StoryImagePlaceholder } from '@/shared/components'

export interface StoryImageProps extends StoryPageImageFields {
  alt: string
  className?: string
}

export function StoryImage({
  imageUrl,
  imageStatus,
  imagePrompt,
  alt,
  className = '',
}: StoryImageProps) {
  const display = buildStoryImageDisplayModel({ imageUrl, imageStatus, imagePrompt })

  if (display.viewState === 'ready' && display.imageUrl) {
    return (
      <figure className={['overflow-hidden rounded-xl border border-stone-200 bg-stone-100', className].filter(Boolean).join(' ')}>
        <img
          src={display.imageUrl}
          alt={alt}
          className="aspect-[4/3] w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </figure>
    )
  }

  if (display.viewState === 'ready') {
    return (
      <StoryImagePlaceholder
        display={{ viewState: 'placeholder', imagePrompt: display.imagePrompt }}
        alt={alt}
        className={className}
      />
    )
  }

  return (
    <StoryImagePlaceholder
      display={{
        viewState: display.viewState,
        statusLabel: display.statusLabel,
        imagePrompt: display.imagePrompt,
      }}
      alt={alt}
      className={className}
    />
  )
}

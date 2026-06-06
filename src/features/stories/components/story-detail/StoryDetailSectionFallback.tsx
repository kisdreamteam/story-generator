import { EmptyState } from '@/shared/components'

interface StoryDetailSectionFallbackProps {
  message: string
}

/** Placeholder when optional story detail content is missing. */
export function StoryDetailSectionFallback({ message }: StoryDetailSectionFallbackProps) {
  return <EmptyState layout="section" title="" description={message} />
}

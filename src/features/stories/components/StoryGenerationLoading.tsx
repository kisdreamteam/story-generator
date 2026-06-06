import { LoadingStoryPage } from '@/shared/components/loading'

export function StoryGenerationLoading() {
  return (
    <LoadingStoryPage
      variant="generation"
      className="border-stone-200 bg-stone-50/50 px-4 py-10 sm:px-6 sm:py-12"
    />
  )
}

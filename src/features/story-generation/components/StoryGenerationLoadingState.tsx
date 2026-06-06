import { LoadingState } from '../../../shared/components'

export function StoryGenerationLoadingState() {
  return (
    <LoadingState
      title="Generating your story…"
      description="Building pages, flashcards, and image prompts. This may take a moment."
    />
  )
}

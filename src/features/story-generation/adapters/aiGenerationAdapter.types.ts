import type { StoryGenerationApi } from '../api/storyGenerationApi'

export type AiGenerationAdapterKind = 'mock' | 'real'

/**
 * Generation boundary — pipeline and orchestration depend on this interface only.
 * Concrete mock and real backends are wired through {@link resolveAiGenerationAdapter}.
 */
export interface AiGenerationAdapter extends StoryGenerationApi {
  readonly kind: AiGenerationAdapterKind
  readonly id: string
}

import { getImageGenerationConfig } from '@/shared/config/imageGenerationConfig'
import type { ImageGenerationAdapter } from './imageGenerationAdapter.types'
import { mockImageGenerationAdapter } from './mockImageGenerationAdapter'
import { realImageGenerationAdapter } from './realImageGenerationAdapter'

/**
 * Resolve the active illustration adapter for the current environment.
 *
 * Story text uses `VITE_GENERATION_MODE`; illustrations use `VITE_IMAGE_GENERATION_MODE`.
 */
export async function resolveImageGenerationAdapter(): Promise<ImageGenerationAdapter> {
  const { isRealAiMode } = getImageGenerationConfig()

  if (isRealAiMode) {
    return realImageGenerationAdapter
  }

  return mockImageGenerationAdapter
}

/** Explicit mock adapter accessor — useful for image-mode fallback paths. */
export function getMockImageGenerationAdapter(): ImageGenerationAdapter {
  return mockImageGenerationAdapter
}

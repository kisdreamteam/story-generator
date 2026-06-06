import { getGenerationConfig } from '@/shared/config'
import type { ImageGenerationAdapter } from './imageGenerationAdapter.types'
import { mockImageGenerationAdapter } from './mockImageGenerationAdapter'
import { realImageGenerationAdapter } from './realImageGenerationAdapter'

/** Resolve the active illustration adapter for the current environment mode. */
export async function resolveImageGenerationAdapter(): Promise<ImageGenerationAdapter> {
  const { isRealAiMode } = getGenerationConfig()

  if (isRealAiMode) {
    return realImageGenerationAdapter
  }

  return mockImageGenerationAdapter
}

/** Explicit mock adapter accessor — useful for fallback paths. */
export function getMockImageGenerationAdapter(): ImageGenerationAdapter {
  return mockImageGenerationAdapter
}

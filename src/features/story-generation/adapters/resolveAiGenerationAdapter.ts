import { getGenerationConfig } from '@/shared/config'
import type { AiGenerationAdapter } from './aiGenerationAdapter.types'
import { mockAiGenerationAdapter } from './mockAiGenerationAdapter'
import { realAiGenerationAdapter } from './realAiGenerationAdapter'

/** Resolve the active generation adapter for the current environment mode. */
export async function resolveAiGenerationAdapter(): Promise<AiGenerationAdapter> {
  const { isRealAiMode } = getGenerationConfig()

  if (isRealAiMode) {
    return realAiGenerationAdapter
  }

  return mockAiGenerationAdapter
}

/** Explicit mock adapter accessor — useful for AI-mode fallback paths. */
export function getMockAiGenerationAdapter(): AiGenerationAdapter {
  return mockAiGenerationAdapter
}

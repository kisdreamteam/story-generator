import { getGenerationConfig } from '@/shared/config'
import {
  adaptAIProviderToLegacyStoryProvider,
  adaptLegacyStoryProviderToAIProvider,
  getAIProvider,
  mockAIProvider,
  registerAIProviderLoader,
  resetAIProvider,
  resolveAIProvider,
  setAIProvider,
} from '@/shared/lib/ai'
import type { AIStoryProvider } from '../types'

type AIStoryProviderLoader = () => Promise<AIStoryProvider>

/** Replace the active provider — useful in tests or custom bootstrap. */
export function setAIStoryProvider(provider: AIStoryProvider): void {
  setAIProvider(adaptLegacyStoryProviderToAIProvider(provider))
}

/** Register a lazy loader for the real AI backend (keeps OpenAI out of the shared bundle). */
export function registerAIStoryProviderLoader(loader: AIStoryProviderLoader): void {
  registerAIProviderLoader(async () => adaptLegacyStoryProviderToAIProvider(await loader()))
}

/** Reset to the mock provider — useful in tests. */
export function resetAIStoryProvider(): void {
  resetAIProvider()
}

export function getAIStoryProvider(): AIStoryProvider {
  return adaptAIProviderToLegacyStoryProvider(getAIProvider())
}

/** Resolve the provider for the current generation mode. */
export async function resolveAIStoryProvider(): Promise<AIStoryProvider> {
  if (getAIProvider() !== mockAIProvider) {
    return adaptAIProviderToLegacyStoryProvider(getAIProvider())
  }

  const { isRealAiMode } = getGenerationConfig()

  if (isRealAiMode) {
    return adaptAIProviderToLegacyStoryProvider(await resolveAIProvider())
  }

  return adaptAIProviderToLegacyStoryProvider(mockAIProvider)
}

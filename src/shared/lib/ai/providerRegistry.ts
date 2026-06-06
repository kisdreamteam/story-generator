import { getGenerationConfig } from '@/shared/config'
import type { AIProvider } from './AIProvider'
import { mockAIProvider } from './mockProvider'

type AIProviderLoader = () => Promise<AIProvider>

let activeProvider: AIProvider = mockAIProvider
let aiProviderLoader: AIProviderLoader | null = null

/** Replace the active provider — useful in tests or custom bootstrap. */
export function setAIProvider(provider: AIProvider): void {
  activeProvider = provider
}

/** Register a lazy loader for the real AI backend (keeps OpenAI out of the shared bundle). */
export function registerAIProviderLoader(loader: AIProviderLoader): void {
  aiProviderLoader = loader
}

/** Reset to the mock provider — useful in tests. */
export function resetAIProvider(): void {
  activeProvider = mockAIProvider
  aiProviderLoader = null
}

export function getAIProvider(): AIProvider {
  return activeProvider
}

/** Resolve the provider for the current generation mode. */
export async function resolveAIProvider(): Promise<AIProvider> {
  if (activeProvider !== mockAIProvider) {
    return activeProvider
  }

  const { isRealAiMode } = getGenerationConfig()

  if (isRealAiMode && aiProviderLoader) {
    return aiProviderLoader()
  }

  return mockAIProvider
}

import { GenerationMode, getGenerationMode } from '@/shared/config'
import type { AIStoryProvider } from '../types'
import { mockAIStoryProvider } from './mockAIStoryProvider'

type AIStoryProviderLoader = () => Promise<AIStoryProvider>

let activeProvider: AIStoryProvider = mockAIStoryProvider
let aiProviderLoader: AIStoryProviderLoader | null = null

/** Replace the active provider — useful in tests or custom bootstrap. */
export function setAIStoryProvider(provider: AIStoryProvider): void {
  activeProvider = provider
}

/** Register a lazy loader for the real AI backend (keeps OpenAI out of the shared bundle). */
export function registerAIStoryProviderLoader(loader: AIStoryProviderLoader): void {
  aiProviderLoader = loader
}

/** Reset to the mock provider — useful in tests. */
export function resetAIStoryProvider(): void {
  activeProvider = mockAIStoryProvider
  aiProviderLoader = null
}

export function getAIStoryProvider(): AIStoryProvider {
  return activeProvider
}

/** Resolve the provider for the current generation mode. */
export async function resolveAIStoryProvider(): Promise<AIStoryProvider> {
  if (activeProvider !== mockAIStoryProvider) {
    return activeProvider
  }

  const mode = getGenerationMode()

  if (mode === GenerationMode.AI && aiProviderLoader) {
    return aiProviderLoader()
  }

  return mockAIStoryProvider
}

import type { AIImageGenerationProvider } from '../types'
import { mockAIImageGenerationProvider } from './mockAIImageGenerationProvider'

type ImageProviderLoader = () => Promise<AIImageGenerationProvider>

let activeProvider: AIImageGenerationProvider = mockAIImageGenerationProvider
let providerLoader: ImageProviderLoader | null = null

export function setAIImageGenerationProvider(provider: AIImageGenerationProvider): void {
  activeProvider = provider
}

export function registerAIImageGenerationProviderLoader(loader: ImageProviderLoader): void {
  providerLoader = loader
}

export function resetAIImageGenerationProvider(): void {
  activeProvider = mockAIImageGenerationProvider
  providerLoader = null
}

export function getAIImageGenerationProvider(): AIImageGenerationProvider {
  return activeProvider
}

export async function resolveAIImageGenerationProvider(): Promise<AIImageGenerationProvider> {
  if (activeProvider !== mockAIImageGenerationProvider) {
    return activeProvider
  }

  if (providerLoader) {
    return providerLoader()
  }

  return mockAIImageGenerationProvider
}

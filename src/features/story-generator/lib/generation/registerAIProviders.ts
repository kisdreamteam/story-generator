import { registerAIStoryProviderLoader } from '@/shared/ai'

/** Registers the real AI backend loader without pulling OpenAI into the shared bundle. */
export function registerStoryGeneratorAIProviders(): void {
  registerAIStoryProviderLoader(async () => {
    const { openAIAIStoryProvider } = await import('./providers/openAIAIStoryProvider')
    return openAIAIStoryProvider
  })
}

registerStoryGeneratorAIProviders()

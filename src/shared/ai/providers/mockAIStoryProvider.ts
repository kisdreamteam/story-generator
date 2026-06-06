import { adaptAIProviderToLegacyStoryProvider, mockAIProvider } from '@/shared/lib/ai'

/** Legacy export — delegates to the shared lib mock {@link AIProvider}. */
export const mockAIStoryProvider = adaptAIProviderToLegacyStoryProvider(mockAIProvider)

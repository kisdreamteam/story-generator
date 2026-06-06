import { GenerationMode } from './generationMode'

function parseGenerationMode(raw: string | undefined): GenerationMode {
  const normalized = raw?.trim().toLowerCase()

  switch (normalized) {
    case 'fixture':
      return GenerationMode.FIXTURE
    case 'ai':
      return GenerationMode.AI
    case 'mock':
      return GenerationMode.MOCK
    default:
      return GenerationMode.MOCK
  }
}

/** Active generation mode from VITE_GENERATION_MODE (default: MOCK). */
export function getGenerationMode(): GenerationMode {
  return parseGenerationMode(import.meta.env.VITE_GENERATION_MODE)
}

/** True when VITE_GENERATION_MODE is ai. */
export function isAIEnabled(): boolean {
  return getGenerationMode() === GenerationMode.AI
}

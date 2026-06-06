import type { GenerationMode } from '../types/ai.types'

export const generationModeLabels: Record<GenerationMode, string> = {
  mock: 'Mock Story',
  ai: 'AI Generated',
  fallback: 'Fallback Story',
}

export const generationModeStyles: Record<GenerationMode, string> = {
  mock: 'bg-stone-100 text-stone-700 ring-1 ring-stone-200',
  ai: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  fallback: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
}

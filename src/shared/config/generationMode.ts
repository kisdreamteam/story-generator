/** Dashboard story generation mode — selected via VITE_GENERATION_MODE. */
export const GenerationMode = {
  MOCK: 'MOCK',
  FIXTURE: 'FIXTURE',
  AI: 'AI',
} as const

export type GenerationMode = (typeof GenerationMode)[keyof typeof GenerationMode]

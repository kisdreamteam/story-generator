/** Re-export of StoryGenerationInput — the prompt builder consumes the same shape. */
export type { StoryGenerationInput as StoryPromptInput } from './types'

export interface StoryPromptOutput {
  systemInstruction: string
  userInstruction: string
  outputFormatInstruction: string
  continuityInstruction: string
  safetyInstruction: string
}

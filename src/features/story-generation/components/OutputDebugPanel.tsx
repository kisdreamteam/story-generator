import type { AiGenerationDebugStatus } from '../types/ai.types'
import type { StoryPromptOutput } from '../prompt.types'
import type { ValidationResult } from '../validation.types'
import { AiGenerationStatus } from './AiGenerationStatus'
import { PromptPreview } from './PromptPreview'
import { ValidationStatus } from './ValidationStatus'

interface OutputDebugPanelProps {
  validation: ValidationResult
  prompt: StoryPromptOutput
  aiStatus: AiGenerationDebugStatus
}

export function OutputDebugPanel({ validation, prompt, aiStatus }: OutputDebugPanelProps) {
  return (
    <div className="space-y-6">
      <AiGenerationStatus status={aiStatus} />
      <ValidationStatus validation={validation} />
      <PromptPreview prompt={prompt} />
    </div>
  )
}

import type { GenerationMode } from '../types/ai.types'
import { generationModeLabels, generationModeStyles } from '../config/generationModeLabels'

interface GenerationModeBadgeProps {
  mode: GenerationMode
}

export function GenerationModeBadge({ mode }: GenerationModeBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        generationModeStyles[mode],
      ].join(' ')}
    >
      {generationModeLabels[mode]}
    </span>
  )
}

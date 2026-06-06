import type { StoryPromptOutput } from '../prompt.types'

interface PromptPreviewProps {
  prompt: StoryPromptOutput
}

const sections: { key: keyof StoryPromptOutput; label: string }[] = [
  { key: 'systemInstruction', label: 'System Instruction' },
  { key: 'userInstruction', label: 'User Instruction' },
  { key: 'outputFormatInstruction', label: 'Output Format Instruction' },
  { key: 'continuityInstruction', label: 'Continuity Instruction' },
  { key: 'safetyInstruction', label: 'Safety Instruction' },
]

export function PromptPreview({ prompt }: PromptPreviewProps) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-100/80">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Developer
          </p>
          <h2 className="text-sm font-medium text-stone-700">Prompt Preview</h2>
        </div>
        <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-600">
          Debug panel
        </span>
      </div>

      <div className="space-y-3 p-4">
        {sections.map(({ key, label }) => (
          <div
            key={key}
            className="overflow-hidden rounded-md border border-stone-200 bg-white"
          >
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 bg-stone-50 px-3 py-2">
              <span className="text-xs font-medium text-stone-600">{label}</span>
              <span className="text-xs text-stone-400" aria-hidden="true">
                ▾
              </span>
            </div>
            <pre className="whitespace-pre-wrap px-3 py-2 font-mono text-xs leading-relaxed text-stone-700">
              {prompt[key]}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

import type { ValidationResult } from '../validation.types'

interface ValidationStatusProps {
  validation: ValidationResult
}

export function ValidationStatus({ validation }: ValidationStatusProps) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-100/80">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Developer
          </p>
          <h2 className="text-sm font-medium text-stone-700">Validation Status</h2>
        </div>
        <span
          className={[
            'rounded px-2 py-0.5 text-xs font-medium',
            validation.isValid
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-red-100 text-red-800',
          ].join(' ')}
        >
          {validation.isValid ? 'Valid' : 'Invalid'}
        </span>
      </div>

      <div className="p-4">
        {validation.isValid ? (
          <p className="text-xs text-stone-600">
            Output matches the StoryGenerationOutput contract.
          </p>
        ) : (
          <div>
            <p className="mb-2 text-xs font-medium text-red-700">Validation errors:</p>
            <ul className="list-inside list-disc space-y-1">
              {validation.errors.map((error) => (
                <li key={error} className="font-mono text-xs text-red-600">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

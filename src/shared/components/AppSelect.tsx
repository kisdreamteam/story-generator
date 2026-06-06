import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

export interface AppSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface AppSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: AppSelectOption[]
}

export const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(
  ({ label, error, hint, options, id, className = '', ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-stone-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900',
            'focus:outline-none focus:ring-2 focus:ring-brand-400',
            error ? 'border-red-400' : 'border-stone-200',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)

AppSelect.displayName = 'AppSelect'

import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900',
            'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-400',
            error ? 'border-red-400' : 'border-stone-200',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)

AppInput.displayName = 'AppInput'

import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-stone-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900',
            'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-400',
            'min-h-[100px] resize-y',
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

AppTextarea.displayName = 'AppTextarea'

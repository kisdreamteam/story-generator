import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import {
  formControlBaseClass,
  formControlBorderClass,
  formErrorClass,
  formFieldWrapperClass,
  formHintClass,
  formLabelClass,
} from '@/shared/styles/formFieldClasses'

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={formFieldWrapperClass}>
        {label && (
          <label htmlFor={textareaId} className={formLabelClass}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            formControlBaseClass,
            formControlBorderClass(Boolean(error)),
            'min-h-[100px] resize-y',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {hint && !error && <p className={formHintClass}>{hint}</p>}
        {error && <p className={formErrorClass}>{error}</p>}
      </div>
    )
  },
)

AppTextarea.displayName = 'AppTextarea'

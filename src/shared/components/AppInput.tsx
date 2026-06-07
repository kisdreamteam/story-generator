import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import {
  formControlBaseClass,
  formControlBorderClass,
  formErrorClass,
  formFieldWrapperClass,
  formHintClass,
  formLabelClass,
} from '@/shared/styles/formFieldClasses'

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={formFieldWrapperClass}>
        {label && (
          <label htmlFor={inputId} className={formLabelClass}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[formControlBaseClass, formControlBorderClass(Boolean(error)), className]
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

AppInput.displayName = 'AppInput'

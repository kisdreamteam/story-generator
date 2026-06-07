import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import {
  formControlBaseClass,
  formControlBorderClass,
  formErrorClass,
  formFieldWrapperClass,
  formHintClass,
  formLabelClass,
} from '@/shared/styles/formFieldClasses'

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
      <div className={formFieldWrapperClass}>
        {label && (
          <label htmlFor={selectId} className={formLabelClass}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[formControlBaseClass, formControlBorderClass(Boolean(error)), className]
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
        {hint && !error && <p className={formHintClass}>{hint}</p>}
        {error && <p className={formErrorClass}>{error}</p>}
      </div>
    )
  },
)

AppSelect.displayName = 'AppSelect'

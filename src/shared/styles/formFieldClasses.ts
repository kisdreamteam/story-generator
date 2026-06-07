/** Shared form field styling — used by AppInput, AppTextarea, and AppSelect. */

export const formFieldWrapperClass = 'flex flex-col gap-1.5'

export const formLabelClass = 'text-sm font-medium text-stone-700'

export const formHintClass = 'text-xs text-stone-500'

export const formErrorClass = 'text-xs text-red-600'

export const formControlBaseClass = [
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900',
  'placeholder:text-stone-400',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
  'disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500',
].join(' ')

export const formControlBorderClass = (hasError: boolean) =>
  hasError ? 'border-red-400' : 'border-stone-200'

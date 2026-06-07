/** Shared button layout + variant classes — AppButton source; reuse on link-styled actions. */

export const appButtonLayoutClass = [
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed',
].join(' ')

export const appButtonSecondaryClass = [
  'bg-white text-stone-800 border border-stone-200',
  'hover:bg-stone-50 focus-visible:ring-stone-300',
  'disabled:bg-stone-100 disabled:text-stone-400',
].join(' ')

export const appButtonSizeMdClass = 'px-4 py-2 text-sm'

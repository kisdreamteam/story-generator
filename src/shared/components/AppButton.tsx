import type { ButtonHTMLAttributes, ReactNode } from 'react'

type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type AppButtonSize = 'sm' | 'md' | 'lg'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: AppButtonVariant
  size?: AppButtonSize
  fullWidth?: boolean
}

const variantClasses: Record<AppButtonVariant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-400 disabled:bg-stone-300 disabled:text-stone-500',
  secondary:
    'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 focus-visible:ring-stone-300 disabled:bg-stone-100 disabled:text-stone-400',
  ghost:
    'bg-transparent text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-300 disabled:text-stone-400',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400 disabled:bg-stone-300',
}

const sizeClasses: Record<AppButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function AppButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: AppButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

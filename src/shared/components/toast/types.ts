export type ToastTone = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  tone: ToastTone
  title: string
  description?: string
  /** Auto-dismiss after ms. Set 0 to persist until dismissed. Default 5000. */
  duration?: number
}

export interface ToastInput {
  tone: ToastTone
  title: string
  description?: string
  duration?: number
}

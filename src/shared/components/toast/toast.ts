import type { ToastInput, ToastTone } from './types'
import { useToastStore } from '@/shared/stores/toastStore'

function pushToast(tone: ToastTone, title: string, description?: string, duration?: number): string {
  const input: ToastInput = { tone, title, description, duration }
  return useToastStore.getState().push(input)
}

/** Imperative toast API — safe to call outside React components. */
export const toast = {
  success(title: string, description?: string, duration?: number) {
    return pushToast('success', title, description, duration)
  },
  error(title: string, description?: string, duration?: number) {
    return pushToast('error', title, description, duration)
  },
  warning(title: string, description?: string, duration?: number) {
    return pushToast('warning', title, description, duration)
  },
  info(title: string, description?: string, duration?: number) {
    return pushToast('info', title, description, duration)
  },
  dismiss(id: string) {
    useToastStore.getState().dismiss(id)
  },
  clear() {
    useToastStore.getState().clear()
  },
}

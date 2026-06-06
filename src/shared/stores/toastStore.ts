import { create } from 'zustand'
import type { ToastInput, ToastItem } from '@/shared/components/toast/types'

export const DEFAULT_TOAST_DURATION_MS = 5000
export const MAX_STACKED_TOASTS = 4

interface ToastStore {
  toasts: ToastItem[]
  push: (input: ToastInput) => string
  dismiss: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  push: (input) => {
    const id = crypto.randomUUID()
    const toast: ToastItem = {
      id,
      tone: input.tone,
      title: input.title,
      description: input.description,
      duration: input.duration ?? DEFAULT_TOAST_DURATION_MS,
    }

    set((state) => ({
      toasts: [...state.toasts, toast].slice(-MAX_STACKED_TOASTS),
    }))

    return id
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clear: () => {
    set({ toasts: [] })
  },
}))

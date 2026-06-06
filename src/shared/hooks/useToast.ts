import { toast } from '@/shared/components/toast'
import { storyFeedback } from '@/shared/feedback/storyFeedback'

/** Hook wrapper around the global toast API. */
export function useToast() {
  return {
    toast,
    storyFeedback,
    dismiss: toast.dismiss,
    clear: toast.clear,
  }
}

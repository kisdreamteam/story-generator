import { SaveStatusIndicator } from '@/shared/components/SaveStatusIndicator'
import type { StoryAutosaveStatus } from '../utils/storyAutosaveStatus'

interface StoryAutosaveStatusProps {
  status: StoryAutosaveStatus
  className?: string
}

export function StoryAutosaveStatus({ status, className }: StoryAutosaveStatusProps) {
  return <SaveStatusIndicator status={status} className={className} />
}

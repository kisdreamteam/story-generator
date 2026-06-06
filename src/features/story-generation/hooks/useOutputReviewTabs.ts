import { useState } from 'react'
import type { OutputReviewTab } from '../config/outputReviewTabs'

export function useOutputReviewTabs(initialTab: OutputReviewTab = 'story') {
  const [activeTab, setActiveTab] = useState<OutputReviewTab>(initialTab)

  return { activeTab, setActiveTab }
}

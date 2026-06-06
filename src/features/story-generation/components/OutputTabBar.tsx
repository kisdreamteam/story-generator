import type { OutputReviewTab } from '../config/outputReviewTabs'
import { outputReviewTabs } from '../config/outputReviewTabs'

interface OutputTabBarProps {
  activeTab: OutputReviewTab
  onTabChange: (tab: OutputReviewTab) => void
}

export function OutputTabBar({ activeTab, onTabChange }: OutputTabBarProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-lg border border-stone-200 bg-white p-1"
      aria-label="Story review sections"
    >
      {outputReviewTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={[
            'shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-brand-500 text-white'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
            tab.id === 'debug' ? 'text-stone-500' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

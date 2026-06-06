import { PageHeader } from '@/shared/components'
import { AccountAuthPanel } from '../components/AccountAuthPanel'

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Account sign-in and classroom preferences."
      />

      <div className="space-y-6">
        <AccountAuthPanel />

        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8">
          <p className="text-sm font-medium text-stone-800">Coming soon</p>
          <ul className="mt-4 space-y-2 text-sm text-stone-500">
            <li>Default age range</li>
            <li>Preferred story length</li>
            <li>Language options</li>
          </ul>
        </div>
      </div>
    </>
  )
}

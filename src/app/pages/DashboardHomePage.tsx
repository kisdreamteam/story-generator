import { Link } from 'react-router-dom'
import { AppButton, AppCard, PageHeader } from '../../shared/components'

export function DashboardHomePage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Start a new story, review your work, or adjust settings."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AppCard hoverable>
          <h2 className="text-base font-semibold text-stone-900">Create a story</h2>
          <p className="mt-2 text-sm text-stone-600">
            Set up a new Nina & Nino adventure for your class.
          </p>
          <Link to="/dashboard/create" className="mt-4 inline-block">
            <AppButton size="sm">Go to Create Story</AppButton>
          </Link>
        </AppCard>

        <AppCard hoverable>
          <h2 className="text-base font-semibold text-stone-900">Your stories</h2>
          <p className="mt-2 text-sm text-stone-600">
            Browse saved projects and open recent work.
          </p>
          <Link to="/dashboard/stories" className="mt-4 inline-block">
            <AppButton variant="secondary" size="sm">
              View Stories
            </AppButton>
          </Link>
        </AppCard>

        <AppCard hoverable>
          <h2 className="text-base font-semibold text-stone-900">Settings</h2>
          <p className="mt-2 text-sm text-stone-600">
            Classroom defaults and app preferences will live here.
          </p>
          <Link to="/dashboard/settings" className="mt-4 inline-block">
            <AppButton variant="ghost" size="sm">
              Open Settings
            </AppButton>
          </Link>
        </AppCard>
      </div>
    </>
  )
}

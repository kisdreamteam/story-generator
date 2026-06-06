import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ConnectionAwarenessBar } from '@/shared/components/connection'
import { FeatureRouteBoundary } from '@/shared/components/errors'
import { RouteChunkLoading } from '../RouteChunkLoading'
import { DashboardHeader } from '../components/DashboardHeader'
import { DashboardSidebar } from '../components/DashboardSidebar'

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-stone-50">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <ConnectionAwarenessBar />
        <DashboardHeader onMenuOpen={() => setIsSidebarOpen(true)} />

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            {/*
              Suspense pairs with react-router `lazy` route loaders — shows RouteChunkLoading
              while feature chunks download instead of a blank main area.
            */}
            <Suspense fallback={<RouteChunkLoading />}>
              <FeatureRouteBoundary
                featureName="dashboard"
                title="This page ran into a problem"
                description="Something unexpected happened in your dashboard. You can try again or pick another section from the menu."
              >
                <Outlet />
              </FeatureRouteBoundary>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
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
        <DashboardHeader onMenuOpen={() => setIsSidebarOpen(true)} />

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

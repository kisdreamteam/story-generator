import { Outlet, Link } from 'react-router-dom'
import { AppButton } from '../../shared/components'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-600">Nina & Nino</span>
            <span className="hidden text-sm text-stone-500 sm:inline">Story Creator</span>
          </Link>
          <Link to="/dashboard">
            <AppButton variant="secondary" size="sm">
              Dashboard
            </AppButton>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-stone-500 sm:px-6">
          Nina & Nino Story Project Creator — Phase 1 Mock
        </div>
      </footer>
    </div>
  )
}

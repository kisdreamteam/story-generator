import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { AppButton } from '../../shared/components'
import { DashboardBreadcrumb } from '../components/DashboardBreadcrumb'

const navLinks = [
  { to: '/dashboard', label: 'Projects' },
  { to: '/projects/new', label: 'New Project' },
]

export function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-600">Nina & Nino</span>
            <span className="hidden text-sm text-stone-500 sm:inline">Story Creator</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/">
            <AppButton variant="ghost" size="sm">
              Home
            </AppButton>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <DashboardBreadcrumb pathname={location.pathname} />
          <Outlet />
        </div>
      </main>
    </div>
  )
}

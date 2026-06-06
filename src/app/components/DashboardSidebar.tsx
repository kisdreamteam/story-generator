import { Link, NavLink } from 'react-router-dom'
import { dashboardNavItems } from '../config/dashboardNav'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-stone-900/40 lg:hidden"
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="border-b border-stone-200 px-5 py-5">
          <Link to="/dashboard" className="block" onClick={onClose}>
            <span className="text-lg font-bold text-brand-600">Nina & Nino</span>
            <span className="mt-0.5 block text-xs text-stone-500">Story Creator</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {dashboardNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-stone-200 px-5 py-4">
          <Link
            to="/"
            className="text-sm text-stone-500 transition-colors hover:text-brand-600"
            onClick={onClose}
          >
            Back to home
          </Link>
        </div>
      </aside>
    </>
  )
}

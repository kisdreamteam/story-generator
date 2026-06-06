import { Link } from 'react-router-dom'

interface DashboardBreadcrumbProps {
  pathname: string
}

function getBreadcrumbLabel(pathname: string): string {
  if (pathname.includes('/setup')) return 'Story Setup'
  if (pathname.includes('/output')) return 'Story Output'
  return 'New Project'
}

export function DashboardBreadcrumb({ pathname }: DashboardBreadcrumbProps) {
  if (pathname === '/dashboard') return null

  return (
    <nav className="mb-4 text-sm text-stone-500 sm:mb-6">
      <Link to="/dashboard" className="hover:text-brand-600">
        Dashboard
      </Link>
      <span className="mx-2">/</span>
      <span className="text-stone-700">{getBreadcrumbLabel(pathname)}</span>
    </nav>
  )
}

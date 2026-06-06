export interface DashboardNavItem {
  to: string
  label: string
  end?: boolean
}

export const dashboardNavItems: DashboardNavItem[] = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/create', label: 'Create Story' },
  { to: '/dashboard/stories', label: 'Stories' },
  { to: '/dashboard/settings', label: 'Settings' },
]

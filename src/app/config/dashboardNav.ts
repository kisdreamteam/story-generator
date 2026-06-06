export interface DashboardNavItem {
  to: string
  labelKey: string
  end?: boolean
}

export const dashboardNavItems: DashboardNavItem[] = [
  { to: '/dashboard', labelKey: 'dashboard', end: true },
  { to: '/dashboard/create', labelKey: 'createStory' },
  { to: '/dashboard/stories', labelKey: 'stories' },
  { to: '/dashboard/classrooms', labelKey: 'classrooms' },
  { to: '/dashboard/settings', labelKey: 'settings' },
]

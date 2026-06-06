export function formatStoryDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getStoryStatusBadgeClasses(statusLabel: string): string {
  if (statusLabel === 'Saved story') {
    return 'bg-brand-50 text-brand-800'
  }

  return 'bg-amber-50 text-amber-800'
}

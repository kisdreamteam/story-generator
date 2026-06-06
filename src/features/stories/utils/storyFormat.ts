export function formatStoryDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getStoryStatusBadgeClasses(statusLabel: string): string {
  switch (statusLabel) {
    case 'Saved':
    case 'Saved to library':
      return 'bg-brand-50 text-brand-800'
    case 'Ready to save':
    case 'Not saved yet':
      return 'bg-sky-50 text-sky-900'
    case 'Story plan':
    case 'Plan saved':
      return 'bg-amber-50 text-amber-900'
    case 'Sample story':
    case 'Mock draft':
      return 'bg-stone-100 text-stone-700'
    case 'Draft':
      return 'bg-amber-50 text-amber-900'
    default:
      return 'bg-stone-100 text-stone-700'
  }
}

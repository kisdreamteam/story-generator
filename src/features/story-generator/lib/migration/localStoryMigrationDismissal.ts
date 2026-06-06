const DISMISS_KEY = 'story-local-to-cloud-migration-dismissed'

interface DismissRecord {
  fingerprint: string
}

export function buildPendingStoriesFingerprint(localIds: string[]): string {
  return [...localIds].sort().join('|')
}

export function isLocalStoryMigrationDismissed(fingerprint: string): boolean {
  if (!fingerprint) return false

  try {
    if (typeof localStorage === 'undefined') return false

    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return false

    return (parsed as DismissRecord).fingerprint === fingerprint
  } catch {
    return false
  }
}

export function dismissLocalStoryMigrationPrompt(fingerprint: string): void {
  if (!fingerprint) return

  try {
    if (typeof localStorage === 'undefined') return

    const record: DismissRecord = { fingerprint }
    localStorage.setItem(DISMISS_KEY, JSON.stringify(record))
  } catch {
    // Ignore storage errors.
  }
}

export function clearLocalStoryMigrationDismissal(): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.removeItem(DISMISS_KEY)
  } catch {
    // Ignore storage errors.
  }
}

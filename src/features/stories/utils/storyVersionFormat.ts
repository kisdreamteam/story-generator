/** Format a version badge for library cards and detail headers. */
export function formatStoryVersionBadge(version?: number): string | null {
  if ((version ?? 0) <= 0) {
    return null
  }

  return `Edited · v${version}`
}

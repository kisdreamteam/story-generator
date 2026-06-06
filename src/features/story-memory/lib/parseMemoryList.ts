/** Split free-text fields into deduplicated, trimmed list entries. */
export function parseMemoryList(value: string | undefined | null): string[] {
  if (!value?.trim()) return []

  const seen = new Set<string>()
  const items: string[] = []

  for (const part of value.split(/[,;\n]+/)) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue

    seen.add(key)
    items.push(trimmed)
  }

  return items
}

/** Merge list fields case-insensitively while preserving first-seen casing. */
export function mergeMemoryLists(...lists: string[][]): string[] {
  const seen = new Set<string>()
  const merged: string[] = []

  for (const list of lists) {
    for (const item of list) {
      const trimmed = item.trim()
      if (!trimmed) continue

      const key = trimmed.toLowerCase()
      if (seen.has(key)) continue

      seen.add(key)
      merged.push(trimmed)
    }
  }

  return merged
}

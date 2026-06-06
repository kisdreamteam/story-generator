const MIGRATION_MAP_KEY = 'story-local-to-cloud-migration-map'
const CLOUD_ID_MAP_PREFIX = 'story-cloud-id:'

export interface LocalCloudMigrationEntry {
  cloudId: string
  migratedAt: string
}

export type LocalCloudMigrationMap = Record<string, LocalCloudMigrationEntry>

function readMap(): LocalCloudMigrationMap {
  try {
    if (typeof localStorage === 'undefined') return {}

    const raw = localStorage.getItem(MIGRATION_MAP_KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    return parsed as LocalCloudMigrationMap
  } catch {
    return {}
  }
}

function writeMap(map: LocalCloudMigrationMap): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(MIGRATION_MAP_KEY, JSON.stringify(map))
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function getLocalCloudMigrationMap(): LocalCloudMigrationMap {
  return readMap()
}

export function getLocalCloudMigrationEntry(localId: string): LocalCloudMigrationEntry | null {
  if (!localId) return null
  return readMap()[localId] ?? null
}

export function setLocalCloudMigrationEntry(localId: string, cloudId: string): void {
  if (!localId || !cloudId) return

  const map = readMap()
  map[localId] = {
    cloudId,
    migratedAt: new Date().toISOString(),
  }
  writeMap(map)
  syncSessionCloudIdMapping(localId, cloudId)
}

/** Align with supabaseStoryStorageAdapter resolveProjectId sessionStorage keys. */
export function syncSessionCloudIdMapping(localId: string, cloudId: string): void {
  try {
    if (typeof sessionStorage === 'undefined') return

    sessionStorage.setItem(`${CLOUD_ID_MAP_PREFIX}${localId}`, cloudId)
  } catch {
    // Ignore sessionStorage errors.
  }
}

export function removeLocalCloudMigrationEntry(localId: string): void {
  if (!localId) return

  const map = readMap()
  if (!(localId in map)) return

  delete map[localId]
  writeMap(map)
}

export function removeSessionCloudIdMapping(localId: string): void {
  try {
    if (typeof sessionStorage === 'undefined') return

    sessionStorage.removeItem(`${CLOUD_ID_MAP_PREFIX}${localId}`)
  } catch {
    // Ignore sessionStorage errors.
  }
}

/** Remove local-to-cloud id mappings after a cloud story is deleted. */
export function clearStoryIdMappings(localId: string): void {
  if (!localId) return

  removeLocalCloudMigrationEntry(localId)
  removeSessionCloudIdMapping(localId)
}

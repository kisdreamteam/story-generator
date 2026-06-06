import type { AppSettingsStorageAdapter } from './AppSettingsStorageAdapter'
import { localAppSettingsStorageAdapter } from './localAppSettingsStorageAdapter'

/** Resolve the active app settings storage adapter. Local-only until account sync ships. */
export function resolveAppSettingsStorageAdapter(): AppSettingsStorageAdapter {
  return localAppSettingsStorageAdapter
}

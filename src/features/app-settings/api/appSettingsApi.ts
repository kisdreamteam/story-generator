import { resolveAppSettingsStorageAdapter } from '../storage'
import type { AppSettings, AppSettingsInput } from '../types'

export function getAppSettings(): AppSettings {
  return resolveAppSettingsStorageAdapter().getSettings()
}

export function saveAppSettings(input: AppSettingsInput): AppSettings {
  return resolveAppSettingsStorageAdapter().saveSettings(input)
}

export function clearAppSettings(): void {
  resolveAppSettingsStorageAdapter().clearSettings()
}

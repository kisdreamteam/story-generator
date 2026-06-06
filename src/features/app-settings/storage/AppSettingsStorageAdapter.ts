import type { AppSettings, AppSettingsInput } from '../types'

/** Persistence boundary — localStorage today, account sync later. */
export interface AppSettingsStorageAdapter {
  getSettings(): AppSettings
  saveSettings(input: AppSettingsInput): AppSettings
  clearSettings(): void
}

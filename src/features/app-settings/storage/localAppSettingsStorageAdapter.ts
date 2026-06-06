import { DEFAULT_APP_SETTINGS } from '../lib/defaultAppSettings'
import type { AppSettings, AppSettingsInput } from '../types'
import type { AppSettingsStorageAdapter } from './AppSettingsStorageAdapter'
import { mergeAppSettingsInput, normalizeAppSettings } from './normalizeAppSettings'

export const APP_SETTINGS_STORAGE_KEY = 'story-generator:app-settings'

function readSettings(): AppSettings {
  try {
    if (typeof localStorage === 'undefined') {
      return { ...DEFAULT_APP_SETTINGS }
    }

    const raw = localStorage.getItem(APP_SETTINGS_STORAGE_KEY)
    if (!raw) {
      return { ...DEFAULT_APP_SETTINGS }
    }

    return normalizeAppSettings(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_APP_SETTINGS }
  }
}

function writeSettings(settings: AppSettings): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore write failures (private mode, quota, etc.).
  }
}

export const localAppSettingsStorageAdapter: AppSettingsStorageAdapter = {
  getSettings(): AppSettings {
    return readSettings()
  },

  saveSettings(input: AppSettingsInput): AppSettings {
    const next = mergeAppSettingsInput(readSettings(), input)
    writeSettings(next)
    return next
  },

  clearSettings(): void {
    try {
      if (typeof localStorage === 'undefined') return

      localStorage.removeItem(APP_SETTINGS_STORAGE_KEY)
    } catch {
      // Fail safely.
    }
  },
}

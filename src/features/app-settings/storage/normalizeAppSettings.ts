import {
  AGE_RANGE_VALUES,
  DEFAULT_LANGUAGE,
  EXTENDED_PAGE_COUNT_VALUES,
} from '@/features/story-projects/config/formOptions'
import { defaultSeries, getSeriesById, seriesList } from '@/features/series/services/series.service'
import { DEFAULT_APP_SETTINGS } from '../lib/defaultAppSettings'
import type { AppSettings, AppSettingsInput } from '../types'

const STORY_LENGTH_VALUES = new Set<string>(EXTENDED_PAGE_COUNT_VALUES)

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function resolveLanguage(value: string): string {
  return value === DEFAULT_LANGUAGE ? DEFAULT_LANGUAGE : DEFAULT_LANGUAGE
}

function resolveAgeRange(value: string): string {
  return AGE_RANGE_VALUES.includes(value as (typeof AGE_RANGE_VALUES)[number]) ? value : '4-6'
}

function resolveStoryLength(value: string): string {
  return STORY_LENGTH_VALUES.has(value) ? value : DEFAULT_APP_SETTINGS.defaultStoryLength
}

function resolveSeriesId(value: string): string {
  const series = getSeriesById(value)
  if (series?.available) {
    return series.id
  }

  return defaultSeries.id
}

/** Normalize stored or in-memory values into the current app settings model. */
export function normalizeAppSettings(value: unknown): AppSettings {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_APP_SETTINGS }
  }

  const record = value as Partial<AppSettings>
  const now = new Date().toISOString()

  return {
    defaultLanguage: resolveLanguage(readString(record.defaultLanguage)),
    defaultAgeRange: resolveAgeRange(readString(record.defaultAgeRange)),
    defaultStoryLength: resolveStoryLength(readString(record.defaultStoryLength)),
    defaultSeriesId: resolveSeriesId(readString(record.defaultSeriesId)),
    updatedAt: readString(record.updatedAt) || now,
  }
}

export function mergeAppSettingsInput(
  existing: AppSettings,
  input: AppSettingsInput,
): AppSettings {
  return normalizeAppSettings({
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  })
}

export function getSeriesOptionsForSettings() {
  return seriesList.map((series) => ({
    value: series.id,
    label: series.available ? series.name : `${series.name} (Coming soon)`,
    disabled: !series.available,
  }))
}

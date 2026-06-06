export interface AppSettings {
  defaultLanguage: string
  defaultAgeRange: string
  defaultStoryLength: string
  defaultSeriesId: string
  updatedAt: string
}

export type AppSettingsInput = Pick<
  AppSettings,
  'defaultLanguage' | 'defaultAgeRange' | 'defaultStoryLength' | 'defaultSeriesId'
>

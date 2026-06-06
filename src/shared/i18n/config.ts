export const DEFAULT_UI_LOCALE = 'en' as const

/** UI locales prepared for future translation. English is the only complete locale today. */
export const SUPPORTED_UI_LOCALES = ['en', 'ko', 'vi'] as const

export type UiLocale = (typeof SUPPORTED_UI_LOCALES)[number]

export function isUiLocale(value: string): value is UiLocale {
  return (SUPPORTED_UI_LOCALES as readonly string[]).includes(value)
}

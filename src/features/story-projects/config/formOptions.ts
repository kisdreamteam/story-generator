import { i18n } from '@/shared/i18n'

export const DEFAULT_LANGUAGE = 'English'

export const STORY_LANGUAGE_VALUES = ['English', 'KR', 'VI'] as const
export const AGE_RANGE_VALUES = ['3-4', '4-6', '6-8'] as const
export const PAGE_COUNT_VALUES = ['4', '5', '6', '8'] as const
export const EXTENDED_PAGE_COUNT_VALUES = [...PAGE_COUNT_VALUES, '12'] as const

export interface FormSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export function getLanguageOptions(): FormSelectOption[] {
  return [
    { value: 'English', label: i18n.t('forms:storyLanguage.english') },
    { value: 'KR', label: i18n.t('forms:storyLanguage.koreanComingSoon'), disabled: true },
    { value: 'VI', label: i18n.t('forms:storyLanguage.vietnameseComingSoon'), disabled: true },
  ]
}

export function getAgeGroupOptions(): FormSelectOption[] {
  return AGE_RANGE_VALUES.map((value) => ({
    value,
    label: getAgeRangeLabel(value),
  }))
}

export function getPageCountOptions(includeExtended = false): FormSelectOption[] {
  const values = includeExtended ? EXTENDED_PAGE_COUNT_VALUES : PAGE_COUNT_VALUES

  return values.map((value) => ({
    value,
    label: getPageCountLabel(value),
  }))
}

export function getAgeRangeLabel(value: string): string {
  return i18n.t(`forms:ageRange.${value}`, { defaultValue: value })
}

export function getLanguageLabel(value: string): string {
  if (value === 'English') {
    return i18n.t('forms:storyLanguage.english')
  }

  if (value === 'KR') {
    return i18n.t('forms:storyLanguage.koreanComingSoon')
  }

  if (value === 'VI') {
    return i18n.t('forms:storyLanguage.vietnameseComingSoon')
  }

  return value
}

export function getPageCountLabel(value: string): string {
  return i18n.t(`forms:pageCount.${value}`, {
    defaultValue: i18n.t('forms:pageCount.fallback', { count: value }),
  })
}

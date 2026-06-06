import {
  getAgeGroupOptions,
  getLanguageOptions,
  getPageCountOptions,
} from '@/features/story-projects/config/formOptions'
import { AppButton, AppSelect, SectionCard } from '@/shared/components'
import { useTranslation } from '@/shared/i18n'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { getSeriesOptionsForSettings } from '../storage'
import type { AppSettings, AppSettingsInput } from '../types'

interface AppSettingsFormProps {
  settings: AppSettings
  isSaving: boolean
  onSave: (input: AppSettingsInput) => void
}

export function AppSettingsForm({ settings, isSaving, onSave }: AppSettingsFormProps) {
  const { t } = useTranslation(['settings', 'common'])
  const [values, setValues] = useState<AppSettingsInput>({
    defaultLanguage: settings.defaultLanguage,
    defaultAgeRange: settings.defaultAgeRange,
    defaultStoryLength: settings.defaultStoryLength,
    defaultSeriesId: settings.defaultSeriesId,
  })

  useEffect(() => {
    setValues({
      defaultLanguage: settings.defaultLanguage,
      defaultAgeRange: settings.defaultAgeRange,
      defaultStoryLength: settings.defaultStoryLength,
      defaultSeriesId: settings.defaultSeriesId,
    })
  }, [settings])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSave(values)
  }

  return (
    <form onSubmit={handleSubmit}>
      <SectionCard title={t('settings:storyDefaultsTitle')} description={t('settings:storyDefaultsDescription')}>
        <div className="space-y-4">
          <AppSelect
            label={t('settings:defaultLanguage')}
            value={values.defaultLanguage}
            onChange={(event) =>
              setValues((current) => ({ ...current, defaultLanguage: event.target.value }))
            }
            options={getLanguageOptions()}
            hint={t('settings:defaultLanguageHint')}
          />

          <AppSelect
            label={t('settings:defaultAgeRange')}
            value={values.defaultAgeRange}
            onChange={(event) =>
              setValues((current) => ({ ...current, defaultAgeRange: event.target.value }))
            }
            options={getAgeGroupOptions()}
            hint={t('settings:defaultAgeRangeHint')}
          />

          <AppSelect
            label={t('settings:defaultStoryLength')}
            value={values.defaultStoryLength}
            onChange={(event) =>
              setValues((current) => ({ ...current, defaultStoryLength: event.target.value }))
            }
            options={getPageCountOptions(true)}
            hint={t('settings:defaultStoryLengthHint')}
          />

          <AppSelect
            label={t('settings:defaultSeries')}
            value={values.defaultSeriesId}
            onChange={(event) =>
              setValues((current) => ({ ...current, defaultSeriesId: event.target.value }))
            }
            options={getSeriesOptionsForSettings()}
            hint={t('settings:defaultSeriesHint')}
          />

          <div className="flex justify-end pt-2">
            <AppButton type="submit" disabled={isSaving}>
              {isSaving ? t('common:saving') : t('settings:saveDefaults')}
            </AppButton>
          </div>
        </div>
      </SectionCard>
    </form>
  )
}

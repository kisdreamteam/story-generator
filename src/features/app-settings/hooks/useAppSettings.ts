import { toast } from '@/shared/components/toast'
import { useCallback, useState } from 'react'
import { useTranslation } from '@/shared/i18n'
import { getAppSettings, saveAppSettings } from '../api'
import type { AppSettings, AppSettingsInput } from '../types'

export interface UseAppSettingsResult {
  settings: AppSettings
  isSaving: boolean
  saveSettings: (input: AppSettingsInput) => void
}

export function useAppSettings(): UseAppSettingsResult {
  const { t } = useTranslation('common')
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings())
  const [isSaving, setIsSaving] = useState(false)

  const saveSettings = useCallback(
    (input: AppSettingsInput) => {
      setIsSaving(true)

      try {
        const saved = saveAppSettings(input)
        setSettings(saved)
        toast.success(t('settingsSaved'), t('settingsSavedDescription'))
      } finally {
        setIsSaving(false)
      }
    },
    [t],
  )

  return { settings, isSaving, saveSettings }
}

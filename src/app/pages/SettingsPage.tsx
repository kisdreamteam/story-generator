import { PageHeader } from '@/shared/components'
import { AppSettingsForm, useAppSettings } from '@/features/app-settings'
import { useTranslation } from '@/shared/i18n'
import { AccountAuthPanel } from '../components/AccountAuthPanel'

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const { settings, isSaving, saveSettings } = useAppSettings()

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />

      <div className="space-y-6">
        <AccountAuthPanel />

        <AppSettingsForm settings={settings} isSaving={isSaving} onSave={saveSettings} />
      </div>
    </>
  )
}

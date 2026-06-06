import { Link } from 'react-router-dom'
import { AppButton, AppCard, PageHeader } from '../../shared/components'
import { useTranslation } from '@/shared/i18n'

export function DashboardHomePage() {
  const { t } = useTranslation('dashboard')

  return (
    <>
      <PageHeader title={t('homeTitle')} description={t('homeDescription')} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AppCard hoverable>
          <h2 className="text-base font-semibold text-stone-900">{t('createStoryTitle')}</h2>
          <p className="mt-2 text-sm text-stone-600">{t('createStoryDescription')}</p>
          <Link to="/dashboard/create" className="mt-4 inline-block">
            <AppButton size="sm">{t('createStoryAction')}</AppButton>
          </Link>
        </AppCard>

        <AppCard hoverable>
          <h2 className="text-base font-semibold text-stone-900">{t('storiesTitle')}</h2>
          <p className="mt-2 text-sm text-stone-600">{t('storiesDescription')}</p>
          <Link to="/dashboard/stories" className="mt-4 inline-block">
            <AppButton variant="secondary" size="sm">
              {t('storiesAction')}
            </AppButton>
          </Link>
        </AppCard>

        <AppCard hoverable>
          <h2 className="text-base font-semibold text-stone-900">{t('classroomsTitle')}</h2>
          <p className="mt-2 text-sm text-stone-600">{t('classroomsDescription')}</p>
          <Link to="/dashboard/classrooms" className="mt-4 inline-block">
            <AppButton variant="secondary" size="sm">
              {t('classroomsAction')}
            </AppButton>
          </Link>
        </AppCard>

        <AppCard hoverable>
          <h2 className="text-base font-semibold text-stone-900">{t('settingsTitle')}</h2>
          <p className="mt-2 text-sm text-stone-600">{t('settingsDescription')}</p>
          <Link to="/dashboard/settings" className="mt-4 inline-block">
            <AppButton variant="ghost" size="sm">
              {t('settingsAction')}
            </AppButton>
          </Link>
        </AppCard>
      </div>
    </>
  )
}

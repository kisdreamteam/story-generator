import { Link } from 'react-router-dom'
import { AppButton } from '../../shared/components'
import { StorageStatusIndicator } from '@/app/components/StorageStatusIndicator'
import { useAuth } from '@/shared/lib/supabase/useAuth'
import { useTranslation } from '@/shared/i18n'

interface DashboardHeaderProps {
  onMenuOpen: () => void
}

export function DashboardHeader({ onMenuOpen }: DashboardHeaderProps) {
  const { t } = useTranslation(['common', 'nav'])
  const { isAuthAvailable, isAuthenticated, isLoading, user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuOpen}
            aria-label={t('common:openNavMenu')}
          >
            {t('common:menu')}
          </AppButton>
          <div>
            <p className="text-sm font-semibold text-stone-900">{t('nav:teacherDashboard')}</p>
            <p className="text-xs text-stone-500">{t('nav:teacherDashboardDescription')}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <StorageStatusIndicator compact className="items-end" />

          <div className="flex items-center gap-2 text-xs">
            {isAuthAvailable && isLoading && (
              <span className="text-stone-400">{t('common:checkingSession')}</span>
            )}
            {isAuthAvailable && !isLoading && isAuthenticated && (
              <>
                <span className="hidden max-w-[12rem] truncate text-stone-600 sm:inline">
                  {user?.email}
                </span>
                <AppButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    void signOut()
                  }}
                >
                  {t('common:signOut')}
                </AppButton>
              </>
            )}
            {isAuthAvailable && !isLoading && !isAuthenticated && (
              <Link
                to="/dashboard/settings"
                className="font-medium text-brand-700 hover:text-brand-800"
              >
                {t('common:signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

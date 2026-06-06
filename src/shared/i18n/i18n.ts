import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_UI_LOCALE } from './config'
import enCommon from './locales/en/common.json'
import enDashboard from './locales/en/dashboard.json'
import enForms from './locales/en/forms.json'
import enNav from './locales/en/nav.json'
import enSettings from './locales/en/settings.json'
import koCommon from './locales/ko/common.json'
import koDashboard from './locales/ko/dashboard.json'
import koForms from './locales/ko/forms.json'
import koNav from './locales/ko/nav.json'
import koSettings from './locales/ko/settings.json'
import viCommon from './locales/vi/common.json'
import viDashboard from './locales/vi/dashboard.json'
import viForms from './locales/vi/forms.json'
import viNav from './locales/vi/nav.json'
import viSettings from './locales/vi/settings.json'

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      nav: enNav,
      settings: enSettings,
      forms: enForms,
      dashboard: enDashboard,
    },
    ko: {
      common: koCommon,
      nav: koNav,
      settings: koSettings,
      forms: koForms,
      dashboard: koDashboard,
    },
    vi: {
      common: viCommon,
      nav: viNav,
      settings: viSettings,
      forms: viForms,
      dashboard: viDashboard,
    },
  },
  lng: DEFAULT_UI_LOCALE,
  fallbackLng: DEFAULT_UI_LOCALE,
  defaultNS: 'common',
  ns: ['common', 'nav', 'settings', 'forms', 'dashboard'],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n

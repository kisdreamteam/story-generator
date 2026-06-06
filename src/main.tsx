import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './app/routes'
import { AuthProvider } from '@/shared/lib/supabase/AuthProvider'

if (import.meta.env.DEV) {
  void import('@/shared/lib/supabase/cloudStorageTestKit').then((kit) => {
    ;(window as Window & { __storyCloudTest?: typeof kit }).__storyCloudTest = kit
    console.info('[Story Cloud Test] Optional dev helpers: window.__storyCloudTest')
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>,
)

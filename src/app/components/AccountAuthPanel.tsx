import { AppButton, AppInput, SectionCard } from '@/shared/components'
import { StorageStatusIndicator } from '@/app/components/StorageStatusIndicator'
import { LocalStoryMigrationPrompt } from '@/app/components/LocalStoryMigrationPrompt'
import { useAuth } from '@/shared/lib/supabase/useAuth'
import { useState } from 'react'

type AuthMode = 'sign-in' | 'sign-up'

export function AccountAuthPanel() {
  const { isAuthAvailable, isAuthenticated, isLoading, user, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isAuthAvailable) {
    return (
      <SectionCard title="Account" description="Teacher sign-in for cloud story storage.">
        <StorageStatusIndicator className="mb-4" />
        <p className="text-sm text-stone-600">
          Account sign-in is not available on this build. Stories stay on this device only.
        </p>
      </SectionCard>
    )
  }

  if (isLoading) {
    return (
      <SectionCard title="Account" description="Restoring your session…">
        <StorageStatusIndicator className="mb-4" />
        <p className="text-sm text-stone-500">Checking sign-in status…</p>
      </SectionCard>
    )
  }

  if (isAuthenticated && user) {
    return (
      <SectionCard title="Account" description="Your teacher account on this project.">
        <StorageStatusIndicator className="mb-4" />
        <LocalStoryMigrationPrompt className="mb-4" />

        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-xs font-medium text-stone-500">Email</dt>
            <dd className="text-stone-800">{user.email}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <AppButton
            type="button"
            variant="secondary"
            onClick={() => {
              setError(null)
              setMessage(null)
              void signOut().catch((err: unknown) => {
                setError(err instanceof Error ? err.message : 'Sign out failed')
              })
            }}
          >
            Sign out
          </AppButton>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <p className="mt-3 text-xs text-stone-500">
          Signing out saves new stories on this device only. Stories already in your account stay
          there.
        </p>
      </SectionCard>
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsSubmitting(true)

    try {
      if (mode === 'sign-in') {
        await signIn(email, password)
        setMessage('You are signed in.')
      } else {
        const result = await signUp(email, password)
        if (result.needsEmailConfirmation) {
          setMessage('Check your email to confirm your account, then sign in.')
        } else {
          setMessage('Account created. You are signed in.')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SectionCard title="Account" description="Sign in to save stories to your teacher account.">
      <StorageStatusIndicator className="mb-4" />

      <div className="mb-4 flex gap-2">
        <AppButton
          type="button"
          variant={mode === 'sign-in' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setMode('sign-in')}
        >
          Sign in
        </AppButton>
        <AppButton
          type="button"
          variant={mode === 'sign-up' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setMode('sign-up')}
        >
          Sign up
        </AppButton>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
        <AppInput
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <AppInput
          label="Password"
          type="password"
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-green-700" role="status">
            {message}
          </p>
        )}

        <AppButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </AppButton>
      </form>
    </SectionCard>
  )
}

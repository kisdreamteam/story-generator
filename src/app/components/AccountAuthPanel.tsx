import { AppButton, AppInput, ErrorState, LoadingCard, SectionCard } from '@/shared/components'
import { StorageStatusIndicator } from '@/app/components/StorageStatusIndicator'
import { LocalStoryMigrationPrompt } from '@/app/components/LocalStoryMigrationPrompt'
import { useAuth } from '@/shared/lib/supabase/useAuth'
import { formatTeacherFacingAuthError } from '@/features/story-generator/lib/story-route-guards'
import { storyFeedback, toast } from '@/shared/feedback'
import { useState } from 'react'

type AuthMode = 'sign-in' | 'sign-up'

export function AccountAuthPanel() {
  const { isAuthAvailable, isAuthenticated, isLoading, user, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isAuthAvailable) {
    return (
      <SectionCard title="Account" description="Sign in to save stories to your teacher account.">
        <StorageStatusIndicator className="mb-4" />
        <p className="text-sm text-stone-600">
          Account sign-in is not available in this version. Stories save in this browser on this
          computer.
        </p>
      </SectionCard>
    )
  }

  if (isLoading) {
    return (
      <SectionCard title="Account" description="Restoring your session…">
        <StorageStatusIndicator className="mb-4" />
        <LoadingCard
          variant="compact"
          showAction={false}
          title="Checking sign-in status"
          description="Restoring your teacher account session…"
          ariaLabel="Checking sign-in status"
        />
      </SectionCard>
    )
  }

  if (isAuthenticated && user) {
    return (
      <SectionCard title="Account" description="Your teacher account.">
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
              void signOut().catch((err: unknown) => {
                const message = formatTeacherFacingAuthError(err)
                setError(message)
                toast.error('Could not sign out', message)
              })
            }}
          >
            Sign out
          </AppButton>
        </div>

        <div className="mt-3">
          {error && <ErrorState variant="inline" tone="error" description={error} />}
        </div>

        <p className="mt-3 text-xs text-stone-500">
          After signing out, new stories save in this browser. Stories already in your account stay
          there.
        </p>
      </SectionCard>
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (mode === 'sign-in') {
        await signIn(email, password)
        storyFeedback.signedIn()
      } else {
        const result = await signUp(email, password)
        if (result.needsEmailConfirmation) {
          storyFeedback.emailConfirmationRequired()
        } else {
          storyFeedback.accountCreated()
        }
      }
    } catch (err) {
      const message = formatTeacherFacingAuthError(err)
      setError(message)
      toast.error(mode === 'sign-in' ? 'Sign in failed' : 'Sign up failed', message)
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

        {error && <ErrorState variant="inline" tone="error" description={error} />}

        <AppButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </AppButton>
      </form>
    </SectionCard>
  )
}

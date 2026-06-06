import { Link } from 'react-router-dom'
import { AppButton, AppCard } from '../../shared/components'

const features = [
  {
    title: 'English Story Projects',
    description: 'Create engaging Nina & Nino adventures with built-in vocabulary focus.',
  },
  {
    title: 'Flashcard Words',
    description: 'Auto-extract key vocabulary from each story for language learning.',
  },
  {
    title: 'Image Prompts',
    description: 'Get illustration-ready prompts for every page of your story.',
  },
]

export function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
      <section className="text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-brand-600">
          Story Project Creator
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Create English adventures with{' '}
          <span className="text-brand-600">Nina & Nino</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-stone-600 sm:text-lg">
          Plan, configure, and preview children&apos;s story projects — from theme and
          vocabulary to pages, flashcards, and illustration prompts.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/dashboard">
            <AppButton size="lg">Go to Dashboard</AppButton>
          </Link>
          <Link to="/projects/new">
            <AppButton variant="secondary" size="lg">
              Create a Project
            </AppButton>
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3 sm:gap-6">
        {features.map((feature) => (
          <AppCard key={feature.title} hoverable>
            <h2 className="text-lg font-semibold text-stone-900">{feature.title}</h2>
            <p className="mt-2 text-sm text-stone-600">{feature.description}</p>
          </AppCard>
        ))}
      </section>

      <section className="mt-12 rounded-2xl bg-brand-50 p-6 text-center sm:p-10">
        <h2 className="text-xl font-semibold text-stone-900">Phase 1 — Clickable Mock</h2>
        <p className="mt-2 text-sm text-stone-600">
          Explore the full flow with mock data. Auth, payments, and AI generation coming
          in later phases.
        </p>
      </section>
    </div>
  )
}

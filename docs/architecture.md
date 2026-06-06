# Architecture

Rules for the Nina & Nino Story Project Creator codebase.

## Feature-first structure

```
src/
├── app/                    # Tier 1 — scaffolding
│   ├── components/         # App-level UI (breadcrumbs)
│   ├── layouts/            # PublicLayout, DashboardLayout
│   ├── pages/              # LandingPage
│   └── routes.tsx
├── features/
│   ├── series/             # Series types + service
│   ├── story-projects/     # Dashboard, create, setup
│   └── story-generation/   # Output, generation contract
└── shared/
    └── components/         # Tier 3 — dumb UI primitives
```

Each feature typically contains:

- `pages/` — route entry points (compose hooks + components)
- `components/` — feature-specific UI
- `hooks/` — screen logic and local state
- `services/` — data, formatting, validation (mock now; API later)
- `config/` — static options and constants
- `types/` — feature types where split from root `types.ts`

## 3-tier visual separation

### Tier 1 — App scaffolding (`src/app/`)

- Routes and router setup
- Layouts (header, nav, breadcrumbs, outlet)
- Public landing page shell

**Rule:** Layouts must not contain business logic.

### Tier 2 — Feature logic (`src/features/`)

- Feature pages
- Feature components (ProjectCard, StoryPageList, OutputTabBar, etc.)
- Hooks that orchestrate services and UI state

**Rule:** Pages compose hooks and components; avoid large conditional blocks—extract to components or hooks.

### Tier 3 — Shared dumb UI (`src/shared/components/`)

- AppButton, AppCard, AppInput, PageHeader, SectionCard
- EmptyState, LoadingState, ErrorState, ComingSoonBadge

**Rule:** Shared components must not import feature logic or know about story-generation domain types.

## 3-layer data separation

### Layer 1 — Hooks (`features/*/hooks/`)

Examples:

- `useCreateProjectForm` — form state + navigation
- `useStorySetupForm` — setup form + builds generation input
- `useStoryOutput` — loads mock output, validation status, prompt
- `useClipboardActions` — copy + feedback state
- `useOutputReviewTabs` — tab UI state

Hooks call services and return data/callbacks for pages and components.

### Layer 2 — Stores (Zustand)

**Not used in Phase 1.**

Use Zustand later only when:

- State must persist across unrelated routes without prop drilling
- Multiple distant components need the same frequently updated state
- React Router state is no longer sufficient

Do **not** add a store for data that can live in hooks + services.

### Layer 3 — Services (`features/*/services/`)

Examples:

- `projects.service.ts` — list/get/create project ID (mock)
- `series.service.ts` — Nina & Nino series data
- `storyGeneration.service.ts` — `generateStoryOutput(input)`
- `storyPrompt.service.ts` — `buildStoryPrompt(input)`
- `validateStoryOutput.service.ts` — shape validation
- `formatClipboardText.service.ts` — plain-text formatting
- `buildProjectSummary.service.ts` — summary fields for output page

**Rule:** Mock data lives in services or dedicated mock files (e.g. `mockStoryData.ts`), never inside page components.

## Where things live

| Concern | Location |
|---------|----------|
| Routes | `src/app/routes.tsx` |
| Layouts | `src/app/layouts/` |
| Feature pages | `src/features/*/pages/` |
| Hooks | `src/features/*/hooks/` |
| Services | `src/features/*/services/` |
| Shared UI | `src/shared/components/` |
| Global styles | `src/index.css` |

## Key rules

1. Layouts: presentation and navigation only.
2. Shared components: props in, JSX out—no domain imports.
3. Feature pages: thin composers.
4. Services: pure or side-effect boundaries (API, clipboard formatting, validation).
5. Mobile-first Tailwind.
6. Do not add Supabase, auth, AI, or payments unless explicitly requested for that phase.

## Dashboard story generation (Phase 5)

The dashboard create-story flow lives in `features/story-generator/` and is separate from the legacy wizard in `features/story-generation/`.

### Flow

```
UI → useGenerationStore → useStoryGenerationFlow
  → storyGenerationService → provider → imageGenerationService
  → contract validation → persistGeneratedStory → story-storage → story detail route
```

### Boundaries

| Layer | May import | Must not import |
|-------|------------|-----------------|
| Pages / hooks | `storyGenerationService`, `useGenerationStore`, `useStoryGenerationFlow` | Providers, prompt templates, OpenAI |
| `storyGenerationService` | Providers (via resolver), contracts, usage, image service | React, UI components |
| Providers | Prompt templates, contracts | UI, storage, Zustand |
| `persistGeneratedStory` | `story-storage`, project builders | Providers |

Storage still follows Phase 4: `story-storage.ts` → `resolveStoryStorageAdapter()` → local | supabase.

Full Phase 5 summary: [phase-5-progress.md](./phase-5-progress.md).

## Tech stack

- Vite
- React 19
- TypeScript
- Tailwind CSS v4
- React Router
- Zustand — only if local state becomes too messy across screens

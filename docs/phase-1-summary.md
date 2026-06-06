# Phase 1 Summary

Phase 1 is a **clickable mock prototype** of the Nina & Nino Story Project Creator for teachers. It demonstrates the full V1 workflow using local state and mock services only.

## What Phase 1 includes

- **Landing page** with entry points to the dashboard and project creation
- **Dashboard** with project cards, status badges, and actions
- **Create project** flow (Nina & Nino series only; New Series coming soon)
- **Story setup** form with teacher-friendly defaults
- **Story output** page with tabbed review (Story, Flashcards, Image Prompts, Teacher Notes, Debug)
- **Project summary** panel on the output page
- **Copy actions** (story, flashcards, image prompts) via clipboard
- **Empty / loading / error states** for safer UX
- **Story generation contract**: input types, prompt builder, mock generation, validation
- **English-first** language defaults (Korean and Vietnamese marked coming soon)
- **Architecture**: feature-first folders, hooks, services, dumb shared UI

## What is mock only

| Area | Phase 1 behavior |
|------|------------------|
| Projects | In-memory list in `projects.service.ts` |
| Story generation | Static mock pages in `mockStoryData.ts` |
| AI prompts | Built locally, not sent to any provider |
| Validation | Shape checking only; mock output always passes in normal flow |
| Copy actions | Real clipboard; content comes from mock output |
| Route state | Project title and setup passed via React Router `location.state` |
| Series | Nina & Nino data only |

## Intentionally not built yet

- Supabase / database persistence
- Authentication and user accounts
- Payments / subscriptions
- Real AI story generation
- Real image generation
- Export to Slides, PDF, or Share
- Korean / Vietnamese translation wiring
- Page editing, regenerate page, lock page
- Duplicate project
- Zustand or global state stores

## Current routes

| Route | Page |
|-------|------|
| `/` | Landing |
| `/dashboard` | Project list |
| `/projects/new` | Create project |
| `/projects/:projectId/setup` | Story setup |
| `/projects/:projectId/output` | Story output |

## Current user flow

```
Landing
  → Dashboard
    → Create Project
      → Story Setup
        → Generate Mock Story
          → Story Output (review, copy, debug)
```

Alternative paths from the dashboard:

- **Continue Setup** → `/projects/:id/setup`
- **View Output** → `/projects/:id/output` (generated projects only)

From output:

- **Back to Setup** → setup page
- **Create Another Story** → `/projects/new`
- **Dashboard** → project list

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router
- No Zustand (local state and hooks only)

## Next phases (high level)

Phase 2+ would typically wire Supabase persistence, auth, real AI generation inside `generateStoryOutput`, and export features—without changing the UI contracts established in Phase 1.

See also: [architecture.md](./architecture.md), [story-generation-flow.md](./story-generation-flow.md).

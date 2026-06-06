# Phase 3 — Stories Feature

Scaffold for the story creation workflow under `src/features/stories/`.

---

## Purpose

The **stories** feature will own the teacher-facing story lifecycle:

- create and configure a story
- review choices before generation
- view generated output
- save, list, and reopen stories (future)

This folder is the **target home** for that workflow. It is scaffold-only today — no behavior has moved here yet.

---

## Folder map

```
src/features/stories/
  components/   Feature UI — forms, review panels, story cards, output sections
  hooks/        Screen state — setup, review, list, detail (orchestration only)
  stores/       Client state when drafts/persistence need shared storage (no Zustand yet)
  api/          Server boundary — save, load, list stories (no Supabase yet)
  types/        Story entities, workflow steps, API request/response shapes
  utils/        Pure helpers — mappers, formatters, small validators
  pages/        Route entry points that compose hooks + components
  index.ts      Feature barrel exports (minimal for now)
```

### `components/`

Dumb-to-moderate UI owned by the stories workflow. Should not import from `app/layouts`.

### `hooks/`

Local and async UI state for story screens. Call into `api/` and `utils/` — not the other way around.

### `stores/`

Reserved for shared client state (e.g. draft story, active step). **Zustand is not in the project yet** — keep using hook state until a store is justified.

### `api/`

Future home for HTTP/Supabase calls. The browser must not call AI providers directly; generation stays behind the existing server-safe boundary in `story-generation`.

### `types/`

Contracts for stories as first-class entities (draft, saved story, list item). Align with `StoryGenerationInput` / output types where they overlap.

### `utils/`

Stateless functions with no React or router imports.

### `pages/`

Pages wired from `app/routes.tsx`. Thin shells: hooks + layout of feature components.

---

## What stays unchanged (for now)

The **current working wizard** remains in existing features:

| Concern | Current location | Routes |
|---------|------------------|--------|
| Create project | `features/story-projects/` | `/projects/new` |
| Story setup + review | `features/story-projects/` | `/projects/:id/setup` |
| Generation + output | `features/story-generation/` | `/projects/:id/output` |

Dashboard shell pages under `app/pages/` (`/dashboard`, `/dashboard/create`, etc.) are Phase 3 placeholders and do not replace the wizard yet.

**Do not break these routes** when migrating code into `features/stories/`.

---

## Future migration target

When ready, move or re-export into `features/stories/`:

1. **Story setup** — guided teacher questions (from `story-projects` setup form/hook)
2. **Review step** — confirm before generate (setup review panel + validation)
3. **Output** — generated story display (from `story-generation` output page/hooks)
4. **Save / reopen** — persist drafts and finished stories (`api/` + list/detail pages)

Suggested end-state routes (not implemented yet):

- `/dashboard/stories` — library
- `/dashboard/create` or `/stories/new` — create flow
- `/stories/:id/setup` — setup
- `/stories/:id/output` — output

Migrate incrementally; keep old paths working until cutover is explicit.

---

## Related docs

- [architecture.md](./architecture.md) — feature-first rules
- [teacher-setup-flow.md](./teacher-setup-flow.md) — current setup/review/generate UX
- [story-generation-flow.md](./story-generation-flow.md) — generation contract (mock/fixture/future AI)

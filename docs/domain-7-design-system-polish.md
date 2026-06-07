# Domain 7 — Design System + Polish

Baseline audit and low-risk cleanup (Domain 7.1). Visual consistency only — no workflow, routing, or architecture changes.

---

## Current design-system baseline

| Layer | Location | Notes |
|-------|----------|-------|
| Tokens | `src/index.css` | Brand orange scale (`brand-50`–`900`), `nina` / `nino` accents, stone neutrals via Tailwind defaults |
| Global body | `src/index.css` | `bg-stone-50 text-stone-900 antialiased` |
| Form styles | `src/shared/styles/formFieldClasses.ts` | Label, hint, error, control base + border helpers |
| **Surface shells** | `src/shared/styles/surfaceClasses.ts` | `panelShellClass`, `dashedPanelShellClass`, `insetPanelShellClass`, `insetBannerClass` |
| **Page shells** | `src/shared/styles/pageShellClasses.ts` | `dashboardPageShellClass`, `dashboardPageStackClass`, `dashboardNarrowEmptyShellClass` |
| Button layout | `src/shared/styles/buttonClasses.ts` | Shared layout + secondary variant (used by `AppButton`, link actions) |
| Skeleton | `src/shared/components/loading/skeletonClasses.ts` | Pulse blocks with reduced-motion respect |

**Stack:** Tailwind v4 (`@theme`), no external UI library.

---

## Existing primitives

### Core (Tier 3 — `src/shared/components/`)

| Component | Role | Key variants / props |
|-----------|------|----------------------|
| `AppButton` | Primary actions | `primary` · `secondary` · `ghost` · `danger`; sizes `sm` · `md` · `lg`; `fullWidth` |
| `AppInput` | Text fields | `label`, `hint`, `error` |
| `AppTextarea` | Multi-line fields | Same field contract as input |
| `AppSelect` | Dropdowns | Same field contract + `options` |
| `AppCard` | Content container | Padding `sm` · `md` · `lg`; optional `hoverable` |
| `PageHeader` | Page title row | `title`, `description`, `actions` — stacks on mobile |
| `SectionCard` | Titled card section | Wraps `AppCard`; optional `badge` slot |
| `EmptyState` | No-content placeholder | Layouts `page` · `card` · `section`; optional icon, hints, action |
| `LoadingState` | Generic panel loader | Sizes `sm` · `md` |
| `ErrorState` | Error display | `panel` · `inline`; tones `error` · `warning` · `info` |
| `ComingSoonBadge` | Neutral status pill | Static “Coming soon” |
| `AppBadge` | Meta pill (counts, labels) | Tones `neutral` · `muted` · `brand` · `brandStrong` · `warning` · `outline` |
| `SaveStatusIndicator` | Autosave status pill | Tied to save lifecycle tones |
| `TeacherHelperNote` | Teacher guidance copy | `default` (bordered) · `subtle` (text only) |

### Preset wrappers (`src/shared/components/states/`)

| Component | Wraps | Purpose |
|-----------|-------|---------|
| `AppEmptyState` | `EmptyState` | Story-flow empty copy presets |
| `AppLoadingState` | Loading shells | Route-specific loading layouts |
| `AppErrorState` | `ErrorState` | Storage / migration error presets |

### Loading family (`src/shared/components/loading/`)

`LoadingCard`, `LoadingDashboard`, `LoadingGrid`, `LoadingStoryPage`, `LoadingText` — page-level skeleton layouts built on shared skeleton tokens.

---

## Token usage

### Colors

- **Brand actions:** `brand-500` / `brand-600` (buttons, bullet accents)
- **Focus rings:** `brand-400` (form controls), variant-matched rings on buttons
- **Neutrals:** `stone-*` for text, borders, backgrounds
- **Semantic:** `red-*` (errors), `amber-*` (warnings), `sky-*` (info), `green-*` (toast success)
- **Character accents:** `nina`, `nino` — reserved for character-specific UI

### Typography hierarchy (current)

| Level | Element | Classes |
|-------|---------|---------|
| Page title | `PageHeader` h1 | `text-2xl sm:text-3xl font-bold text-stone-900` |
| Section title | `SectionCard` h2 | `text-lg font-semibold text-stone-900` |
| State title (panel) | `LoadingState` / `EmptyState` / `ErrorState` | `text-lg font-semibold` (compact: `text-base` or `text-sm`) |
| Body | Descriptions | `text-sm text-stone-600` (page desc may be `sm:text-base`) |
| Labels | Form labels | `text-sm font-medium text-stone-700` |
| Hints / meta | Form hints, badges | `text-xs` |

### Spacing & radius

- **Radius:** `rounded-lg` (controls, inline banners), `rounded-xl` (cards, panels)
- **Card padding:** `p-4` · `p-5` · `p-6` via `AppCard`
- **Page header margin:** `mb-6 sm:mb-8`
- **Form field gap:** `gap-1.5` between label, control, hint
- **State panel padding:** `px-6 py-12` (md), `px-4 py-8` (sm)

---

## Component rules

1. **Prefer primitives** — use `AppButton`, `AppInput`, `AppCard`, etc. before one-off styling.
2. **Use shared style modules** — `formFieldClasses`, `surfaceClasses`, `buttonClasses` for repeated chains.
3. **Design tokens over arbitrary values** — brand/stone scales; avoid random hex or px unless necessary (e.g. textarea `min-h-[100px]`).
4. **Focus-visible for keyboard** — buttons and form controls use `focus-visible:ring-*`, not `focus:` on mouse click.
5. **Mobile-first** — stack headers/actions (`PageHeader`, `ErrorState` actions); full-width buttons that shrink on `sm+`.
6. **Semantic state colors** — errors red, warnings amber, info sky; brand reserved for primary actions and positive save state.
7. **No feature logic in shared components** — presets live in `states/` wrappers, not in dumb primitives.

---

## Audit findings (pre-cleanup)

| Issue | Severity | Status |
|-------|----------|--------|
| Duplicated form control Tailwind chains across Input/Textarea/Select | Medium | Fixed — `formFieldClasses.ts` |
| Form controls used `focus:` instead of `focus-visible:` | Low | Fixed |
| Form controls lacked `disabled:` styles | Low | Fixed |
| Empty dashed borders used `border-stone-300` while cards use `border-stone-200` | Low | Fixed — `dashedPanelShellClass` |
| Panel shell string repeated in LoadingState, LoadingCard, AppCard | Medium | Fixed — `surfaceClasses.ts` |
| `ErrorFallback` link duplicated secondary button styling | Medium | Fixed — `buttonClasses.ts` |
| Badge padding differs (`ComingSoonBadge` vs `SaveStatusIndicator`) | Low | Documented — intentional (neutral vs status) |
| Feature components repeat `rounded-xl border border-stone-200…` | Medium | Partially fixed — Stories library filters (7.2); other pages deferred |
| No unified `AppBadge` primitive | Low | Fixed in 7.5 — meta pills only; lifecycle badges stay separate |

---

## What was cleaned up (Domain 7.1)

1. Added `src/shared/styles/formFieldClasses.ts` — single source for form labels, hints, errors, control base, borders.
2. Added `src/shared/styles/surfaceClasses.ts` — `panelShellClass`, `dashedPanelShellClass`.
3. Added `src/shared/styles/buttonClasses.ts` — shared layout + secondary variant.
4. Updated `AppInput`, `AppTextarea`, `AppSelect` to use form field classes; added disabled + `focus-visible` styles.
5. Updated `AppButton` to use shared layout + secondary classes.
6. Updated `AppCard`, `LoadingState`, `LoadingCard`, `EmptyState` to use surface classes.
7. Normalized empty-state dashed borders to `border-stone-200`.
8. Updated `ErrorFallback` back link to reuse secondary button classes.

---

## What was intentionally NOT changed

- **Routes, Zustand, storage, Supabase, AI/image pipelines** — out of Domain 7 scope.
- **Teacher workflows** — create/generate/save flows untouched.
- **Full page layouts** — story detail, editor toolbars, filters still use inline panel classes (future 7.2 pass).
- **Toast, connection banners, migration amber loading tint** — semantic colors kept as-is.
- **Text hierarchy across page vs card empty states** — card uses slightly smaller title (`text-base`); intentional density difference.
- **New UI library or component framework** — not introduced.
- **AppBadge extraction** — deferred until a third badge pattern appears or a page pass needs it.

---

## Recommended next Domain 7 step

**Domain 7.2 — High-traffic screen consistency pass**

Pick one teacher-facing surface (recommended: **Stories library** `/dashboard/stories` or **Create story** form):

1. Replace repeated inline `rounded-xl border border-stone-200…` chains with `AppCard` or `panelShellClass`.
2. Audit action bars for consistent button variants (`primary` vs `secondary` vs `ghost`).
3. Verify mobile spacing on filters, cards, and sticky toolbars.
4. Align status badges on story cards with `SaveStatusIndicator` / a future `AppBadge` if needed.

Suggested prompt:

> Domain 7.2 — Stories library visual consistency pass. Use existing primitives and `surfaceClasses`. No workflow or storage changes. Focus on card layout, filters panel, empty states, and action button hierarchy on mobile.

---

## Domain 7.2 — Stories Library visual consistency pass

**Goal:** Polish `/dashboard/stories` without changing behavior — improve scanability, card consistency, mobile readability, and action hierarchy.

### Visual problems fixed

| Problem | Fix |
|---------|-----|
| Story cards used custom border hover instead of shared `AppCard` hover | `hoverable` on `AppCard`; removed one-off border classes |
| Primary card action (`Open story`) styled as secondary | Open action uses `variant="primary"` |
| Three full-width stacked ghost buttons on mobile | Open primary full-width; Duplicate + Delete share a compact `sm` ghost row |
| Filters panel duplicated inline panel classes | `insetPanelShellClass` from `surfaceClasses` |
| Filter summary duplicated inset banner classes | `insetBannerClass` from `surfaceClasses` |
| Filter helper text hidden on mobile | Helper copy visible at all breakpoints |
| No-results empty state lacked recovery action | Added `Clear filters` ghost button when `hasActiveQuery` |
| Section empty-state actions not mobile-friendly | Full-width ghost buttons on mobile in `DashboardLibraryEmptyState` |
| Finished / Story plans sections blended together | Subtle `border-t` divider before Story plans |

### Files changed (Domain 7.2)

- `src/shared/styles/surfaceClasses.ts` — added `insetPanelShellClass`, `insetBannerClass`
- `src/features/stories/components/StoryProjectCard.tsx`
- `src/features/stories/components/story-filters/StoryFiltersPanel.tsx`
- `src/features/stories/components/story-filters/StoryFilterSummary.tsx`
- `src/app/pages/StoriesPage.tsx`
- `src/app/components/DashboardLibraryEmptyState.tsx`
- `docs/domain-7-design-system-polish.md`

### What was intentionally NOT changed (Domain 7.2)

- Filter/search/sort logic and archived toggle behavior
- Delete, duplicate, archive, and navigation handlers
- Storage, Supabase, Zustand, routing
- `StoryStatusBadge` styling and lifecycle semantics
- Sample story section layout and `StoryReadOnlyView`
- Loading skeleton structure (`AppLoadingState kind="story-library"`)
- PageHeader / SectionCard shell structure
- `AppBadge` extraction — still deferred

### Recommended next Domain 7 step

**Domain 7.3 — Create Story form visual consistency pass**

Focus on the teacher setup form (`CreateStoryPage` / `StorySetupForm`):

1. Normalize form section spacing and Advanced options collapse styling.
2. Align primary Generate action hierarchy on mobile.
3. Reuse `formFieldClasses` / `SectionCard` consistently.
4. Polish post-generation preview panel spacing.

Suggested prompt:

> Domain 7.3 — Create Story form visual consistency pass. Use existing primitives and style helpers. No workflow, validation, or generation logic changes. Focus on form spacing, mobile layout, and action button hierarchy.

---

## Domain 7.3 — Create Story form visual consistency pass

**Goal:** Polish `/dashboard/create` without changing workflow — improve form rhythm, section hierarchy, Advanced options affordance, and primary action clarity on mobile.

### Visual problems fixed

| Problem | Fix |
|---------|-----|
| Generate button appeared below Save plan on mobile | Reordered with flex `order` — Generate first on mobile, Save left of Generate on desktop |
| Form action area lacked visual separation | Added `border-t border-stone-100 pt-4` above actions |
| Advanced options toggle looked like a low-priority ghost action | Toggle uses `variant="secondary"`; collapsed card gets subtle `bg-stone-50/50` |
| Advanced collapsed placeholder was plain text | Wrapped in `insetBannerClass` for consistent helper styling |
| Advanced fields lacked separation when expanded | Added `border-t border-stone-100 pt-4` above optional fields |
| Progress stepper floated without grouping | Wrapped in `insetPanelShellClass` with save status (matches library filters) |
| `TeacherHelperNote` duplicated inset banner classes | Default variant now uses `insetBannerClass` |
| Post-generation actions used inline panel classes | `StoryOutputActions` uses `panelShellClass` + shadow |
| Three equal-weight buttons stacked on mobile in preview | Primary save/open full-width; secondary actions share compact `sm` row |
| Generated step Start over not mobile-sized | Added `fullWidth` + `size="sm"` on header action |

### Files changed (Domain 7.3)

- `src/shared/components/SectionCard.tsx` — optional `className` prop
- `src/shared/components/TeacherHelperNote.tsx` — uses `insetBannerClass`
- `src/features/stories/components/StorySetupForm.tsx`
- `src/features/stories/components/StoryCreationProgress.tsx`
- `src/features/stories/components/StoryOutputActions.tsx`
- `src/app/pages/CreateStoryPage.tsx`
- `src/app/pages/create-story/CreateStoryGeneratedStep.tsx`
- `docs/domain-7-design-system-polish.md`

### What was intentionally NOT changed (Domain 7.3)

- Form fields, validation rules, and `validateFastStorySetupForm` behavior
- Generation, save plan, save story, and navigation handlers
- Template picker/creator logic (`TeacherTemplatePanel`)
- Session recovery and draft load warning behavior
- `StoryReadOnlyView`, image prompt review, and generation recovery UI
- Routing, storage, Supabase, Zustand, AI/image pipelines
- Progress step labels and step transition logic

### Recommended next Domain 7 step

**Domain 7.4 — Story detail page visual consistency pass**

Focus on `/dashboard/stories/:id`:

1. Normalize `StoryHeader`, action bars, and mode banners with `panelShellClass` / `AppCard`.
2. Align Quick edit vs Advanced editor button hierarchy on mobile.
3. Polish nav tabs and status badge row spacing.
4. Reuse inset panels for helper banners.

Suggested prompt:

> Domain 7.4 — Story detail page visual consistency pass. Use existing primitives and style helpers. No editing, storage, or routing logic changes. Focus on header, action bar, mode banner, and mobile nav hierarchy.

---

## Domain 7.4 — Story detail page visual consistency pass

**Goal:** Polish `/dashboard/stories/:id` without changing editing, storage, or routing — improve header hierarchy, action clarity, mode visibility, mobile nav, and reading comfort.

### Visual problems fixed

| Problem | Fix |
|---------|-----|
| `StoryHeader` duplicated inline panel classes | Uses `panelShellClass` + shadow |
| `StoryActionsBar` duplicated panel shell; flat mobile hierarchy | `panelShellClass`; management wraps in row; workflow separated with border; Save first on mobile when editing; Quick edit promoted to primary in read mode |
| Read mode banner used one-off AppCard styling | Uses `insetPanelShellClass` (matches library filters / create progress) |
| Quick edit banner kept semantic amber AppCard | Unchanged — edit mode stays visually distinct |
| `StoryDetailNav` mixed button sizes; Read/Roleplay not full-width on mobile | Primary CTA full-width (Read / Preview / Continue plan); secondary row with compact `sm` buttons |
| Story plan nav buried Continue editing in secondary row | Continue editing is primary full-width for setup-only stories |
| Content section label inconsistent with detail field labels | Uppercase tracking label on `StoryGeneratedContentSections` |
| Story page cards used custom borders; teaching focus one-off styling | `AppCard hoverable`; teaching focus uses `insetBannerClass` |
| Quick edit form wrapper duplicated panel classes | Uses `panelShellClass` with amber edit border |
| Page text line-height tight on mobile | Slightly relaxed mobile leading on story page body text |

### Files changed (Domain 7.4)

- `src/features/stories/components/story-detail/StoryHeader.tsx`
- `src/features/stories/components/StoryActionsBar.tsx`
- `src/features/stories/components/story-detail/StoryDetailModeBanner.tsx`
- `src/features/stories/components/story-detail/StoryDetailNav.tsx`
- `src/features/stories/components/story-detail/StoryGeneratedContentSections.tsx`
- `src/features/stories/components/story-detail/StoryPageReadCard.tsx`
- `src/features/stories/pages/StoryDetailPage.tsx`
- `docs/domain-7-design-system-polish.md`

### What was intentionally NOT changed (Domain 7.4)

- Edit, save, duplicate, archive, delete, and classroom assignment handlers
- Story data loading, validation, and optimistic save behavior
- Image generation, prompt review, and export panels
- `StoryMetadata`, flashcards, and classroom sections layout
- Routing, storage, Supabase, Zustand, AI/image pipelines
- PageHeader title/description copy and edit-mode amber semantics

### Recommended next Domain 7 step

**Domain 7.5 — Cross-page responsive sweep + AppBadge extraction (optional)**

After three screen passes, do a light cross-page check:

1. Extract shared meta pill / badge pattern used in `StoryHeader`, `StoryReadOnlyView`, and `StoryStatusBadge`.
2. Verify dashboard layout padding consistency (`px-1 sm:px-0`, `max-w-2xl`) across create, library, and detail.
3. Quick pass on reader/roleplay/export screens for panel class drift.

Suggested prompt:

> Domain 7.5 — Cross-page responsive sweep. Extract AppBadge if a third meta-pill pattern warrants it. Normalize page shell padding across dashboard routes. No workflow or logic changes.

---

## Domain 7.5 — Cross-page responsive + consistency sweep

**Goal:** Remove remaining visual drift between polished dashboard areas without redesigning screens.

### Drift discovered

| Area | Issue |
|------|--------|
| Page shells | Load guards missing `px-1 sm:px-0`; shell string duplicated across 10+ routes |
| Meta pills | Nearly identical chip classes in `StoryHeader`, `StoryReadOnlyView`, `StoryPageReadCard`, reader cover |
| Secondary routes | Reader/roleplay/export empty states used `px-4` instead of dashboard mobile padding |
| Export / roleplay panels | Inline `rounded-xl border…` on print notice and view toggle |
| Badge abstraction | `StoryStatusBadge` (lifecycle) vs meta chips (counts/labels) — different jobs; meta chips justified `AppBadge` |

### Fixes made

| Fix | Detail |
|-----|--------|
| `pageShellClasses.ts` | `dashboardPageShellClass`, `dashboardPageStackClass`, `dashboardNarrowEmptyShellClass` |
| `AppBadge` | Lightweight meta pill with 6 tones — not a replacement for `StoryStatusBadge` or `SaveStatusIndicator` |
| Dashboard routes | Library, create, detail, classrooms use shared page shell classes |
| Load guards | Story + classroom detail load/error states use `dashboardPageShellClass` |
| Meta chips | `StoryHeader`, `StoryReadOnlyView`, `StoryPageReadCard`, `StoryReaderCover` use `AppBadge` |
| Export | Print notice uses `panelShellClass`; shell uses `dashboardPageShellClass` |
| Roleplay | View toggle uses `insetPanelShellClass`; page shell normalized |
| Reader | Cover meta pills use `AppBadge tone="outline"`; empty state shell normalized |

### Files changed (Domain 7.5)

- `src/shared/styles/pageShellClasses.ts` (new)
- `src/shared/components/AppBadge.tsx` (new)
- `src/shared/components/index.ts`
- `src/features/stories/components/story-detail/StoryHeader.tsx`
- `src/features/stories/components/StoryReadOnlyView.tsx`
- `src/features/stories/components/story-detail/StoryPageReadCard.tsx`
- `src/features/stories/components/StorySetupForm.tsx`
- `src/features/stories/components/StoryDetailLoadGuard.tsx`
- `src/features/stories/pages/StoryDetailPage.tsx`
- `src/app/pages/StoriesPage.tsx`
- `src/app/pages/CreateStoryPage.tsx`
- `src/app/pages/create-story/CreateStoryGeneratedStep.tsx`
- `src/features/classrooms/components/ClassroomDetailLoadGuard.tsx`
- `src/features/classrooms/pages/ClassroomsPage.tsx`
- `src/features/classrooms/pages/ClassroomDetailPage.tsx`
- `src/features/story-reader/pages/StoryReaderPage.tsx`
- `src/features/story-reader/components/StoryReaderCover.tsx`
- `src/features/story-roleplay/pages/StoryRoleplayPage.tsx`
- `src/features/story-roleplay/components/RoleplayReaderViewToggle.tsx`
- `src/features/story-export/pages/StoryPrintPage.tsx`
- `docs/domain-7-design-system-polish.md`

### What was intentionally ignored

- **Story editor toolbars** — sticky blurred panels; separate advanced-editor surface (future if needed)
- **`story-projects/` legacy forms** — not on active dashboard happy path
- **Roleplay script line badges** — print-specific styling; low traffic
- **`StoryStatusBadge` merge into AppBadge** — lifecycle semantics stay domain-specific
- **`SaveStatusIndicator` / `ComingSoonBadge`** — distinct interaction/semantic roles
- **Full-width layout routes** — roleplay `max-w-4xl`, print `max-w-3xl` kept intentionally wider
- **Image prompt / editor inset panels** — functional panels; no broad refactor

### Domain 7 completion status

**Recommend closing Domain 7 for V1.**

Completed passes:

- **7.1** — Primitive baseline + style helpers
- **7.2** — Stories library
- **7.3** — Create story form
- **7.4** — Story detail
- **7.5** — Cross-page shell + meta pill sweep

Remaining polish is **opportunistic**, not blocking:

- Advanced editor toolbar panel classes
- Optional `AppBadge` adoption in editor/roleplay internals
- QA/dev checklist page styling

Return to Domain 7 only when a **new high-traffic screen** ships or user feedback identifies a specific visual regression.

Suggested follow-up (non-Domain 7):

> Validate teacher workflow end-to-end (Domain 2) or resume Domain 6 AI/image QA — design system baseline is sufficient for V1.

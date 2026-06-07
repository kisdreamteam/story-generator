# Domain 2 — Teacher Story Creation Experience

Authoritative map for the dashboard create flow (`/dashboard/create`). Does not change generation architecture, persistence, or AI boundaries — see [domain-6-ai-image-ecosystem.md](./domain-6-ai-image-ecosystem.md).

**Product goal:** fast first drafts with reduced setup friction — teachers generate quickly, then review and refine.

---

## Previous flow (before fast draft)

```
Plan form  →  Review plan  →  Generate  →  Auto-save  →  Story detail
   (5          (full summary   (confirm)
    section     screen)
    cards)
```

Teachers filled five section cards (lesson goals, story details, characters, story flow, notes), clicked **Continue to review**, checked a full summary screen, then clicked **Generate story**.

**Friction:** Two confirmation steps before a first draft; many optional fields visible upfront; pre-generation review duplicated the form.

---

## New fast flow (current)

```
Create Story  →  Generate Story  →  Review / Refine  →  Save Story
  (basics +       (loading /          (preview or        (persist +
   Advanced         pipeline)           story detail)      detail)
   collapsed)
```

| Step | What happens | Where |
|------|----------------|-------|
| **Create story** | Required fields only; optional in **Advanced options** (collapsed) | `StorySetupForm` on `/dashboard/create` |
| **Generate story** | Primary **Generate story** button → same `StorySetupInput` → existing pipeline | `useCreateStoryPageState` → `useStoryGenerationFlow` |
| **Review / refine** | Read generated pages; edit on create preview (save retry) or story detail | `CreateStoryGeneratedStep`, `/dashboard/stories/:id` |
| **Save story** | Unchanged persistence | `persistGeneratedStory`, localStorage / Supabase when enabled |

**Save plan for later** (secondary on create form) persists setup without generating.

Progress indicator: **Create story** → **Generate** → **Review & refine**.

---

## Minimum required inputs

Aligned with `validateFastStorySetupForm` and `validateAIStoryInput`:

| Form field | Maps to `StorySetupInput` | Notes |
|------------|---------------------------|-------|
| Lesson goal | `lessonGoal` | One sentence takeaway |
| Theme | `theme` | Main story idea |
| Setting | `setting` | Where it happens |
| Story moments | `mainEvents` | At least one line |
| Age range | `ageRange` | From app settings default |
| Language | `language` | From app settings default |
| Page count | `pageCount` | From app settings default |

Validation runs on **Generate story** only. Empty optional fields are allowed.

---

## Optional inputs (Advanced options)

Collapsed by default — expand **Show options** when needed:

| Form field | Maps to `StorySetupInput` |
|------------|---------------------------|
| Working title | `notes` (working title prefix) |
| Learning objectives | `vocabularyFocus` |
| Vocabulary words | `wordsToInclude` |
| Main characters | `characters` (first line) |
| Additional characters | `characters` (following lines) |
| Additional notes | `notes` |

`storyPurpose` and `storyTone` remain fixed defaults in `mapStorySetupFormToInput` for generation compatibility.

When characters are empty, Nina & Nino continuity applies via Domain 6 prompt rules.

---

## Reasoning

| Decision | Why |
|----------|-----|
| Remove pre-generation review from happy path | Teachers need a draft first; refine belongs after generation |
| Collapse optional fields | Reduces cognitive load and time-to-first-generate |
| Keep `StorySetupInput` unchanged | No pipeline, adapter, or storage changes — reuse existing generation |
| Validate minimum only before generate | Matches AI adapter requirements; save-plan can persist partial setup |
| Empty optional defaults | Encourages fast starts; teacher templates still pre-fill when applied |
| Auto-save + redirect on success | Teacher lands on story detail to refine; preview step for errors/retries |
| Keep `StorySetupReview` in codebase | Legacy wizard + `buildStorySetupReviewSections`; not on dashboard happy path |

---

## Key files

| Concern | Location |
|---------|----------|
| Create form (basics + advanced) | `src/features/stories/components/StorySetupForm.tsx` |
| Form ↔ contract mapping | `src/features/stories/utils/storySetupForm.ts` |
| Required-field validation | `validateFastStorySetupForm` in `storySetupForm.ts` |
| Page orchestration | `src/app/pages/create-story/useCreateStoryPageState.ts` |
| Progress labels | `src/features/stories/components/StoryCreationProgress.tsx` |
| Generation (unchanged) | `src/features/story-generator/hooks/useStoryGenerationFlow.ts` |
| Source of truth (domains) | `.cursor/rules/domain-map.mdc` |

---

## Related docs

- [teacher-workflow-validation.md](./teacher-workflow-validation.md) — scenario validation and friction audit
- [domain-6-ai-image-ecosystem.md](./domain-6-ai-image-ecosystem.md) — generation boundaries

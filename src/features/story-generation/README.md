# Story Generation Feature

See project docs for the full contract and flow:

- [Story generation flow](../../../docs/story-generation-flow.md)
- [Phase 1 summary](../../../docs/phase-1-summary.md)
- [Architecture](../../../docs/architecture.md)

Quick reference: `StoryGenerationInput` → `buildStoryPrompt` → `generateStoryOutput` → `validateStoryOutput` → `StoryGenerationOutput`.

Replace mock generation inside `services/storyGeneration.service.ts` when wiring AI—not the UI.

# Shared AI ecosystem (`src/shared/ai`)

Domain 6 boundary package. See [docs/domain-6-ai-image-ecosystem.md](../../../docs/domain-6-ai-image-ecosystem.md) for the full architecture map.

## Responsibilities

| Area | Path |
|------|------|
| Prompt contracts & builders | `builders/`, `prompts/` |
| Provider-ready story/image prompt strings | `prompts/builders/` |
| Continuity injectors | `prompts/continuity/` |
| Generation jobs & queue | `jobs/` |
| Image batch orchestration | `images/` |
| Recovery & timeouts | `recovery/` |
| Generation metadata | `metadata/` |
| Mock fixtures | `providers/mock/` |

## Adapter interface

Dashboard and legacy adapters import the thin `AIProvider` from `src/shared/lib/ai/`, which delegates mock output to fixtures in this package.

## Rules

- No React imports in this tree.
- No direct OpenAI calls — use `features/story-generation/api/` or server routes.
- Prompt builders are pure functions (no network).

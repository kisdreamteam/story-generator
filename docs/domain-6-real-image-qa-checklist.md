# Domain 6 — Real Image QA Checklist

Manual quality and safety pass for **real single-page illustrations** (`VITE_IMAGE_GENERATION_MODE=ai`) after `/api/image-generation` is deployed.

**Scope:** One page per API request, story detail illustration flow, fallback behavior.  
**Out of scope:** Batch orchestrator, collage, cloud blob storage, story text generation.

Reference scenario: `src/features/story-images/fixtures/realImageQaReferenceScenario.ts`  
Story setup for full flow: `src/features/story-generation/fixtures/realAiQaReferenceSetup.ts`

Architecture: [domain-6-image-generation-plan.md](./domain-6-image-generation-plan.md)

---

## Environment

### Local dev

```env
VITE_GENERATION_MODE=ai          # optional — for real story text
VITE_IMAGE_GENERATION_MODE=ai
OPENAI_API_KEY=sk-...
VITE_IMAGE_PROVIDER=openai
VITE_IMAGE_MODEL=dall-e-3
```

Restart `npm run dev` after changing `.env`.

### Vercel

| Variable | Scope | Required for real images |
|----------|-------|------------------------|
| `VITE_IMAGE_GENERATION_MODE=ai` | Client (redeploy) | Yes |
| `OPENAI_API_KEY` or `IMAGE_GENERATION_API_KEY` | Server only | Yes |
| `VITE_IMAGE_PROVIDER=openai` | Client | Recommended |
| `VITE_IMAGE_MODEL=dall-e-3` | Client | Recommended |

**Never** set image provider secrets with a `VITE_` prefix.

`VITE_GENERATION_MODE` and `VITE_IMAGE_GENERATION_MODE` are **independent**. You can test real images with mock story text (use an existing saved story).

---

## Reference test run

1. Open a generated Nina & Nino story on **story detail** (or create one with `REAL_AI_QA_REFERENCE_SETUP`).
2. Confirm **Illustration prompts** show one prompt per page; edit if needed and save.
3. On **page 1**, use per-page regenerate **or** click **Generate N missing images** (generates only pages without ready images).
4. Wait for the page status to show **Ready**.
5. Click **Save illustrations** if prompted.
6. Work through the criteria below.

For a fixed single-page scenario, compare against `REAL_IMAGE_QA_REFERENCE_PAGE_TEXT` and `REAL_IMAGE_QA_REFERENCE_IMAGE_PROMPT` in the fixture file.

---

## Image quality criteria

Check each item after a successful **real AI** illustration (not mock-only mode).

### Scene and usability

- [ ] **Single-page generation works** — One page completes; network shows one `POST /api/image-generation` per page action
- [ ] **Matches story page** — Illustration depicts the same moment as the page text and saved prompt
- [ ] **Teacher-ready** — Image is usable on the story page without editing the artwork or re-prompting

### Nina & Nino continuity

- [ ] **Nina is older sister** — Nina reads as older (height, role, or mentoring posture)
- [ ] **Nino is younger brother** — Nino reads as younger
- [ ] **Not twins** — Distinct ages; not identical twins
- [ ] **Clothing/colors** — Nina indigo; Nino emerald green (consistent with prompt continuity reminder)
- [ ] **Style** — Warm watercolor / children’s book look; classroom-safe

### Safety and artwork rules

- [ ] **No visible text** — No speech bubbles, captions, text boxes, or readable signs
- [ ] **No logos** — No brand marks or watermarks
- [ ] **Child-safe** — No scary, violent, or inappropriate content

---

## Fallback checks (required)

Run these as **separate** passes from the quality run.

### Missing server key

1. Set `VITE_IMAGE_GENERATION_MODE=ai` on client.
2. Remove `OPENAI_API_KEY` and `IMAGE_GENERATION_API_KEY` from server env (or local `.env`).
3. Regenerate **one** page illustration.

| Expected | |
|----------|--|
| Story detail | Does **not** crash |
| Page result | **Ready** with SVG mock placeholder (not a hard failure) |
| Toast | **Placeholder illustration used** — *Illustration service was unavailable, so a placeholder was used instead.* |
| Save | **Save illustrations** still works |

### Failed API response

1. Restore server key, or temporarily break the route (wrong URL via `VITE_IMAGE_GENERATION_API_URL`).
2. Regenerate one page.

| Expected | |
|----------|--|
| Mock placeholder | Yes — same as missing key |
| Warning toast | Yes |
| Console | `[Story Images] Real image adapter failed; using mock placeholder.` |

### Validation failures (no fallback)

- Empty illustration prompt → page **Failed**, no silent mock replacement
- User cancel during generation → page not left in broken state

---

## Cost safety checks

Verified in code (re-check after changes):

| Control | Implementation | Status |
|---------|----------------|--------|
| One request per page | Server `n: 1`; one `POST` per `generateStoryPageImage` | Confirmed |
| Sequential “Generate missing” | `for` loop with `await` in `generateMissingStoryPageImages` — no `Promise.all` | Confirmed |
| No auto-generation on load | Images generate only on button click (generate missing / per-page regenerate) | Confirmed |
| Skip ready pages | `isStoryPageImageReady` skips pages that already have `imageUrl` | Confirmed |
| No batch orchestrator in UI | Story detail uses adapter service only | Confirmed |

### Current cost risk

When a teacher clicks **Generate N missing images** on a 12-page story with no illustrations:

- **12 sequential paid API calls** (one per missing page)
- Trigger is **explicit** — nothing runs on page load or after story text generation
- Each call uses `dall-e-3` at 1024×1024 (see server handler)

**Estimated exposure:** Up to N × (single image API cost) per button click, where N = missing page count (max = page count).

### Future confirmation step (not built)

A confirmation dialog before multi-page generate is **recommended** when `missingCount > 3` (or for all real-AI mode runs). Env hook reserved in plan: `VITE_IMAGE_GENERATION_CONFIRM_THRESHOLD`. **Do not implement batch generation** until single-page QA passes on Vercel.

---

## Vercel-specific checks

- [ ] `POST /api/image-generation` returns JSON (not SPA HTML)
- [ ] Response includes `imageUrl` (`data:image/png;base64,...` or HTTPS URL)
- [ ] Browser network tab shows **no** direct calls to `api.openai.com`
- [ ] Illustration saves with story (local or cloud storage as configured)
- [ ] Base64 images: story still loads after refresh (watch localStorage size on long stories)

---

## Known risks

| Risk | Mitigation today | Future |
|------|------------------|--------|
| Large base64 in story JSON | Single 1024×1024 PNG per page | Cloud blob storage |
| Model ignores “no text” | Server negative prompt; manual QA | Vision lint |
| Character drift across pages | Per-page prompts + continuity reminder | Reference-image pass |
| 12-click cost on “Generate missing” | Sequential, user-initiated only | Confirm dialog |
| Fallback looks like real AI | Warning toast; mock SVG says “Mock illustration” | Detail badge (Domain 7) |
| Temporary OpenAI URL expiry | Server prefers `b64_json` data URLs | CDN storage |

---

## Filing issues

Include:

- Environment (local / Vercel preview / production)
- `REAL_IMAGE_QA_REFERENCE_SUMMARY` or page number tested
- Whether fallback toast appeared
- Screenshot or description of failure (no need to attach full base64)
- Network: status code from `/api/image-generation`

---

## Deferred work

- Batch `imageGenerationOrchestrator` wiring
- Collage review UI
- Cloud image storage / CDN
- Auto-retry and server rate limits
- Confirmation dialog before multi-page generate
- Automated image QA (vision model)

---

## Related docs

- [domain-6-image-generation-plan.md](./domain-6-image-generation-plan.md)
- [domain-6-real-ai-qa-checklist.md](./domain-6-real-ai-qa-checklist.md) — story text QA
- [domain-6-ai-image-ecosystem.md](./domain-6-ai-image-ecosystem.md)

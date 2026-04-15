---

description: "Task list for MVP3 — Dynamic Routines, Reference Media, Mindfulness UI"
---

# Tasks: MVP3 — Dynamic Routines, Reference Media, Mindfulness UI

**Input**: Design documents from `/specs/003-mvp3-dynamic-media-ui/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Optional; spec does not mandate TDD. Contract coverage updates in `tests/unit/contracts.test.ts` are included where Zod changes.

**Organization**: Phases follow user story priority (P1 → P2 → P3) after shared foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no blocking incomplete deps)
- **[Story]**: [US1], [US2], [US3] for user-story phases only

## Path Conventions

Single Next.js app: `src/`, `tests/` at repository root (see [plan.md](./plan.md)).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment documentation and prerequisites for media APIs.

- [x] T001 Add MVP3 block to `.env.example`: `YOUTUBE_DATA_API_KEY`, optional `MEDIA_*` timeout placeholders, Wikimedia note; **cross-reference FR-002** by commenting that **`ROUTINE_GEN_TEMPERATURE`** / **`OPENAI_MODEL`** (above) are the operator levers for creative latitude—no new admin UI

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extended contracts and shared types **must** land before User Story 2 UI and API enrichment consume new fields.

**Dependency clarification (addresses analyze I2):** **User Story 1 (T005)** only edits `src/lib/gen/orchestrator.ts` and `src/lib/yoga/compose-context.ts` and may run **after T001 alone** for fastest SC-001 checks. **T002–T004** are **blocking for User Story 2** (response shape + enrichment). Recommended linear order: T001 → T005 → T002–T004 → US2, *or* T001 → T002–T004 → T005 → US2 if you prefer contracts first.

- [x] T002 Extend `stepMediaSchema` (optional `imageAttribution`, `videoUrl`, `videoTitle`) and related inferred types in `src/lib/contracts/routine-zod.ts` to match `specs/003-mvp3-dynamic-media-ui/contracts/routine-response.schema.json`
- [x] T003 [P] Update `tests/unit/contracts.test.ts` with sample payloads covering extended `StepMedia` fields
- [x] T004 [P] Add `src/lib/media/types.ts` for enrichment result shapes, HTTPS allowlist helpers, and shared constants (no client import)

**Checkpoint**: Zod + tests green; media helpers compile.

---

## Phase 3: User Story 1 — Varied, non-repetitive routines (Priority: P1) 🎯 MVP

**Goal**: Meaningful variation across similar non-severe intakes via env-tunable creative latitude, prompt instructions, and server-side nonce (see [research.md](./research.md) R1–R2).

**Independent Test**: `POST /api/routine` twice with identical mild intake; compare cue text or step emphasis (SC-001). Adjust `ROUTINE_GEN_TEMPERATURE` in `.env.local` and observe perceptible shift without unsafe content.

### Implementation for User Story 1

- [x] T005 [US1] Inject diversity: generate per-request nonce in `src/lib/gen/orchestrator.ts` and pass into `src/lib/yoga/compose-context.ts` prompts with explicit anti-repetition instructions; keep severe/restricted paths unchanged

**Checkpoint**: Back-to-back runs show distinguishable differences when keys/mock allow generation.

---

## Phase 4: User Story 2 — Pose images and YouTube references (Priority: P2)

**Goal**: Server-side Wikimedia + YouTube Data API enrichment after generation; graceful fallbacks; results validated before client (FR-003–FR-006, FR-009).

**Independent Test**: With API keys set, `POST` returns steps with image URLs and optional `videoUrl`; with keys unset, labeled fallbacks—not broken images.

### Implementation for User Story 2

- [x] T006 [P] [US2] Implement Wikimedia Commons lookup in `src/lib/media/wikimedia.ts` (server-only; timeouts; returns image URL + attribution text)
- [x] T007 [P] [US2] Implement YouTube Data API v3 search helper in `src/lib/media/youtube-search.ts` (server-only; returns watch URL + title or empty)
- [x] T008 [US2] Implement `src/lib/media/enrich-steps.ts` to enrich `GeneratedRoutinePayload` steps with bounded parallelism, per-step timeouts, fallbacks, and **at most one retry** on transient upstream errors (e.g. 429/5xx); avoid unbounded loops (addresses edge cases: rate limits / slow networks)
- [x] T009 [US2] Integrate enrichment after `generateRoutineStructured` in `src/app/api/routine/route.ts`; update `next.config.ts` `images.remotePatterns` for allowed HTTPS image hosts (e.g. upload.wikimedia.org)
- [x] T010 [US2] Enable and complete media UI in `src/components/routine/SafeRoutineView.tsx`: turn on pose media section; show attribution; external video link (`target="_blank"`, `rel="noopener noreferrer"`); **short wellness copy near media** (not medical advice — FR-006); explicit fallbacks for missing/wrong media; **loading/decoding** states without focus traps or large layout shift; optional **Retry** control for failed images when feasible

**Checkpoint**: Safe routine responses show enriched media or intentional fallbacks; SC-002/SC-003 testable in staging.

---

## Phase 5: User Story 3 — Mindfulness-themed colorful UI (Priority: P3)

**Goal**: Cohesive calm palette, yoga-aligned imagery/backdrops, content on readable panels (FR-007, FR-008; [research.md](./research.md) R6).

**Independent Test**: Visual walkthrough of intake → session → results; verify contrast and focus with keyboard and zoom.

### Implementation for User Story 3

- [x] T011 [P] [US3] Apply global mindfulness backdrop, gradients, and CSS variables in `src/app/globals.css` and shell structure in `src/app/layout.tsx`
- [x] T012 [P] [US3] Update `src/components/intake/IntakeFlow.tsx` to use themed panels/backgrounds consistent with layout tokens
- [x] T013 [US3] Update `src/components/yoga/YogaSession.tsx` and `src/components/routine/RoutineResult.tsx` for cohesive mindfulness styling and decorative imagery that does not obscure controls; respect **`prefers-reduced-motion`** for large decorative motion; if timeboxed, add **dark-friendly** panel tokens or note follow-up for `prefers-color-scheme: dark` (spec edge case)

**Checkpoint**: Primary flows match mindfulness theme; no new critical a11y violations (SC-005).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Diagnostics, logging hygiene, docs, quality gates.

- [x] T014 [P] Extend `GET` handler in `src/app/api/routine/route.ts` with non-secret diagnostics (e.g. whether enrichment backends are configured) alongside existing backend/temperature fields
- [x] T015 Verify constitution P4 for new code paths: ensure `src/app/api/routine/route.ts` and `src/lib/media/*.ts` never log raw intake JSON; log only redacted metadata where needed
- [x] T016 [P] Align `specs/003-mvp3-dynamic-media-ui/quickstart.md` with final `.env.example` variable names and smoke-test notes
- [x] T017 Run `npm run lint` and `npm test`; fix any regressions
- [x] T018 [P] **WCAG 2.1 AA spot-check (SC-005):** keyboard Tab through intake → session → results; visible focus; zoom 200%; verify contrast on primary text/buttons against new backdrops; fix blocking issues (complements eslint jsx-a11y from T017)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **US1** may follow **T001** only, or **Phase 2** first if you prefer contracts up front; **US2** requires **Phase 2** complete
- **US2 (Phase 4)** depends on **Phase 2** (Zod + `types.ts`) and benefits from **US1** complete but is testable once T008–T010 are implemented
- **US3 (Phase 5)** can proceed after **Phase 2**; visually best after **US2** media UI (T010) but should not break if done in parallel with careful styling
- **Phase 6** after desired user stories (include **T018** before release sign-off for SC-005)

### User Story Dependencies

| Story | Depends on |
|-------|------------|
| US1 | T001; T002–T004 optional before US1 (required before US2) |
| US2 | Foundational; T006–T007 before T008; T008 before T009–T010 |
| US3 | Foundational; independent of APIs but coordinate with `SafeRoutineView` layout |

### Parallel Opportunities

- **T003** ∥ **T004** (after T002)
- **T006** ∥ **T007** (both [US2], different files)
- **T011** ∥ **T012** ([US3], different components)
- **T014** ∥ **T016** (Polish); **T018** after themed UI (T011–T013) is stable

---

## Parallel Example: User Story 2

```text
# After T002 and T004 complete, launch in parallel:
T006 Implement Wikimedia client in src/lib/media/wikimedia.ts
T007 Implement YouTube helper in src/lib/media/youtube-search.ts

# Then sequentially:
T008 enrich-steps.ts → T009 route.ts + next.config.ts → T010 SafeRoutineView.tsx
```

---

## Parallel Example: User Story 3

```text
T011 globals.css + layout.tsx
T012 IntakeFlow.tsx
# Then T013 ties YogaSession + RoutineResult together
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete T001; then **either** T005 immediately **or** T002–T004 then T005
2. **STOP**: Validate SC-001 style variance with repeated `POST /api/routine` (add T002–T004 before any US2 work)

### Incremental Delivery

1. Setup + Foundational → T001–T004
2. US1 (T005) → validate variation
3. US2 (T006–T010) → validate media + fallbacks
4. US3 (T011–T013) → validate theme + a11y
5. Polish (T014–T018)

### Suggested MVP Scope

**Minimum SC-001 path:** T001 + T005 (no media APIs). **Before US2:** complete T002–T004.

---

## Task Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 18 |
| **Phase 1** | 1 |
| **Phase 2** | 3 |
| **US1** | 1 |
| **US2** | 5 |
| **US3** | 3 |
| **Polish** | 5 |

| User Story | Task IDs |
|------------|----------|
| US1 | T005 |
| US2 | T006–T010 |
| US3 | T011–T013 |

---

## Notes

- All tasks use checklist format `- [ ] Tnnn ...` with file paths in descriptions.
- `[P]` tasks use separate files; confirm no overlapping edits in the same file in one parallel batch.
- Server-only: mark new modules with `import "server-only"` where applicable to satisfy constitution P3.

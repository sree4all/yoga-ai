# Tasks: MVP2 Refined Recommendations Experience

**Input**: Design documents from `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\specs\002-mvp2-ui-llm-refinement\`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: Not requested in the feature specification; no mandatory test tasks. Validate with `npm run lint` and `npm test` in Polish phase.

**Organization**: Phases follow user story priority (P1 → P3) after shared foundation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: User story label [US1]…[US5] for story phases only

## Path Conventions

Single Next.js app: `src/` at repository root (`C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align implementation scope with MVP2 design artifacts before code changes.

- [x] T001 Review [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), and JSON Schemas in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\specs\002-mvp2-ui-llm-refinement\contracts\` against existing `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\` code paths

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contracts, types, knowledge mapping, orchestration parsing, and API handler must be updated before any user-story UI can ship end-to-end.

**⚠️ CRITICAL**: No user story phase should merge until this phase completes.

- [x] T002 Update domain types for array intake and profiles in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\lib\types\intake.ts` per [data-model.md](./data-model.md) (`discomfortTypes`, `bodyRegions`, `DiscomfortProfile` / `IntakeSession` as needed)
- [x] T003 Extend Zod request/response schemas for MVP2 (`discomfortTypes`, `bodyRegions`, `yogaStyle`, per-step `media`) in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\lib\contracts\routine-zod.ts`, aligned with `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\specs\002-mvp2-ui-llm-refinement\contracts\routine-request.schema.json` and `routine-response.schema.json`
- [x] T004 Refactor `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\lib\intake\state.ts` (`IntakeFormState`, `buildRoutineRequestBody`, exported option lists) to build validated array payloads for the new schema
- [x] T005 Implement deterministic multi-select → `knowledgeKey` mapping and `DiscomfortProfile` construction in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\lib\knowledge\select.ts` per [research.md](./research.md)
- [x] T006 Extend `GeneratedRoutinePayload`, `parseRoutinePayload`, and `mockRoutineFromKnowledge` for `yogaStyle` and per-step `media` in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\lib\gen\orchestrator.ts`
- [x] T007 Update `POST` handler validation, safety/restricted branch (including `restrictedBreathingForRegion` inputs derived from `bodyRegions`), profile wiring, and successful response assembly in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\app\api\routine\route.ts` to use MVP2 request/response types end-to-end

**Checkpoint**: API accepts MVP2 bodies and returns expanded `safe_routine` when generation succeeds; mock path produces `yogaStyle` + `media`.

---

## Phase 3: User Story 1 — Multi-symptom selection and combined context (Priority: P1) 🎯 MVP

**Goal**: Users select **multiple** discomfort types and **multiple** body regions; selections display as a combined set and are sent together to the API.

**Independent Test**: From [spec.md](./spec.md) User Story 1 — select multiple symptoms and regions, submit, confirm request payload contains full sets and UI shows all selections.

### Implementation for User Story 1

- [x] T008 [US1] Replace single-select radios with accessible multi-select (checkboxes + visible selected summary) for discomfort and body-region steps in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\intake\IntakeFlow.tsx`
- [x] T009 [US1] Verify phase transitions, `lastBody` retry shape, and error handling work with array payloads in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\yoga\YogaSession.tsx`

**Checkpoint**: End-to-end flow from disclaimer through intake produces MVP2 POST body with multiple values; session retry still works for `generation_fallback`.

---

## Phase 4: User Story 2 — Non-repetitive, context-specific guidance (Priority: P1)

**Goal**: Model instructions emphasize **full** symptom and body-area sets and require substantively different guidance across different combinations (**FR-003**, **FR-004**).

**Independent Test**: From [spec.md](./spec.md) User Story 2 — two distinct combinations yield non-duplicate substantive content in structured review.

### Implementation for User Story 2

- [x] T010 [US2] Rewrite system and user prompt strings in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\lib\yoga\compose-context.ts` to pass full lists, forbid generic duplicate copy across combinations, and align JSON output rules with `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\lib\gen\orchestrator.ts` expectations

**Checkpoint**: Prompts reference every selected symptom and body region explicitly.

---

## Phase 5: User Story 3 — Yoga style guidance matched to needs (Priority: P2)

**Goal**: Response includes a **yoga style** category and rationale tailored to user signals (**FR-005**).

**Independent Test**: From [spec.md](./spec.md) User Story 3 — stiffness- vs fatigue-oriented inputs yield style + rationale that match intent in manual review.

### Implementation for User Story 3

- [x] T011 [US3] Extend JSON shape instructions and validation expectations in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\lib\yoga\compose-context.ts` (and confirm `parseRoutinePayload` in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\lib\gen\orchestrator.ts` rejects missing `yogaStyle`) so `yogaStyle.category` and `yogaStyle.rationale` are always present for `safe_routine`

**Checkpoint**: `safe_routine` responses always include yoga style block suitable for UI.

---

## Phase 6: User Story 4 — Richer results layout and media placeholders (Priority: P2)

**Goal**: Results show **yoga style**, per-pose **image** (URI), and **video** label/slot per **FR-006**.

**Independent Test**: From [spec.md](./spec.md) User Story 4 — each pose row shows style section (once), image area, and video reference placeholder.

### Implementation for User Story 4

- [x] T012 [US4] Render `yogaStyle`, per-step `media.imageUrl`, and `media.videoLabel` with accessible markup in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\routine\SafeRoutineView.tsx`
- [x] T013 [P] [US4] Tune layout wrapper spacing/hierarchy for results chrome in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\routine\RoutineResult.tsx` if needed for FR-006 clarity

**Checkpoint**: Visual structure matches enriched results spec; placeholders do not look like broken layout.

---

## Phase 7: User Story 5 — Calm aesthetic and navigation (Priority: P3)

**Goal**: Clear **edit / back to intake** path and **calm** visual treatment for selection and results (**FR-007**, **FR-008**).

**Independent Test**: From [spec.md](./spec.md) User Story 5 — user reaches intake from results without full “start over” if an edit path is offered; UI feels calm (spot-check vs SC-005).

### Implementation for User Story 5

- [x] T014 [US5] Add explicit navigation from results to intake (edit selections) while preserving in-session state where applicable in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\yoga\YogaSession.tsx` and `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\routine\RoutineResult.tsx`
- [x] T015 [P] [US5] Apply WCAG-minded calm styling pass (spacing, typography, color contrast) on `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\intake\IntakeFlow.tsx` and `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\routine\SafeRoutineView.tsx` per FR-007

**Checkpoint**: Users can adjust inputs from results; selection and results screens meet basic AA-oriented checklist items from plan.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Performance target, loading UX, regression checks.

- [x] T016 Set default generation timeout to 30 seconds (or document env override) in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\app\api\routine\route.ts` per FR-010
- [x] T017 Add or refine visible loading / in-progress messaging for slow generation in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\yoga\YogaSession.tsx` and `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\intake\IntakeFlow.tsx` per Edge Cases (runs longer than 30s)
- [x] T018 [P] Manual verification using curl/Invoke-RestMethod examples in `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\specs\002-mvp2-ui-llm-refinement\quickstart.md`
- [x] T019 Run `npm run lint` and `npm test` from `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\`
- [x] T020 Audit server-side logging and error paths: ensure **no** production logging of full `POST /api/routine` JSON bodies containing raw intake; redact or omit per `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\.specify\memory\constitution.md` P4 and **FR-009** / **SC-006** (focus `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\app\api\routine\route.ts`, `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\lib\gen\orchestrator.ts`, and any shared log helpers)
- [x] T021 Verify **WCAG 2.1 Level AA** for the selection + results flows using the project process (e.g. axe DevTools, Lighthouse accessibility, or a documented manual checklist); resolve **critical** issues before release per **SC-007** (pages using `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\intake\IntakeFlow.tsx`, `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\routine\SafeRoutineView.tsx`, `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\yoga\YogaSession.tsx`)
- [x] T022 [P] Product/copy pass: confirm **English-only** user-visible strings on the MVP2 path and no stray non-English required copy per **FR-011** / **SC-009** (scan `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\src\components\` and server messages for this feature)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No prerequisites
- **Phase 2 (Foundational)**: Depends on Phase 1 — **blocks all user stories**
- **Phases 3–7 (US1–US5)**: Depend on Phase 2; recommended sequential order **US1 → US2 → US3 → US4 → US5** because later stories touch the same files (`compose-context.ts`, UI). US4–US5 can partially overlap only after T010–T011 land if coordinated
- **Phase 8 (Polish)**: Depends on desired user stories being complete (minimum: through US1 for latency polish; full polish after US5)

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| US1 | Phase 2 | No other stories |
| US2 | Phase 2, US1 recommended | Prompts need MVP2 `RoutineRequest` shape in callers |
| US3 | US2 | Same file `compose-context.ts`; extend prompts after US2 baseline |
| US4 | Phase 2, US3 recommended | UI needs `yogaStyle` + `media` in responses |
| US5 | US4 recommended | Navigation/editing builds on stable results view |

### Within Each User Story

- US1: Intake state (`T004`) and API (`T007`) must exist before `IntakeFlow.tsx` edits stabilize
- US2 → US3: Apply sequential edits to `compose-context.ts` to reduce merge conflicts

### Parallel Opportunities

- **T013** [P] [US4] and **T012** [US4] — different files after `SafeRoutineView` API is stable
- **T015** [P] [US5] and **T014** [US5] — different files (coordinate on shared class names if any)
- **T018** [P] — manual verification can run alongside **T019**–**T022** when staffed; **T020**–**T021** are independent dimensions (logging vs a11y vs copy)

---

## Parallel Example: User Story 4

After `safe_routine` includes `yogaStyle` and `media`:

```bash
# Developer A: SafeRoutineView layout
Task T012 — src/components/routine/SafeRoutineView.tsx

# Developer B: RoutineResult wrapper
Task T013 — src/components/routine/RoutineResult.tsx
```

---

## Parallel Example: User Story 1

```bash
# After Phase 2 complete:
# Developer A: Intake multi-select UI
Task T008 — src/components/intake/IntakeFlow.tsx

# Developer B: YogaSession wiring (coordinate on payload shape)
Task T009 — src/components/yoga/YogaSession.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 + Foundation)

1. Complete **Phase 1** and **Phase 2** (T001–T007)
2. Complete **Phase 3** (T008–T009)
3. **STOP and VALIDATE**: Multi-select intake + API round-trip with mock or real backend
4. Demo before layering prompt richness (US2+)

### Incremental Delivery

1. Foundation → US1 → working vertical slice  
2. US2 + US3 → differentiated copy + yoga style  
3. US4 → rich results  
4. US5 → navigation + visual polish  
5. Polish phase → timeouts and regression commands

### Suggested MVP Scope

**Minimum shippable increment**: **Phase 2 + User Story 1** (T001–T009) — multi-select arrays persisted through session and API. Prompt and UI richness follow in subsequent phases.

---

## Notes

- Ephemeral policy (**FR-009**): do not add server-side persistence of raw intake; avoid logging full request bodies in production monitors
- English-only (**FR-011**): product copy pass in **T022** (**SC-009**); no i18n tasks
- Total tasks: **22** (T001–T022); **T020**–**T022** remediate constitution / privacy (**P4**), **SC-007** accessibility verification, and **SC-009** English copy
- Task counts by story: **US1** — 2 (T008–T009), **US2** — 1 (T010), **US3** — 1 (T011), **US4** — 2 (T012–T013), **US5** — 2 (T014–T015); remainder are Setup, Foundational, or Polish

---

## Format Validation

All tasks use the checklist form `- [x] Tnnn ...` with explicit **Windows absolute paths** under `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\` for implementation work; story phases include **[USn]** labels.

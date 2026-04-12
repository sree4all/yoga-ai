---

description: "Task list for Yoga.ai MVP (001-yoga-ai-mvp)"
---

# Tasks: Yoga.ai MVP — Guided Yoga Routine Intake

**Input**: Design documents from `C:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai\specs\001-yoga-ai-mvp\`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Optional targeted unit tests (Vitest) per [research.md](./research.md); not mandated by spec—included in Polish and US2 for safety-critical paths.

**Organization**: Phases follow user stories P1 → P2 → P3 from [spec.md](./spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no blocking deps)
- **[Story]**: [US1] / [US2] / [US3] for user-story phases only

## Path Conventions

Single Next.js app at repository root: `src/app/`, `src/components/`, `src/lib/`, `tests/` per [plan.md](./plan.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Next.js + Tailwind + tooling per implementation plan.

- [x] T001 Create Next.js App Router project with TypeScript and Tailwind CSS at repository root (`package.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`)
- [x] T002 [P] Add dependencies `zod` and devDependencies `vitest`, `@vitest/coverage-v8` in `package.json` with `npm run test` script
- [x] T003 [P] Configure ESLint flat config with `eslint-plugin-jsx-a11y` for accessibility in `eslint.config.mjs`
- [x] T004 [P] Add `.env.example` documenting `ROUTINE_GEN_TIMEOUT_MS` and GenOrchestrator-related placeholders (`GEN_ORCHESTRATOR_*`) per `specs/001-yoga-ai-mvp/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, contracts, deterministic safety, static knowledge, orchestrator adapter surface, and API route skeleton—**required before any user story UI can ship**.

**⚠️ CRITICAL**: No user story phase work until this phase completes.

- [x] T005 Add domain enums and types (`Intensity`, `DiscomfortType`, `BodyRegion`, `IntakeSession`, `SafetyEvaluation`, `DiscomfortProfile`) in `src/lib/types/intake.ts` per `specs/001-yoga-ai-mvp/data-model.md`
- [x] T006 [P] Implement Zod schemas matching JSON contracts in `src/lib/contracts/routine-zod.ts` (request + discriminated response kinds) using field rules from `specs/001-yoga-ai-mvp/contracts/routine-request.schema.json` and `routine-response.schema.json`
- [x] T007 [P] Add curated high-risk substring list and matcher utilities in `src/lib/safety/risk-terms.ts`
- [x] T008 Implement deterministic `evaluateSafety` in `src/lib/safety/evaluate.ts` using structured fields and optional note text per FR-003
- [x] T009 [P] Add static YTT200-level knowledge entries (sequences, `posesToAvoid`, `breathingFallback`) in `src/lib/knowledge/entries.ts` (or `src/lib/knowledge/entries/*.ts`) covering at least stress and neck-tension profiles per FR-004
- [x] T010 Implement `selectKnowledgeEntry` / profile normalization in `src/lib/knowledge/select.ts`
- [x] T011 Implement yoga context builder in `src/lib/yoga/compose-context.ts` combining validated intake + selected `KnowledgeEntry` for orchestrator prompts per FR-005
- [x] T012 [P] Create server-only GenOrchestrator adapter stub in `src/lib/gen/orchestrator.ts` exporting `generateRoutineStructured(...)` returning mock JSON valid under `routine-response.schema.json` until real SDK is wired
- [x] T013 Implement `POST` handler in `src/app/api/routine/route.ts`: validate body with Zod, run `evaluateSafety`, return `restricted` kind with static breathing/rest from knowledge when path is restricted; on `safe`, call adapter stub and return `safe_routine` or `generation_fallback` skeleton

**Checkpoint**: API returns contract-shaped JSON for restricted and stubbed safe paths; no UI required yet.

---

## Phase 3: User Story 1 — Complete intake and receive a personalized routine (Priority: P1) 🎯 MVP

**Goal**: Disclaimer gate, structured intake + optional note, safe-path routine display, orchestration integration, FR-010 fallback UX.

**Independent Test**: Run mild safe profile end-to-end: acknowledge disclaimer → complete intake → receive ~10-minute structured routine; simulate orchestrator failure and confirm fallback message + static breathing + retry.

### Implementation for User Story 1

- [x] T014 [US1] Build `src/components/disclaimer/DisclaimerGate.tsx` with prominent medical disclaimer copy and explicit acknowledgment control before showing intake (FR-001, FR-012)
- [x] T015 [US1] Build structured intake UI components and session state in `src/components/intake/IntakeFlow.tsx` and `src/lib/intake/state.ts` (discomfort type, body region, intensity, optional note per FR-002)
- [x] T016 [US1] Wire home flow in `src/app/page.tsx`: render `DisclaimerGate` → `IntakeFlow` → `fetch('/api/routine', { method: 'POST', ... })` with JSON body matching `routine-request.schema.json`
- [x] T017 [US1] Replace adapter stub with real GenOrchestrator integration in `src/lib/gen/orchestrator.ts` using environment-based configuration and structured JSON output expected by `routine-zod` parsers
- [x] T018 [US1] Extend `src/app/api/routine/route.ts` to call real orchestrator on safe path with server-side timeout; on timeout/error/invalid JSON, return `generation_fallback` per FR-010 using `KnowledgeEntry.breathingFallback`
- [x] T019 [US1] Add `src/components/routine/SafeRoutineView.tsx` and `src/components/routine/GenerationFallbackView.tsx` to render `safe_routine` and `generation_fallback` response kinds with retry affordance

**Checkpoint**: User Story 1 acceptance scenarios 1–4 from [spec.md](./spec.md) are manually demonstrable.

---

## Phase 4: User Story 2 — Safety escalation: severe discomfort or high-risk signals (Priority: P2)

**Goal**: Restricted path only shows breathing/rest; optional note triggers deterministic high-risk path; no conflicting asana recommendations.

**Independent Test**: Severe intensity and optional note containing a curated term yield `restricted` response and UI; no full pose routine.

### Implementation for User Story 2

- [x] T020 [US2] Add `src/components/routine/RestrictedRoutineView.tsx` and wire response kind `restricted` from `POST /api/routine` to show breathing/rest steps and care guidance copy only (FR-003, User Story 2)
- [x] T021 [US2] Add `tests/unit/safety.test.ts` covering severe intensity, high-risk optional note, and safe control cases for `src/lib/safety/evaluate.ts`

**Checkpoint**: User Story 2 acceptance scenarios pass via API + UI; safety logic regression-covered by unit tests.

---

## Phase 5: User Story 3 — Trust, clarity, and knowledge fidelity (Priority: P3)

**Goal**: Output checks against knowledge module; budget guardrails documented; traceability for SC-002/SC-003/SC-004.

**Independent Test**: Auditor can compare safe-path output to `posesToAvoid`; `docs/BUDGET.md` reflects <$20 assumptions.

### Implementation for User Story 3

- [x] T022 [US3] Add `src/lib/knowledge/validate-routine.ts` to verify structured steps do not include avoided pose ids/names for the selected profile (supports SC-002 manual/automated checks)
- [x] T023 [US3] Add `docs/BUDGET.md` describing hosting + API token guardrails and monthly review process per FR-009 and [research.md](./research.md)
- [x] T024 [US3] Add `docs/QA-SC-MATRIX.md` mapping spec success criteria SC-001–SC-008 to manual verification steps

**Checkpoint**: Knowledge fidelity and operational assumptions documented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, docs, build verification, optional contract unit tests.

- [x] T025 [P] Add `tests/unit/contracts.test.ts` for sample valid/invalid payloads against `src/lib/contracts/routine-zod.ts`
- [x] T026 [P] Update root `README.md` with project purpose, scripts (`dev`, `build`, `test`, `lint`), and link to `specs/001-yoga-ai-mvp/quickstart.md`
- [x] T027 Resolve WCAG 2.1 AA gaps on disclaimer, intake, and routine views: focus order, contrast, labels in `src/components/disclaimer/`, `src/components/intake/`, `src/components/routine/` per FR-012
- [x] T028 Run `npm run build` and fix compilation issues; align `specs/001-yoga-ai-mvp/quickstart.md` with actual env var names if they differ

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 — **blocks** Phases 3–5.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2; integrates with Phase 3 UI components (`RestrictedRoutineView` can be built after US1 routing exists—execute after or in parallel with final US1 tasks once `kind` is wired).
- **Phase 5 (US3)**: Depends on Phase 2 knowledge modules; best after US1/US2 for realistic validation helpers.
- **Phase 6 (Polish)**: Depends on Phases 3–5 for meaningful a11y and build checks.

### User Story Dependencies

```text
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6
```

**Note**: US2 can start as soon as `POST /api/routine` returns `restricted` (Phase 2 T013) for API-only testing; full UI requires US1 components for end-to-end flow.

### Parallel Opportunities

| Phase | Parallel tasks |
|-------|----------------|
| 1 | T002, T003, T004 |
| 2 | T006, T007, T009, T012 |
| 6 | T025, T026 |

---

## Parallel Example: Foundational (Phase 2)

```bash
# After T005 completes, launch in parallel:
Task: "T006 Zod schemas in src/lib/contracts/routine-zod.ts"
Task: "T007 risk terms in src/lib/safety/risk-terms.ts"
Task: "T009 knowledge entries in src/lib/knowledge/entries.ts"
Task: "T012 orchestrator stub in src/lib/gen/orchestrator.ts"
```

---

## Parallel Example: User Story 1

```bash
# After intake state exists, parallel UI work (different files):
Task: "T014 DisclaimerGate in src/components/disclaimer/DisclaimerGate.tsx"
# T015 depends on layout—sequence IntakeFlow after disclaimer integration order is clear
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup  
2. Complete Phase 2: Foundational (**blocking**)  
3. Complete Phase 3: User Story 1  
4. **STOP and VALIDATE** against User Story 1 acceptance scenarios in [spec.md](./spec.md)

### Incremental Delivery

1. Setup + Foundational → API smoke (restricted + stub safe)  
2. Add US1 → demo MVP  
3. Add US2 → safety-hardened UX + unit tests  
4. Add US3 → audit helpers + ops docs  
5. Polish → a11y + build + README

### Parallel Team Strategy

After Phase 2: one developer on US1 UI (`src/components/`, `src/app/page.tsx`), another on orchestrator hardening (`src/lib/gen/orchestrator.ts`, `src/app/api/routine/route.ts`), then converge on US2/US3.

---

## Notes

- GenOrchestrator package name and env vars: finalize during T017; keep adapter boundary in `src/lib/gen/orchestrator.ts` only.  
- Do not persist user data (FR-007); session state stays client-side only.  
- Commit after each task or logical group; stop at checkpoints to validate independently.

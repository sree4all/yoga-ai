# Tasks: MVP4 — Curated Routine Library & Training-Derived Pose Media

**Input**: Design documents from `/specs/004-mvp4-routine-data-corpus/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Not explicitly requested as TDD in spec; include pragmatic verification tasks needed to satisfy SC-001..SC-010.

**Organization**: Tasks are grouped by user story for independent delivery and validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create corpus workspace and command wiring used by all stories.

- [X] T001 Create corpus directory scaffold in `docs/routine-corpus/README.md`, `docs/routine-corpus/.gitkeep`, and `public/routine-corpus/assets/.gitkeep`
- [X] T002 Add corpus npm script placeholders (`validate:corpus`, optional `sync:pose-assets`) to `package.json`
- [X] T003 [P] Add corpus constants/paths module in `src/lib/corpus/paths.ts`
- [X] T004 [P] Add corpus authoring policy docs in `docs/routine-corpus/README.md` (bundle versioning, joint release rule, English/secular policy)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared runtime + validation primitives that block all user stories.

**CRITICAL**: Complete this phase before starting US1/US2/US3.

- [X] T005 Implement Zod schemas for corpus bundle entities in `src/lib/corpus/corpus-zod.ts`
- [X] T006 Implement corpus loader/parser for canonical `docs/routine-corpus/bundle.json` with shared `bundleVersion` guard in `src/lib/corpus/bundle.ts`
- [X] T007 Implement intake-to-catalog resolver contract in `src/lib/corpus/resolve-intake.ts`
- [X] T008 Implement corpus validation CLI (durations, no video URLs, secular/English guards, pose coverage) in `scripts/validate-corpus.mts`
- [X] T009 [P] Add unit tests for schema parse and bundle load in `tests/unit/corpus.test.ts`
- [X] T010 [P] Add unit tests for duration and policy validators in `tests/unit/corpus-validation.test.ts`
- [X] T011 Wire corpus build/merge and `validate:corpus` script execution in `package.json` and `scripts/build-corpus-bundle.mts`, and document commands in `specs/004-mvp4-routine-data-corpus/quickstart.md`

**Checkpoint**: Foundational corpus runtime and validator are ready; user story work can proceed.

---

## Phase 3: User Story 1 — Trustworthy 10-minute constrained routines (Priority: P1) 🎯 MVP

**Goal**: Serve constrained LLM-composed routines from approved pools with correct duration and intake mapping behavior.

**Independent Test**: For representative intake profiles, generated routines use only approved pose IDs (or documented substitutions), map through catalog tags correctly, and remain within ~10-minute budget.

- [X] T012 [US1] Create canonical `docs/routine-corpus/bundle.json` plus optional source authoring files (`routines.json`, `intake-mapping.json`, `pose-asset-index.json`) that merge into `bundle.json`
- [X] T013 [P] [US1] Author at least 12 routines spanning at least 6 catalog tags in `docs/routine-corpus/routines.json`
- [X] T014 [P] [US1] Author intake-to-catalog mapping rules with precedence notes in `docs/routine-corpus/intake-mapping.json` and `docs/routine-corpus/README.md`
- [X] T015 [US1] Implement constrained prompt input builder (allowed pose IDs/tags) in `src/lib/corpus/bundle.ts`
- [X] T016 [US1] Extend orchestrator to enforce allowed pose IDs and substitutions in `src/lib/gen/orchestrator.ts`
- [X] T017 [US1] Integrate corpus resolver + constrained generation path in `src/app/api/routine/route.ts`
- [X] T018 [US1] Add runtime guard for out-of-pool pose rewrite/reject before response validation in `src/app/api/routine/route.ts`
- [X] T019 [US1] Add unit/integration coverage for mapping + constrained pose enforcement in `tests/unit/corpus-routing.test.ts`

**Checkpoint**: US1 is independently functional and demonstrates constrained, duration-bounded routine generation.

---

## Phase 4: User Story 2 — Pose illustrations from training assets (Priority: P2)

**Goal**: Deliver static image references from training-derived assets with reliable fallback behavior and no video requirement in corpus.

**Independent Test**: Routine steps with mapped poses resolve to valid still image paths; missing mappings use documented fallback; corpus contains no video URLs.

- [X] T020 [US2] Build pose asset index entries for all US1 pose IDs in `docs/routine-corpus/pose-asset-index.json`
- [X] T021 [P] [US2] Add asset sync script to copy/slug selected SVGs from `docs/.trainingData/` into `public/routine-corpus/assets/` in `scripts/sync-pose-assets.mts`
- [X] T022 [US2] Add still-image resolver utility for pose IDs in `src/lib/corpus/bundle.ts`
- [X] T023 [US2] Integrate corpus still images as baseline media in `src/app/api/routine/route.ts`
- [X] T024 [US2] Enforce corpus-only no-video guarantee in `scripts/validate-corpus.mts` and `src/lib/corpus/corpus-zod.ts` (reject video URLs/media types in `docs/routine-corpus/*`)
- [X] T025 [US2] Add tests for pose asset resolution and fallback behavior in `tests/unit/corpus-assets.test.ts`

**Checkpoint**: US2 independently returns training-derived still images with stable paths and fallbacks.

---

## Phase 5: User Story 3 — Secular confidence-building enrichment (Priority: P3)

**Goal**: Add English-only, secular enrichment snippets (breath, mindfulness, Sanskrit labels, attributed quotes) while blocking spiritual/chakra content.

**Independent Test**: Generated routines include approved enrichment types at target coverage, quote attribution is present, and secular/English policy checks pass.

- [X] T026 [US3] Author enrichment library with quote attribution metadata in `docs/routine-corpus/enrichment-library.json`
- [X] T027 [US3] Enforce FR-012/FR-013 content policies in validator (banned spiritual terms + English-only checks) in `scripts/validate-corpus.mts`
- [X] T028 [US3] Integrate enrichment selection hooks into constrained generation context in `src/lib/gen/orchestrator.ts`
- [X] T029 [US3] Add optional Sanskrit label + enrichment attachment in response assembly in `src/app/api/routine/route.ts`
- [X] T030 [US3] Add policy and attribution tests for enrichment snippets in `tests/unit/corpus-enrichment.test.ts`

**Checkpoint**: US3 independently delivers secular, English-only enrichment with attribution and policy compliance.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, documentation, and release checks across all stories.

- [X] T031 [P] Add release checklist for joint bundle versioning (FR-014 / SC-010) in `docs/routine-corpus/README.md`
- [X] T032 [P] Document operator runbook updates in `README.md` and `specs/004-mvp4-routine-data-corpus/quickstart.md`
- [X] T033 Run full verification commands (`npm run validate:corpus`, `npm test`, `npm run lint`) and capture expected outputs in `specs/004-mvp4-routine-data-corpus/quickstart.md`
- [X] T034 Create reviewer spot-check template for SC-006 in `docs/routine-corpus/review-checklist.md` (5 random routines, timing log, coherence/safety/time-accuracy pass-fail, reviewer signoff)
- [X] T035 Validate SC-001..SC-010 evidence, attach completed reviewer spot-check results from `docs/routine-corpus/review-checklist.md`, and update notes in `specs/004-mvp4-routine-data-corpus/checklists/requirements.md`
- [X] T036 Add schema-vs-zod alignment test for corpus contracts in `tests/unit/corpus-schema-sync.test.ts` (compare `specs/004-mvp4-routine-data-corpus/contracts/corpus-bundle.schema.json` with `src/lib/corpus/corpus-zod.ts`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: starts immediately.
- **Phase 2 (Foundational)**: depends on Phase 1; blocks all story phases.
- **Phase 3 (US1)**: depends on Phase 2; MVP path.
- **Phase 4 (US2)**: depends on Phase 2 and US1 routine IDs for asset indexing.
- **Phase 5 (US3)**: depends on Phase 2; can proceed after US1 wiring exists.
- **Phase 6 (Polish)**: depends on completion of desired stories.

### User Story Dependencies

- **US1 (P1)**: no dependency on other user stories; core MVP.
- **US2 (P2)**: uses US1 pose IDs and response assembly path, but remains independently testable.
- **US3 (P3)**: uses constrained generation path from US1, independently testable for policy/compliance.

### Parallel Opportunities

- Setup tasks T003 and T004 can run together.
- Foundational test tasks T009 and T010 can run in parallel after T005-T008.
- US1 authoring tasks T013 and T014 can run in parallel after T012.
- US2 tasks T020 and T021 can run in parallel.
- Polish docs tasks T031 and T032 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Parallel corpus authoring for US1:
Task: "T013 [US1] Author routines in docs/routine-corpus/routines.json"
Task: "T014 [US1] Author intake mapping in docs/routine-corpus/intake-mapping.json"

# Then integrate runtime path:
Task: "T016 [US1] Extend orchestrator constraints in src/lib/gen/orchestrator.ts"
Task: "T017 [US1] Integrate corpus resolver in src/app/api/routine/route.ts"
```

---

## Implementation Strategy

### MVP first (User Story 1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate constrained generation + duration + mapping behavior.
4. Demo/deploy MVP if ready.

### Incremental delivery

1. Add US2 for stable still-image baseline.
2. Add US3 for secular/English enrichment and attribution quality.
3. Run Phase 6 cross-cutting checks before release.

### Suggested MVP scope

- **MVP**: Through **Phase 3 (US1)**.
- **Release candidate**: Through **Phase 6** with SC evidence captured.

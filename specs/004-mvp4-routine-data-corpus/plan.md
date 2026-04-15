# Implementation Plan: MVP4 — Curated Routine Library & Training-Derived Pose Media

**Branch**: `004-mvp4-routine-data-corpus` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-mvp4-routine-data-corpus/spec.md`

## Summary

Ship a **versioned static corpus** under `docs/routine-corpus/` (joint **bundleVersion** for routines + intake mapping + pose still index per FR-014) sourced from **`docs/.trainingData`** stick figures—**no video** in corpus. Content is **English-only**, **secular** (no chakra / religious doctrine per clarifications). Generation uses a **constrained blend**: the **LLM composes** each session but may only emit **pose IDs**, durations, and enrichment drawn from **approved pools** (validated post-parse). Provide **Zod + JSON Schema** validation, **`npm run validate:corpus`**, optional asset sync to **`public/routine-corpus/assets/`**, and orchestrator integration that injects allowed IDs into prompts and rejects unknown poses.

## Technical Context

**Language/Version**: TypeScript on **Node.js 20+** (Next.js runtime)  
**Primary Dependencies**: Next.js (App Router), React, **Zod**, existing GenOrchestrator adapter  
**Storage**: **Git-tracked JSON + SVG** under `docs/` and `public/`; no user or corpus DB  
**Testing**: **Vitest**, ESLint; corpus validation script in CI  
**Target Platform**: Web; Node server for Route Handlers and orchestration  
**Project Type**: Single Next.js app (`src/`)  
**Performance Goals**: Corpus load **once** per cold start or lazy import; negligible vs LLM latency  
**Constraints**: Constitution **P2** (Zod + schema sync); **P3** (server-only orchestration); **P4** (no intake persistence); **P5** English-only corpus text; **P6** wellness not medical  
**Scale/Scope**: ≥12 routines, ≥6 catalog tags, ~600s ±30s per routine; bounded pose library  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md).

| Gate | Rule | Status |
|------|------|--------|
| G-TS | P1 — TypeScript, Node 20+, App Router | **PASS** |
| G-CONTRACTS | P2 — Zod + contracts in sync | **PASS** — add `src/lib/corpus/*-zod.ts` + [contracts/corpus-bundle.schema.json](./contracts/corpus-bundle.schema.json) |
| G-SERVER | P3 — orchestration server-only | **PASS** — corpus load + prompt constraints in server modules |
| G-PRIVACY | P4 — no raw intake persistence | **PASS** — static corpus; mapping uses in-request intake only |
| G-A11Y / English | P5 | **PASS** — FR-013 English-only instructional text |
| G-WELLNESS | P6 | **PASS** — corpus copy non-medical; secular enrichment |

**Post-design re-check**: Data model + JSON Schema align; no client secrets — **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/004-mvp4-routine-data-corpus/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── corpus-bundle.schema.json
└── tasks.md             # /speckit.tasks (not created here)
```

### Source Code (repository root)

```text
docs/
├── routine-corpus/                 # NEW — bundle JSON (+ README); git-versioned
│   ├── README.md
│   └── (bundle files per research R1)
├── .trainingData/                  # Existing stick figures (source of truth for art)

public/
└── routine-corpus/
    └── assets/                     # NEW — web-servable SVG copies (slug paths)

src/
├── lib/
│   ├── corpus/                     # NEW — load, validate, resolve mapping
│   │   ├── bundle.ts
│   │   ├── corpus-zod.ts
│   │   └── resolve-intake.ts
│   └── gen/
│       └── orchestrator.ts       # EXTEND — constrained prompt + post-validate pose IDs
├── app/api/routine/
│   └── route.ts                   # EXTEND — wire corpus when flag / env

scripts/
└── validate-corpus.mts            # NEW (or .ts) — npm run validate:corpus

tests/
└── unit/
    └── corpus.test.ts             # NEW — parse, duration, banned words
```

**Structure Decision**: Single Next.js app; new `docs/routine-corpus/` for authoring, `src/lib/corpus/` for runtime, `public/routine-corpus/assets/` for static images.

## Complexity Tracking

No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0: Research

**Status**: Complete. See [research.md](./research.md).

**Highlights**:

- **R1**: Atomic bundle layout under `docs/routine-corpus/` + shared `bundleVersion`.
- **R2**: Pose index + **`public/`** copies or server read—prefer public slug paths for `<img>`.
- **R3**: **`validate:corpus`** script (Zod + banned-word / no-video checks).
- **R4**: Orchestrator **constrained blend** — allowed pose list + post-validation.
- **R5**: **`intake-mapping.json`** driven resolver.
- **R6**: MVP3 media may override images; corpus stills are baseline.
- **R7**: Vitest for corpus helpers.

## Phase 1: Design Artifacts

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| JSON Schema | [contracts/corpus-bundle.schema.json](./contracts/corpus-bundle.schema.json) |
| Quickstart | [quickstart.md](./quickstart.md) |

**Agent context**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent` after saving this plan.

## Phase 2 Handoff

Create **[tasks.md](./tasks.md)** via **`/speckit.tasks`** — expected themes: author initial corpus meeting SC-001; asset sync script; Zod schemas; validator CLI; orchestrator + `POST /api/routine` wiring behind feature flag or env; tests. Run **`/speckit.implement`** when ready.

# Implementation Plan: MVP2 Refined Recommendations Experience

**Branch**: `002-mvp2-ui-llm-refinement` | **Date**: 2026-04-13 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-mvp2-ui-llm-refinement/spec.md`

## Summary

Extend the Yoga.ai MVP so users can select **multiple** discomfort types (symptoms) and **multiple** body regions, with **context-aware** generated routines that vary substantively with the combined input, include **yoga style** guidance (e.g. Hatha, Vinyasa, Yin), and show a **richer results UI** (pose imagery placeholder + labeled video-reference slot per step). **Non-functional**: WCAG **2.1 AA**, **English-only** UI and model output, **ephemeral** handling of raw intake (no persistence after results), **≤30s** typical generation time with visible progress when slower.

**Approach**: Evolve the existing Next.js App Router stack (`POST /api/routine`, Zod contracts, server-only `generateRoutineStructured`) by (1) extending `RoutineRequest` to array fields with validation, (2) updating intake UI to multi-select with accessible patterns, (3) enriching orchestrator prompts and JSON schema for model output (style + media fields), (4) upgrading `SafeRoutineView` (and related) for layout and placeholders, (5) aligning API timeout and loading UX with **FR-010**.

## Technical Context

**Language/Version**: TypeScript **5.7** on **Node.js 20+** (Next.js runtime)  
**Primary Dependencies**: **Next.js 15** (App Router), **React 19**, **Tailwind CSS 3**, **Zod 3**  
**Storage**: **N/A** for this feature (ephemeral requests; no new durable store)  
**Testing**: **Vitest** (`npm test`), ESLint incl. **eslint-plugin-jsx-a11y**  
**Target Platform**: Web (modern browsers); serverless/Node for API routes  
**Project Type**: **Web application** (single Next.js app under `src/`)  
**Performance Goals**: **FR-010** / **SC-008** — ≥90% of typical runs complete end-to-end within **30s** under normal conditions; client shows progress if exceeded  
**Constraints**: Raw intake **not** persisted after response (**FR-009**); **WCAG 2.1 AA** for selection + results (**FR-007**); **English-only** (**FR-011**)  
**Scale/Scope**: Single-session flows; multi-select cardinality bounded in validation (see `data-model.md`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Authoritative rules: [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) (P1–P6). The following gates map MVP2 work to those principles:

| Gate | Constitution / rule | Status |
|------|---------------------|--------|
| G-TS | P1 — TypeScript, Node 20+, App Router | **PASS** |
| G-CONTRACTS | P2 — Zod + contracts | **PASS** (extend `src/lib/contracts/routine-zod.ts` + feature `contracts/`) |
| G-SERVER-LLM | P3 — server-only generation; no client secrets | **PASS** |
| G-A11Y | P5 — WCAG 2.1 AA when spec requires | **PASS** (verify in implementation + tasks T021) |
| G-PRIVACY | P4 — no durable raw intake; no full-body production logs | **PASS** (stateless API; confirm in tasks T020) |

**Post-design re-check**: Design artifacts preserve server-only generation, Zod validation, and ephemeral posture — **PASS** pending implementation verification (T020–T021).

## Project Structure

### Documentation (this feature)

```text
specs/002-mvp2-ui-llm-refinement/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1 — JSON Schema (MVP2 target shapes)
└── tasks.md             # From /speckit.tasks (not created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── routine/
│           └── route.ts          # POST handler, timeout, validation
├── components/
│   ├── intake/
│   │   └── IntakeFlow.tsx        # Multi-select intake (to be updated)
│   ├── routine/
│   │   ├── RoutineResult.tsx
│   │   └── SafeRoutineView.tsx   # Rich results (to be updated)
│   └── yoga/
│       └── YogaSession.tsx       # Phase state, fetch, retry
├── lib/
│   ├── contracts/
│   │   └── routine-zod.ts      # Zod schemas (must match contracts/)
│   ├── gen/
│   │   └── orchestrator.ts     # LLM + mock + JSON parse
│   ├── intake/
│   │   └── state.ts            # Options + buildRoutineRequestBody
│   ├── knowledge/
│   │   └── select.ts           # Knowledge key from intake
│   └── yoga/
│       └── compose-context.ts  # Prompt composition
tests/
└── (unit + integration — mirror existing layout)
```

**Structure Decision**: Single Next.js application (`src/`). No separate `frontend/`/`backend/` split. Feature work touches API route, contracts, orchestration, prompts, and UI components listed above.

## Complexity Tracking

> No constitution violations requiring justification. Multi-select and richer JSON increase **local** complexity but stay within one app and one API route.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0: Research

**Status**: Complete. All items resolved in [research.md](./research.md) (no `NEEDS CLARIFICATION` remaining).

**Highlights**:

- Request body moves from scalar `discomfortType` / `bodyRegion` to **arrays** with minimum one element each.
- Knowledge-base key selection uses a **deterministic reduction** from multi-select to a single `knowledgeKey` for static modules, while the **full sets** are passed to the model for differentiated copy.
- Model JSON shape gains **`yogaStyle`** and per-step **`media`** (image URL + video label).
- Ephemeral policy: no DB writes; avoid logging raw intake in production monitors.

## Phase 1: Design Artifacts

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| JSON Schema (MVP2) | [contracts/routine-request.schema.json](./contracts/routine-request.schema.json), [contracts/routine-response.schema.json](./contracts/routine-response.schema.json) |
| Quickstart | [quickstart.md](./quickstart.md) |

**Agent context**: Updated via `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent`.

## Phase 2 Handoff

Run **`/speckit.tasks`** to generate `tasks.md` from this plan and the spec.

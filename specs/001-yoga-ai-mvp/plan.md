# Implementation Plan: Yoga.ai MVP — Guided Yoga Routine Intake

**Branch**: `001-yoga-ai-mvp` | **Date**: 2026-04-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-yoga-ai-mvp/spec.md`

## Summary

Deliver a **stateless** mobile-friendly web app (**Next.js App Router**, **Tailwind CSS**) that walks users through a **disclaimer + structured intake** (with optional free-text note), applies **deterministic safety rules**, serves **static YTT200-level Hatha/Vinyasa knowledge**, and, on the **safe path**, requests a **structured ~10-minute routine** via the organization’s **GenOrchestrator** adapter from **server-side** code only. **Restricted** and **orchestration-failure** paths return **static breathing/rest** content per spec clarifications. No database, auth, or payments. **Total monthly cost** target **&lt;$20** (infra + API) via lean hosting and tight generation budgets (see [research.md](./research.md)).

## Technical Context

**Language/Version**: TypeScript on **Node.js 20+** (Next.js runtime)  
**Primary Dependencies**: **Next.js** (App Router), **React**, **Tailwind CSS**, **Zod** (or equivalent) for JSON validation against [contracts](./contracts/), **GenOrchestrator** via a dedicated server-only adapter module (package name TBD when wired)  
**Storage**: **N/A** (no user data persistence; FR-007)  
**Testing**: **Vitest** (or Jest) for unit tests; **Playwright** optional for smoke e2e  
**Target Platform**: Modern evergreen **desktop and mobile browsers** (English UI only)  
**Project Type**: **Web application** (single Next.js codebase; API Route Handlers for orchestration)  
**Performance Goals**: End-to-end **&lt;15 minutes** user time (SC-001); routine generation bounded by **~25s server timeout** (tunable) with FR-010 fallback  
**Constraints**: **&lt;$20/month** TCO; **WCAG 2.1 AA** on core views; **no client-side LLM keys**; deterministic safety before any movement content  
**Scale/Scope**: Pilot **hundreds** of completed sessions/month; **5–7** primary UI states (disclaimer, intake steps, restricted, safe routine, generation fallback)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository has **no** `.specify/memory/constitution.md`. Gates are derived from [spec.md](./spec.md):

| Gate | Source | Status |
|------|--------|--------|
| No database / auth / payments for MVP | FR-007 | **Pass** — design is in-memory session + static KB files |
| All LLM output via unified orchestration | FR-008 | **Pass** — single `lib/gen` adapter + Route Handler |
| Safety rules deterministic before personalized movement | FR-003 | **Pass** — pure functions in `lib/safety` |
| Medical disclaimer + explicit acknowledgment | FR-001 | **Pass** — gated flow before intake |
| English-only UI | FR-011 | **Pass** |
| WCAG 2.1 AA on core screens | FR-012 | **Pass** — documented in research; enforce in implementation |
| Orchestration failure UX | FR-010 + clarifications | **Pass** — contracts include `generation_fallback` |

**Post-design re-check**: Contracts and data model preserve FR-007 (no persisted entities); no new storage introduced. **Pass.**

## Project Structure

### Documentation (this feature)

```text
specs/001-yoga-ai-mvp/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # /speckit.tasks (not produced here)
```

### Source Code (repository root) — target layout

Greenfield Next.js app (to be scaffolded during implementation):

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Landing + disclaimer gate
│   ├── intake/                  # Intake steps route segment(s)
│   └── api/
│       └── routine/
│           └── route.ts       # POST: safety + orchestrator + fallback
├── components/                 # Chat-style UI, accessible controls
└── lib/
    ├── intake/                 # Step state machine / types
    ├── safety/                 # evaluateSafety (deterministic)
    ├── knowledge/              # Static knowledge module + selectors
    ├── yoga/                   # Yoga service: compose prompt context + KB
    └── gen/
        └── orchestrator.ts     # GenOrchestrator adapter (server-only)

tests/
├── unit/
│   ├── safety.test.ts
│   └── knowledge.test.ts
└── contract/                 # Optional: schema fixtures
```

**Structure Decision**: **Single Next.js project** (`src/app`, `src/lib`, `src/components`). Server logic for orchestration lives under **`src/app/api`** and **`src/lib/gen`** so secrets never ship to the client. No separate backend repo for MVP.

## Phase 0 & Phase 1 Outputs

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [research.md](./research.md) | GenOrchestrator adapter, budget, timeouts, testing |
| Data model | [data-model.md](./data-model.md) | In-memory entities and transitions |
| Contracts | [contracts/](./contracts/) | JSON Schemas for routine request/response/failure |
| Quickstart | [quickstart.md](./quickstart.md) | Env vars and dev verification steps |

## Agent context

Run during `/speckit.plan`: `update-agent-context.ps1 -AgentType cursor-agent` updates Cursor rules from this plan.

## Complexity Tracking

> No constitution violations requiring justification. Single app, no extra services.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

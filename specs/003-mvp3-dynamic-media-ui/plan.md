# Implementation Plan: MVP3 — Dynamic Routines, Reference Media, Mindfulness UI

**Branch**: `003-mvp3-dynamic-media-ui` | **Date**: 2026-04-13 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-mvp3-dynamic-media-ui/spec.md`

## Summary

Deliver **more varied** generated routines (no copy-paste feel for similar intakes), **server-resolved** pose imagery with attribution and **optional YouTube** reference links via web APIs, and a **mindfulness-themed** colorful UI (gradients, yoga imagery, calm backdrops) while keeping **WCAG 2.1 AA** and **English-only** scope. Operator tuning of “creative latitude” stays **deployment configuration only** (no admin UI in MVP3).

**Approach**: (1) Strengthen prompts + server-side diversity nonce + existing **environment-controlled** temperature/model (**FR-002**, no admin UI); (2) add a **post-generation enrichment** stage in `POST /api/routine` that calls **Wikimedia Commons** and **YouTube Data API v3** with per-step timeouts, **at most one retry** on transient upstream errors, and fallbacks; (3) extend Zod + JSON Schema for optional `imageAttribution`, `videoUrl`, `videoTitle`; (4) enable and polish `SafeRoutineView` media blocks (**wellness copy near media**, attribution, external links, loading/fallback UX per **FR-006**, **FR-009**) + global layout theming (`IntakeFlow`, `YogaSession`, shell) with **reduced-motion** and contrast-safe panels; (5) before release, **lint + manual WCAG spot-check** on primary flows (**SC-005**). Document operator and media keys in repository **`.env.example`** (see [tasks.md](./tasks.md) T001, T018).

## Technical Context

**Language/Version**: TypeScript on **Node.js 20+** (Next.js runtime)  
**Primary Dependencies**: **Next.js** (App Router), **React**, **Tailwind CSS**, **Zod**  
**Storage**: **N/A** for user intake (ephemeral); optional in-memory cache for media URLs only  
**Testing**: **Vitest**, ESLint (incl. jsx-a11y); **manual accessibility spot-check** (keyboard, focus, zoom, contrast) for SC-005 beyond lint  
**Target Platform**: Web (modern browsers); Node server for Route Handlers  
**Project Type**: Single **web application** under `src/`  
**Performance Goals**: Inherit **≤30s** typical generation window (MVP2); enrichment adds bounded time with per-step timeouts (see [research.md](./research.md) R7)  
**Constraints**: Server-only API keys (**constitution P3**); no durable raw intake (**P4**); **WCAG 2.1 AA** on primary flows (**P5**); wellness copy not medical (**P6**)  
**Scale/Scope**: Single-session flows; bounded step count; parallel enrichment with capped concurrency  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md).

| Gate | Rule | Status |
|------|------|--------|
| G-TS | P1 — TypeScript, Node 20+, App Router | **PASS** |
| G-CONTRACTS | P2 — Zod + contracts in sync | **PASS** (extend `routine-zod.ts` + `specs/003-.../contracts/`) |
| G-SERVER | P3 — orchestration + external APIs server-only | **PASS** (enrichment in Route Handler or server modules) |
| G-PRIVACY | P4 — no raw intake persistence; redacted logs | **PASS** (enrichment logs poseId/status only) |
| G-A11Y | P5 — WCAG 2.1 AA, English-only | **PASS** (theme on panels; lint + manual spot-check per spec SC-005) |
| G-WELLNESS | P6 — non-medical positioning | **PASS** (routine disclaimer + short wellness copy near third-party media per **FR-006**) |

**Post-design re-check**: Research resolves operator-tuning scope; no client secrets in bundle; contracts document extended media — **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/003-mvp3-dynamic-media-ui/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1 — routine-response (MVP3)
└── tasks.md             # Actionable tasks ([tasks.md](./tasks.md))
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   └── routine/
│   │       └── route.ts           # POST: generate → enrich → validate → respond
│   ├── layout.tsx                 # Global mindfulness backdrop / theme hooks
│   └── globals.css                # Optional CSS variables for theme
├── components/
│   ├── intake/
│   │   └── IntakeFlow.tsx
│   ├── routine/
│   │   ├── RoutineResult.tsx
│   │   └── SafeRoutineView.tsx    # Media; attribution; wellness line; video link; fallbacks
│   └── yoga/
│       └── YogaSession.tsx
├── lib/
│   ├── contracts/
│   │   └── routine-zod.ts         # Extend StepMedia
│   ├── gen/
│   │   └── orchestrator.ts        # Prompt diversity + nonce injection
│   └── media/                     # NEW: commons + youtube clients (server-only)
│       ├── enrich-steps.ts
│       ├── wikimedia.ts
│       └── youtube-search.ts
tests/
└── unit (contracts, enrichment helpers)
```

**Structure Decision**: Continue **single Next.js app**; add `src/lib/media/` for server-only enrichment. No separate backend repo.

## Complexity Tracking

No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0: Research

**Status**: Complete. See [research.md](./research.md). No `NEEDS CLARIFICATION` items remain for planning.

**Highlights**:

- Operator tuning: **environment only** (R1).
- Variation: temperature + prompt + **server nonce** (R2).
- Images: **Wikimedia Commons** + attribution (R3).
- Video: **YouTube Data API v3** (R4).
- Enrichment: **post-process** in API route with timeouts, **single retry** on transient errors where appropriate (R5).
- UI: **tokens + panels** for contrast-safe mindfulness theme; **prefers-reduced-motion** for decorative motion (R6).
- Performance: **timeouts and circuit-breaker** to fallbacks (R7).
- Release: **SC-005** = automated a11y lint + **manual** keyboard/zoom/contrast pass ([tasks.md](./tasks.md) T018).

## Phase 1: Design Artifacts

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| JSON Schema (MVP3 response) | [contracts/routine-response.schema.json](./contracts/routine-response.schema.json) |
| Quickstart | [quickstart.md](./quickstart.md) |

**Agent context**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent` after this plan is saved.

## Phase 2 Handoff

Use **[tasks.md](./tasks.md)** for implementation order (including dependency note: **US1** variation work may follow env docs alone; **contract extension** required before **US2**). Run **`/speckit.implement`** when ready.

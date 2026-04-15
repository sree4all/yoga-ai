# Data Model: MVP3 — Dynamic Routines, Reference Media, Mindfulness UI

**Branch**: `003-mvp3-dynamic-media-ui` | **Spec**: [spec.md](./spec.md)

## Overview

MVP3 **extends** MVP2 types: routine generation gains **server-side diversity controls** (env); each **safe routine step** gains **enriched media** (resolved image URL + attribution, optional canonical video URL + title) produced **after** LLM output; UI adopts **mindfulness theme** presentation tokens (no new persisted entities).

## Types (conceptual)

### Operator configuration (non-persisted)

| Concept | Source | Notes |
|---------|--------|--------|
| Creative latitude | Env (`ROUTINE_GEN_TEMPERATURE`, optional future vars) | Clamps applied in server code |
| Model identity | Env (`OPENAI_MODEL`, `GENORCHESTRATOR_MODEL`) | Unchanged from MVP2 |

### `StepMedia` (MVP3 extension)

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| `imageUrl` | `string` (absolute `https:` URI or app-relative) | yes | Safe URL after server validation; may be placeholder |
| `imageAttribution` | `string` | no | Short line when source requires credit (e.g. Commons) |
| `videoUrl` | `string` (`https` YouTube watch or short link) | no | Present when Data API returns a candidate |
| `videoTitle` | `string` | no | Display label for the video link |
| `videoLabel` | `string` | yes | Always present — user-facing hint or fallback when `videoUrl` missing |

**Validation**: URLs must be `https`; YouTube hosts only for `videoUrl` (normalize allowlist). Reject `javascript:`, data URIs for navigable links.

### `RoutineStep` (MVP3)

Same as MVP2 (`poseId`, `instruction`, `durationSeconds`, `media`) with **`media`** conforming to extended `StepMedia`.

**Presentation (UI, not additional API fields):** the results view **SHOULD** render a short, static **wellness / educational** line beside third-party images or video links so media is not framed as medical advice (**FR-006**), alongside the existing routine disclaimer.

### Enrichment metadata (internal / logs only, not in API body)

| Field | Purpose |
|-------|---------|
| `mediaStatus` per step | `resolved` \| `partial` \| `fallback` — for diagnostics; **omit from client JSON** or optional debug flag only |

Constitution **P4**: do not log raw intake; enrichment logs may include `poseId` and HTTP status classes only.

## Relationships

- One `RoutineResponse` (`safe_routine`) contains one `routine` with **1..N** steps.
- Each step’s `media` is **derived** from `poseId` + enrichment services, not from client input.

## State transitions

- **Generation**: Request → validate → generate JSON → **enrich media** → validate response → respond.
- **Failure**: Any enrichment failure → step-level fallback fields; routine still returns if text valid.

## Scale assumptions

- Typical routines: **≤ 12** steps; enrichment parallelized with bounded concurrency (e.g. **4**).
- No cross-session caching of user data required; optional **in-memory** URL cache per deployment is allowed later.

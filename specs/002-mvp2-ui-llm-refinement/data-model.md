# Data Model: MVP2 Refined Recommendations Experience

**Branch**: `002-mvp2-ui-llm-refinement` | **Spec**: [spec.md](./spec.md)

## Overview

Intake moves from **scalar** discomfort and body region to **sets** (arrays) while keeping **intensity** and optional **note**. The API response gains **yoga style** metadata and **per-step media** placeholders for the results UI.

## Types (conceptual)

### `DiscomfortType` / `BodyRegion`

Unchanged enums (see `src/lib/types/intake.ts`). MVP2 allows **multiple** values per session.

### `RoutineRequest` (MVP2)

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| `disclaimerAcknowledged` | `true` | yes | Literal |
| `discomfortTypes` | `DiscomfortType[]` | yes | min length **1**; entries **unique** |
| `bodyRegions` | `BodyRegion[]` | yes | min length **1**; entries **unique** |
| `intensity` | `mild` \| `moderate` \| `severe` | yes | Severe triggers existing restricted path |
| `optionalNote` | `string` | no | max 500 chars |

**Removed (MVP1)**: scalar `discomfortType`, `bodyRegion` — replaced by arrays.

### `YogaStyleBlock`

| Field | Type | Required |
|-------|------|----------|
| `category` | `string` | yes (e.g. `"Hatha"`, `"Vinyasa"`, `"Yin"`) |
| `rationale` | `string` | yes — short user-facing reason tied to intake |

### `StepMedia`

| Field | Type | Required |
|-------|------|----------|
| `imageUrl` | `string` (URI) | yes — may be placeholder service |
| `videoLabel` | `string` | yes — describes / searches for video (e.g. YouTube hint) |

### `RoutineStep` (MVP2)

| Field | Type | Required |
|-------|------|----------|
| `poseId` | `string` | yes |
| `instruction` | `string` | yes |
| `durationSeconds` | `number` | yes (≥ 0) |
| `media` | `StepMedia` | yes |

### `SafeRoutine` payload (embedded in `RoutineResponse`)

| Field | Type | Required |
|-------|------|----------|
| `title` | `string` | yes |
| `totalDurationMinutes` | `number` | yes (1–30) |
| `yogaStyle` | `YogaStyleBlock` | yes |
| `steps` | `RoutineStep[]` | yes (min 1) |

### `RoutineResponse` (discriminated union)

Unchanged **kinds**: `safe_routine` | `restricted` | `generation_fallback`.

MVP2 only extends the **`safe_routine.routine`** object as above.

## Validation rules (Zod)

- Enforce array minima and uniqueness in `routineRequestSchema` (`.refine` or `z.array(z.enum(...)).min(1)` with custom uniqueness check).
- Extend `safeRoutineSchema` to require `yogaStyle` and per-step `media`.
- Keep response as `z.discriminatedUnion("kind", ...)`.

## State transitions (client)

```text
disclaimer → intake (multi-select) → loading → result | error
                ↑___________________________|
                     (Start over / edit)
```

`lastBody` in `YogaSession` remains the retry payload for **`generation_fallback`** while the session exists (**FR-002**); no server-side session store.

## Ephemeral data

After **`safe_routine`** (or other kinds) is returned, **no** server persistence of `discomfortTypes` / `bodyRegions` / `optionalNote` (**FR-009**).

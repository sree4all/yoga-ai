# Data Model: Yoga.ai MVP

**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

All structures are **in-memory** for the session only (FR-007). No persistence layer.

## Enumerations

| Enum | Values | Notes |
|------|--------|--------|
| `Intensity` | `mild` \| `moderate` \| `severe` | `severe` forces restricted path (FR-003). |
| `DiscomfortType` | e.g. `stress` \| `tension` \| `stiffness` \| `other` | Curated list in config; extend as needed. |
| `BodyRegion` | e.g. `neck` \| `shoulders` \| `back` \| `hips` \| `whole_body` \| `other` | Maps to knowledge entries. |
| `SafetyPath` | `safe` \| `restricted` | `restricted` → breathing/rest only; no full asana sequence for complaint. |

## IntakeSession

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `sessionId` | `string` | yes | Ephemeral UUID v4 per load (client-generated or server-assigned for trace only). |
| `disclaimerAcknowledged` | `boolean` | yes | Must be `true` before intake steps (FR-001). |
| `discomfortType` | `DiscomfortType` \| `null` | no until step complete | — |
| `bodyRegion` | `BodyRegion` \| `null` | no until step complete | — |
| `intensity` | `Intensity` \| `null` | no until step complete | — |
| `optionalNote` | `string` | no | Max length e.g. 500 chars; scanned for high-risk terms (FR-002–FR-003). |

## SafetyEvaluation

| Field | Type | Notes |
|-------|------|--------|
| `path` | `SafetyPath` | `restricted` if `intensity === 'severe'` OR curated term match in `optionalNote` OR structured high-risk selections if added later. |
| `triggers` | `string[]` | Machine-readable codes, e.g. `severity:severe`, `term:hernia`. |
| `matchedTerms` | `string[]` | Optional; which patterns matched (for logging/debug only, not stored long-term). |

## DiscomfortProfile

Normalized view used to pick knowledge and to build orchestrator prompts.

| Field | Type | Notes |
|-------|------|--------|
| `discomfortType` | `DiscomfortType` | From intake. |
| `bodyRegion` | `BodyRegion` | From intake. |
| `intensity` | `Intensity` | From intake. |
| `knowledgeKey` | `string` | Stable key into knowledge module, e.g. `neck_tension_mild_mod`. |

## KnowledgeEntry (static module)

| Field | Type | Notes |
|-------|------|--------|
| `id` | `string` | Stable id. |
| `title` | `string` | English display label. |
| `sequence` | `PoseStep[]` | Ordered steps for KB fidelity. |
| `posesToAvoid` | `string[]` | Pose ids or names must not appear in generated safe-path output. |
| `breathingFallback` | `BreathingScript` | Static copy for FR-010 / restricted path segments. |

### PoseStep

| Field | Type | Notes |
|-------|------|--------|
| `poseId` | `string` | Stable id for audit/tests. |
| `durationSeconds` | `number` | Suggested hold/time. |
| `cues` | `string[]` | Static English cues from YTT200-level scope. |

### BreathingScript

| Field | Type | Notes |
|-------|------|--------|
| `steps` | `{ instruction: string; durationSeconds?: number }[]` | Used when orchestration fails or restricted path. |

## RoutinePresentation (API / UI)

Either:

- **Restricted**: `BreathingScript` only (plus supportive copy from static templates), **or**
- **Safe path**: structured routine from orchestrator validated against `KnowledgeEntry` + response schema, **or**
- **Generation fallback** (FR-010): user message + `BreathingScript` from `KnowledgeEntry.breathingFallback` + retry affordance.

## State transitions (client)

```text
[landing + disclaimer] --ack--> [intake step 1] --> ... --> [intake complete]
--> SafetyEvaluation
   |-- restricted --> Restricted presentation (breathing/rest)
   |-- safe --> [request generation] --> success | timeout/error
         |-- success --> Safe routine presentation
         |-- failure --> Generation fallback (static KB + retry)
```

## Validation rules (summary)

- No intake fields collected before `disclaimerAcknowledged === true`.
- `evaluateSafety` runs when all required structured fields are present (and optional note available if any).
- Orchestrator invoked **only** when `path === 'safe'`.

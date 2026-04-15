# Data Model: MVP4 — Curated Routine Library & Training-Derived Pose Media

**Branch**: `004-mvp4-routine-data-corpus` | **Spec**: [spec.md](./spec.md)

## Overview

MVP4 introduces **versioned static data** (no user persistence): a **corpus bundle** of curated ~10-minute routines, **intake→catalog tag mapping**, **pose→still asset** index, and **enrichment snippets**. The **LLM** composes user-facing copy using **only** approved pose IDs and referenced snippets (**constrained blend**). Runtime types align with existing `PoseStep`-like shapes where possible; new fields are additive and validated with Zod + JSON Schema.

## Entities

### Corpus bundle (atomic release)

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| `bundleVersion` | string (semver) | yes | Single version for entire drop (FR-014) |
| `schemaVersion` | integer | yes | Bump when JSON shape breaks consumers |
| `routines` | `CuratedRoutine[]` | yes | ≥12 routines across ≥6 catalog tags (SC-001), each ~600s ±30s |
| `intakeMapping` | `IntakeMapping` | yes | Maps intake dimensions to `catalogTags[]` |
| `poseAssetIndex` | `PoseAssetIndex` | yes | Every referenced `poseId` has entry or explicit fallback rule |
| `enrichmentLibrary` | `EnrichmentSnippet[]` | no | Pool of secular English snippets by type |
| `safetySubstitutions` | map | no | `poseId` → allowed replacement when model/pool mismatch |

### CuratedRoutine

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| `id` | string | yes | Stable slug |
| `title` | string | yes | English |
| `totalDurationSeconds` | number | yes | Target 600 ± 30; sum of steps should match |
| `catalogTags` | string[] | yes | ≥1; from extended taxonomy |
| `steps` | `CorpusStep[]` | yes | Ordered |
| `enrichmentRefs` | string[] | no | IDs into `enrichmentLibrary` |

### CorpusStep

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| `poseId` | string | yes | Must exist in `poseAssetIndex` or substitution table |
| `durationSeconds` | number | yes | Positive |
| `cues` | string[] | yes | English instructional lines (may be overridden by LLM if policy allows—**default** text for validation) |
| `sanskritName` | string | no | Transliteration only |
| `quoteRef` | string | no | ID into quote metadata with attribution |

### IntakeMapping

Logical structure (exact JSON shape in contracts):

- Entries keyed by deterministic strings (e.g. `knowledgeKey` + region profile) **or** list of rules with `match` predicates and `catalogTags` output—planning defers to implementation for simplest authorable form.

### PoseAssetIndex

| Field per `poseId` | Type | Rules |
|--------------------|------|--------|
| `displayName` | string | English |
| `sanskritName` | string | optional |
| `stillImage` | object | `path` relative to site root (e.g. `/routine-corpus/assets/warrior-1.svg`) **or** `sourceTrainingDataPath` for build sync only |
| `fallback` | boolean | if true, use generic placeholder illustration |

### EnrichmentSnippet

| Field | Type | Rules |
|-------|------|--------|
| `id` | string | unique |
| `type` | enum | `quote` \| `breath` \| `mindfulness` \| `sanskrit_gloss` |
| `text` | string | English; no chakra/banned terms (SC-008) |
| `attribution` | string | required for `type=quote` |

## Relationships

- **Intake** (existing) → **IntakeMapping** → **catalogTags** → filter **CuratedRoutine** / pool for generator.
- **CuratedRoutine.steps[].poseId** → **poseAssetIndex** → still image URL for UI baseline.
- **Corpus bundle** 1:1 with **bundleVersion** release artifact set.

## Validation rules (summary)

- Sum of step `durationSeconds` per routine ∈ [570, 630] unless documented exception.
- No `videoUrl` / `.mp4` / known video hosts in corpus JSON (SC-003).
- 100% of `poseId` in routines ⊆ keys of index ∪ substitutions (SC-007).

## Privacy (constitution P4)

Corpus is **static**; no user data stored in MVP4 files. Resolver uses **in-memory** intake only.

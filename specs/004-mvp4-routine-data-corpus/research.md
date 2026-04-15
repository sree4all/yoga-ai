# Research: MVP4 — Curated Routine Library & Training-Derived Pose Media

**Branch**: `004-mvp4-routine-data-corpus` | **Spec**: [spec.md](./spec.md)

## R1 — Corpus storage layout and versioning

- **Decision**: Store the **atomic corpus bundle** under `docs/routine-corpus/` with a **`bundle.json` manifest** (or equivalent single entry file) that declares **`bundleVersion`** (semver string per FR-014) and references co-located **`routines.json`**, **`intake-mapping.json`**, **`pose-asset-index.json`**, and **`README.md`** (operator-facing). All files share one **git commit** per release; CI fails if manifest version ≠ folder convention (optional) or if checksums mismatch.
- **Rationale**: Matches **joint release** (FR-014, SC-010); reviewers can diff JSON in PRs; no DB.
- **Alternatives considered**: Monolithic single JSON file (harder to edit); version only in git tags without in-file version (weaker runtime checks).

## R2 — Serving still images from `docs/.trainingData`

- **Decision**: **Pose asset index** maps canonical `poseId` → **web-servable path**. Prefer **copying** (or build-time sync of) required SVGs into **`public/routine-corpus/assets/<slug>.svg`** with **slugified** filenames to avoid spaces/special chars in URLs; keep **source** path in index for traceability to `docs/.trainingData/...`. Alternative acceptable in implementation: **server-only** Route Handler that `readFile`s from `docs/` — use if asset count is large and copy is undesirable.
- **Rationale**: `<img src="/routine-corpus/assets/...">` works everywhere; avoids exposing full `docs/` tree.
- **Alternatives considered**: Point `file://` or raw `docs/` URLs (not served by Next static); only Wikimedia (violates “training figures” preference for corpus stills).

## R3 — Validation toolchain

- **Decision**: **`npm run`** script (e.g. `validate:corpus`) using **TypeScript + Zod** (constitution P2) parsing bundle JSON; optional **AJV** compile of JSON Schema in CI. Checks: duration sums 600±30s per routine; **no** `http` video URLs; **English** heuristic on quote fields; optional **banned-word** list for chakra/spiritual terms (SC-008).
- **Rationale**: Repeatable SC-002, SC-007, SC-009, SC-010 gates.
- **Alternatives considered**: Manual-only review (does not scale).

## R4 — Constrained blend with existing orchestrator

- **Decision**: At generation time, load **approved pose ID set** + **optional sequence templates** + **enrichment snippet library** from validated corpus module. **System prompt** (or equivalent server adapter) lists **allowed pose IDs** and instructs the model to **only** use those IDs; **post-parse validation** rejects/repairs steps with unknown `poseId` using documented substitution table (**FR-010**, edge case). Duration target **~600s** communicated in prompt; response validated against Zod and duration tolerance.
- **Rationale**: Aligns with clarification **constrained blend**; keeps one LLM path.
- **Alternatives considered**: Template-only fill-in (less natural language); full static routine return (contradicts constrained blend).

## R5 — Intake → catalog tag resolution

- **Decision**: **`intake-mapping.json`** maps composite keys (e.g. `bodyRegions` + `discomfortTypes` + `knowledgeKey` patterns) to **`catalogTags[]`**; resolver runs **before** routine selection. Document **precedence** rules in README when multiple mappings match.
- **Rationale**: Implements FR-011 with testable data.
- **Alternatives considered**: Hard-coded only in TS (harder for non-dev authors).

## R6 — Relationship to MVP3 media enrichment

- **Decision**: Corpus supplies **default** still image URLs from **pose-asset-index**; **MVP3 Wikimedia** enrichment may **override** image when enabled (existing behavior), but **must not** add video when sourcing from MVP4-only paths (MVP4 has no video). Order: **corpus still** as baseline → optional Commons override if product keeps both.
- **Rationale**: Avoids conflicting requirements; spec says MVP4 no video in corpus; YouTube remains optional from MVP3.

## R7 — Testing strategy

- **Decision**: **Vitest** unit tests for: Zod parse of bundle samples; mapping resolver; duration sum helper; optional banned-word scan. Snapshot tests for golden **minimal** bundle.
- **Rationale**: Constitution P2; fast CI.

---

All items above resolve **Technical Context** unknowns; no `NEEDS CLARIFICATION` remains for implementation planning.

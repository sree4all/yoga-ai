# Research: MVP2 Refined Recommendations Experience

**Feature**: `002-mvp2-ui-llm-refinement` | **Date**: 2026-04-13

## 1. Multi-select intake (symptoms + body regions)

**Decision**: Use **checkbox groups** (multi-select) for curated `DiscomfortType` and `BodyRegion` enums; require **at least one** selection in each group before continuing; show **selected chips** or a summary for clarity.

**Rationale**: Matches FR-001; checkboxes are familiar, work with keyboard and screen readers when labels and `fieldset`/`legend` are correct; avoids ambiguous multi-select dropdowns on mobile.

**Alternatives considered**: Multi-select `<select multiple>` (poor mobile UX); free-text tags (harder to validate and map to knowledge modules).

## 2. API request shape

**Decision**: Replace scalar fields with:

- `discomfortTypes`: `DiscomfortType[]` (min 1, unique)
- `bodyRegions`: `BodyRegion[]` (min 1, unique)

Keep `intensity`, `optionalNote`, `disclaimerAcknowledged` as today.

**Rationale**: Explicit arrays match the spec’s “sets” and validate cleanly in Zod (`z.array(...).min(1)` + optional `.refine` for uniqueness).

**Alternatives considered**: New versioned path `/api/routine/v2` — deferred unless backward compatibility with external clients is required; for this repo, a coordinated migration of client + API is acceptable.

## 3. Mapping multi-select → `knowledgeKey` (static KB)

**Decision**: Use a **deterministic reducer** that maps `(discomfortTypes[], bodyRegions[], intensity)` to a **single** existing `knowledgeKey` string:

1. If `intensity === "severe"` → safety/restricted path unchanged (before KB lookup).
2. Else build a priority-ordered candidate from **union of rules** (e.g., neck/shoulders still bias to `neck_tension_mild` when present in `bodyRegions`; stress/fatigue bias `stress_whole_mild`).
3. Document the precedence in `select.ts` (or successor) so behavior is testable.

**Rationale**: Current `KnowledgeEntry` modules are keyed by a single string; full KB expansion for every combination is out of scope for MVP2. The **model** still receives **full lists** in the prompt so narrative and pose choices can diverge (**FR-003**, **FR-004**).

**Alternatives considered**: One KB entry per combination (combinatorial explosion); random key (non-deterministic tests).

## 4. Non-repetitive, context-specific model output

**Decision**: Update `composeOrchestratorPrompts` to:

- Include **bulleted lists** of all symptoms and all body regions.
- Require a **yoga style** recommendation (`yogaStyle.category` + `yogaStyle.rationale`) mapped to user signals (e.g., stiffness → Yin/restorative bias; fatigue → Vinyasa/energizing bias) per **FR-005**.
- Instruct the model to avoid **copy-paste** openings across different combined inputs and to anchor language in the **specific** regions/symptoms (**FR-003**, **FR-004**).
- Keep `temperature` in a moderate band; optional **deterministic** `seed` not required for MVP2.

**Rationale**: Prompt structure is the main lever; KB sequence still constrains pose order for safety consistency.

**Alternatives considered**: Post-processing deduplication (fragile); multiple LLM calls (latency/cost).

## 5. Richer model JSON (style + media)

**Decision**: Extend generated JSON (parsed in `parseRoutinePayload`) to include:

- `yogaStyle: { category: string; rationale: string }`
- Each step: `media: { imageUrl: string; videoLabel: string }` using **placeholder** URLs/labels (e.g. `picsum.photos` or static `/public` assets + “Search YouTube: …” label) per **FR-006**.

**Rationale**: Single response keeps one round-trip within **FR-010**; UI can render consistently.

**Alternatives considered**: Separate “assets” API (more moving parts).

## 6. Ephemeral privacy (FR-009)

**Decision**: No database persistence of intake; API remains **stateless**. Production logging must **not** record full request bodies containing symptoms; at most aggregate metrics (status codes, latency).

**Rationale**: Matches clarification session; minimizes compliance surface.

**Alternatives considered**: Encrypted audit store (unnecessary for stated product posture).

## 7. WCAG 2.1 AA (FR-007, SC-007)

**Decision**: Use existing **jsx-a11y** lint rules; manual checks on focus order, contrast, form labels, live regions for loading/errors; ensure multi-select controls expose correct **name** and **state** to assistive tech.

**Rationale**: Fits React/Next stack without mandating a specific third-party component library.

## 8. 30-second target (FR-010, SC-008)

**Decision**: Align server-side `timeoutMs()` (or equivalent in `route.ts`) with **30s** default for generation; client shows **loading** + **non-blocking** message if longer; **AbortController** behavior unchanged in spirit.

**Rationale**: Matches spec; existing timeout infrastructure can be tuned.

## 9. English-only (FR-011)

**Decision**: No i18n framework for MVP2; copy and model instructions remain English.

**Rationale**: Spec clarification; avoids partial locale bugs.

# Feature Specification: MVP5 — Learn & Evolve Corpus Growth

**Feature Branch**: `005-corpus-learning-loop`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "MVP5 - Learn and Evolve - Keep adding to this training routine, pose pics, enrichmentRefs and all other applicable information from LLM responses or other search responses information"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Curated growth from approved response candidates (Priority: P1)

As an operator, I can review candidate improvements inferred from successful routine outputs and approved external references, then promote selected items into the curated corpus so the catalog grows over time without breaking quality rules.

**Why this priority**: “Learn and evolve” is the core MVP5 objective. Without a safe promotion path, corpus growth remains manual and inconsistent.

**Independent Test**: In a staging run, generate candidate additions from recent high-quality responses, approve a subset, publish one new corpus version, and verify those additions appear in subsequent routine outputs.

**Acceptance Scenarios**:

1. **Given** eligible candidate data from routine outputs and approved reference lookups, **When** an operator approves candidates, **Then** they are incorporated into the next corpus version with trace metadata.
2. **Given** a promoted candidate, **When** the corpus version is published, **Then** validation checks pass and runtime can use the new entry.

---

### User Story 2 - Safety and quality guardrails for auto-suggested additions (Priority: P2)

As a quality reviewer, I can rely on automatic policy gates (duration, secular language, English-only, no-video corpus rule, pose mapping integrity) so low-quality or unsafe suggestions are rejected before publication.

**Why this priority**: Growth without guardrails introduces regressions and policy violations that can reduce trust.

**Independent Test**: Feed mixed-quality candidates (good + invalid), run validation, confirm invalid candidates are blocked with actionable reasons and valid candidates remain publishable.

**Acceptance Scenarios**:

1. **Given** candidate routines with missing mappings or policy violations, **When** validation runs, **Then** those candidates are rejected and logged with explicit failure reasons.
2. **Given** approved candidates that pass all checks, **When** publication is attempted, **Then** the system emits one valid corpus bundle and no policy exceptions.

---

### User Story 3 - Continuous enrichment expansion with attribution fidelity (Priority: P3)

As a content maintainer, I can continuously add or accept new enrichment snippets (breath, mindfulness, Sanskrit gloss, quotes) from model/search-derived candidates while preserving attribution and style consistency.

**Why this priority**: Enrichment freshness is part of user confidence and perceived personalization quality.

**Independent Test**: Add new enrichment candidates across types, enforce attribution and style checks, publish, and verify new snippets are discoverable and used in generated routines.

**Acceptance Scenarios**:

1. **Given** candidate quote snippets, **When** attribution metadata is incomplete, **Then** publication blocks those entries until corrected.
2. **Given** accepted enrichment candidates, **When** the next bundle is published, **Then** enrichment coverage targets remain met and existing standards are preserved.

---

### Edge Cases

- Candidate routines include pose IDs that are not in the current or proposed pose index.
- Candidate data includes non-English text, spiritual doctrine terms, or implied medical claims.
- Candidate inputs contain duplicate or near-duplicate routines that add no meaningful diversity.
- External search-derived references change or disappear between candidate generation and approval.
- Publication is attempted with mismatched source files (mapping, routines, enrichment) that would break joint-version guarantees.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support a repeatable workflow to collect candidate corpus additions from recent routine outputs and approved search-derived references.
- **FR-002**: The system MUST require explicit operator approval before any candidate item is promoted into the published corpus.
- **FR-003**: The system MUST preserve a candidate-to-published trace record (origin, approval status, publish version) for all promoted items.
- **FR-004**: The system MUST validate candidate routines against corpus standards before publication, including target duration range, pose mapping integrity, and policy conformance.
- **FR-005**: The system MUST enforce existing corpus policy rules during promotion and publish workflows: no video fields in corpus data, secular wording, English-only instructional/quote text, and non-medical framing.
- **FR-006**: The system MUST prevent publication when any required corpus artifact is missing or inconsistent with the target bundle version.
- **FR-007**: The system MUST support adding new pose illustration references and enrichment references through the same approval and validation flow.
- **FR-008**: The system MUST preserve quote attribution requirements for newly added enrichment content.
- **FR-009**: The system MUST keep published growth updates compatible with intake-to-catalog resolution behavior and constrained-generation rules from MVP4.
- **FR-010**: The system MUST not persist raw user intake content as part of the learning workflow; only derived candidate artifacts and redacted metadata are allowed.

### Key Entities *(include if feature involves data)*

- **Candidate Item**: Proposed routine/step/pose-asset/enrichment addition with source, policy-check results, reviewer status, and decision timestamp.
- **Promotion Batch**: A reviewed set of approved candidate items targeted for one publish action.
- **Published Corpus Version**: The canonical bundle produced from baseline + approved changes, with one version identifier and release metadata.
- **Validation Report**: Structured pass/fail summary for candidate and publication checks with machine-readable reasons.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 80% of approved candidate items can be published without manual data rework in a standard review cycle.
- **SC-002**: 100% of published corpus versions pass policy validation gates (no video corpus fields, secular content, English-only text, required attribution).
- **SC-003**: Candidate-to-publication traceability is complete for 100% of promoted items in audit checks.
- **SC-004**: Each monthly corpus release increases either routine count or enrichment library count while maintaining all existing MVP4 quality thresholds.
- **SC-005**: Rejected candidate reports provide explicit actionable reasons in at least 95% of failed submissions.

## Assumptions

- Operators (or trusted reviewers) remain responsible for final approval decisions rather than fully autonomous publishing.
- “Learn and evolve” applies to corpus artifacts and metadata, not raw user intake retention.
- Approved external search-derived references are treated as candidate signals, then normalized into corpus-compatible entries.
- MVP5 expands curation workflow and governance; it does not replace constrained generation runtime behavior established in MVP4.

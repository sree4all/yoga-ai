# Feature Specification: MVP4 — Curated Routine Library & Training-Derived Pose Media

**Feature Branch**: `004-mvp4-routine-data-corpus`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "MVP4 - Read through the docs/.trainingData and generate the relevant routines jsons, pictures of the poses, (do not take any video) and specify it in some data folder under docs to be utilized within the responses. Create as many 10 minutes routine combinations as possible for the various body/muscle the pose affects, Add a flavor of chakras, pranayama, meditation, quotes of famous people, sanskrit words of poses here and there in the 10 mins routine to increase the confidence."

## Clarifications

### Session 2026-04-15

- Q: How should curated routines relate to LLM-generated routines in product behavior? → A: **Constrained blend (Option C)** — the session is always LLM-composed, but pose IDs, step patterns, duration targets (~10 minutes), and enrichment must come only from **approved catalog pools** and documented rules (no free-form invented poses outside the pool except documented safety substitutions).
- Q: How must corpus “body-focus” labels relate to existing intake body regions / discomfort profiles? → A: **Extended taxonomy (Option B)** — the corpus MAY define **additional** focus tags beyond intake enums; a **documented mapping** links intake selections to **one or more** catalog tags (nearest-fit allowed where exact parity does not exist).
- Q: Should chakra- or meditation-themed enrichment be controllable for secular users? → A: **Secular-only MVP4 (Option C)** — the corpus MUST **not** include **chakra** language, **religious doctrine**, or other **explicitly spiritual** framing; **breath (pranayama-style) cues**, **secular present-moment / mindfulness** prompts, **Sanskrit** pose labels, and **attributed quotes** remain in scope.
- Q: What human language(s) should MVP4 instructional text and quotes use? → A: **English only (Option A)** — all instructional copy, cues, and quotes in the MVP4 corpus are **English**; **Sanskrit transliterations** for pose names are permitted as labels alongside English common names.
- Q: How should corpus data and the intake→catalog mapping (FR-011) be released together or separately? → A: **Joint release (Option A)** — each published release uses a **single corpus version identifier**; **routine payloads** and **intake→catalog mapping** ship **together** (no independent cadence for MVP4).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Trustworthy 10-minute routines by body focus (Priority: P1)

A person selects an intake profile tied to a region of the body or common tension pattern (for example hips, spine, neck and shoulders, core). They receive a **fixed-duration** session of about **ten minutes** that feels intentional: clear steps, timings that add up to the target length, and variety across visits. The **wording and flow** are composed for that session, but **every pose and pattern** comes from the **approved corpus pools** (constrained generation).

**Why this priority**: The catalog is the backbone for consistent, non-medical wellness guidance. Body-focused variety directly supports the product’s promise of gentle, relevant movement.

**Independent Test**: Review the documented routine set and confirm multiple distinct **valid 10-minute compositions** exist for different body-focus labels (as templates or pools), each summing to the agreed total time window when assembled, without relying on generated or third-party video from the corpus itself.

**Acceptance Scenarios**:

1. **Given** a body-focus category supported by the catalog, **when** a matching user profile receives a session, **then** the returned steps use **only** pose IDs and step patterns from the **approved MVP4 pools**, and total duration meets the ~10-minute budget within tolerance—even though narrative text is LLM-composed.
2. **Given** any catalog routine labeled as 10 minutes, **when** step durations are totaled, **then** the sum falls within a small agreed tolerance of **600 seconds** (for example ±30 seconds), accounting for optional opening or closing breath space.
3. **Given** the operator expands the library over time, **when** new routines are added, **then** they follow the same duration and focus-tag rules so offerings stay comparable.

---

### User Story 2 — Pose illustrations from in-repo training assets (Priority: P2)

For steps that reference poses represented in the project’s **training figures** (for example stick-figure style illustrations under `docs/.trainingData`), the product can show **still** imagery that corresponds to those poses. **No video** is included in this MVP4 corpus—only static images or vector graphics suitable for inline display.

**Why this priority**: Visual alignment with trusted, already-stored artwork reduces wrong-picture risk compared with random web results and supports calm, consistent presentation.

**Independent Test**: Open the documentation folder for the corpus and verify each routine step that claims an illustration points to an asset path that exists under the training tree (or to an explicitly documented fallback rule).

**Acceptance Scenarios**:

1. **Given** a catalog step names a pose that maps to a figure in `docs/.trainingData`, **when** the response is rendered, **then** the user sees a still image (or equivalent static graphic) tied to that mapping—not a video player or external video link from this corpus.
2. **Given** a pose name has no safe figure match, **when** the routine is authored, **then** the step uses an agreed text-only or generic placeholder treatment documented in the corpus conventions (no broken image reference).
3. **Given** the product disclaimer applies to all movement content, **when** illustrations are shown, **then** copy remains non-medical and instructional, consistent with existing product rules.

---

### User Story 3 — Confidence-building cultural and breath context (Priority: P3)

Within 10-minute sessions, users occasionally see **short, respectful** additions that deepen trust: for example a **Sanskrit** pose name alongside the English common name, a line of **breath** or timing guidance, a **secular** present-moment or mindfulness prompt, or a **brief quote** in **English** from a widely cited teacher or thinker. **MVP4 keeps enrichment secular** (no chakra or religious doctrine—see Clarifications). These lines appear **here and there**—enough to feel authentic, not so dense that steps become hard to follow.

**Why this priority**: Thoughtful framing improves confidence and perceived quality without replacing safety or clarity of physical cues.

**Independent Test**: Sample several catalog routines and verify each includes at least one enrichment of this kind (or a documented exception), that quoted material is attributed or in the public domain per corpus rules, and that **no** snippet violates the secular-content rule.

**Acceptance Scenarios**:

1. **Given** a routine from the library, **when** a user reads through it, **then** they encounter at least one optional enrichment category among: Sanskrit label, breath (pranayama-style) cue, secular mindfulness / present-moment focus, or attributed inspirational quote—distributed across steps or intro/outro text—and **no** chakra, religious, or explicitly spiritual doctrinal phrasing sourced from the MVP4 corpus.
2. **Given** a quote or attributed line appears, **when** the corpus is reviewed, **then** the quote body is **English**, and attribution or licensing notes meet the project’s content policy for short excerpts.
3. **Given** Sanskrit terms appear, **when** transliteration is used, **then** it follows a single consistent style documented for the corpus (so the product does not mix conflicting spellings for the same pose).

---

### Edge Cases

- **Overlap of body areas**: A routine may list a **primary** focus and optional **secondary** areas; selection logic must not promise mutually exclusive medical effects.
- **Intake vs catalog tags**: When intake maps to **multiple** catalog tags or only a **nearest** match, the product behavior MUST follow the published mapping rules so users are not misled about specificity.
- **Intensity and contraindications**: Catalog entries must respect existing safety profiles (for example avoid listing inversions in a “gentle neck” routine unless explicitly aligned with product safety rules).
- **Duplicate-feel sequences**: Authors should avoid near-duplicate routines that only reorder two identical blocks; the success criteria require meaningful combinatorial variety.
- **Missing assets**: If a pose is renamed in data but the figure file name differs, mapping tables must resolve or fall back explicitly.
- **No video**: Any legacy or generated content that includes video URLs must be excluded from this corpus or stripped in validation before publish.
- **Out-of-pool generation**: If the model proposes a pose not in the approved pool, the product MUST reject or rewrite using an allowed substitute per documented safety/fallback rules before the user sees the session.
- **Secular corpus**: Authors and validators MUST ensure no MVP4 snippet introduces chakra systems, deities, scripture, or religious/spiritual doctrine; if the LLM adds such text outside the pool, validation MUST strip or rewrite before display.
- **Language**: All **pre-authored** corpus strings (cues, quotes, mindfulness lines) MUST be **English**; **Sanskrit transliteration** is allowed only as pose labels per Clarifications—no full non-English instructional paragraphs in MVP4.
- **Version skew**: Deployments MUST NOT mix **mapping** files from one **corpus version** with **routine JSON** from another; joint release (see FR-014) prevents routing errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST maintain a **curated library** of **pre-authored** routines stored under a **dedicated documentation data area** beneath `docs/` (exact folder name defined during planning), consumable by response logic without requiring live retrieval of movement video for those catalog rows.
- **FR-002**: Each catalog routine MUST be designed for approximately **ten minutes** total movement and guided rest, with **step-level durations** that sum to the stated window within an agreed tolerance (see Success Criteria).
- **FR-003**: Routines MUST be **classified** by **body region / muscle or wellness focus** (for example hips, spine, shoulders, full-body stress, core stability) so operators can maximize **combinatorial coverage** across focuses—aiming for as many distinct, valid combinations as practical without sacrificing quality or safety. Catalog tags MAY **extend** beyond existing intake enums where useful.
- **FR-011**: The product MUST maintain a **documented mapping** from **intake** body regions and related profile fields to **one or more** corpus focus tags (including many-to-one and one-to-many cases); the mapping MUST be reviewed when intake or catalog tags change.
- **FR-014**: **Joint release**: Each **MVP4 publication** MUST assign **one shared version identifier** to the **routine corpus**, the **intake→catalog mapping**, and the **published schema / operator readme** for that drop. **Independent release** of mapping-only versus routine-only artifacts is **out of scope** for MVP4; consumers MUST treat them as an atomic bundle.
- **FR-004**: For poses that correspond to figures in `docs/.trainingData`, the corpus MUST include **stable references** to **still** imagery (for example SVG or raster exports derived from that tree); the MVP4 scope **excludes** embedding or requiring **video** for these catalog entries.
- **FR-005**: Routine records MUST be stored in **structured, reviewable** form (for example JSON or equivalent documented interchange) alongside human-readable documentation of schema and versioning in the same feature area.
- **FR-006**: Each routine or its steps SHOULD incorporate **light-touch enrichment** from this **secular** set: **Sanskrit** pose names where helpful, **pranayama-style** or breath timing notes, brief **secular mindfulness** or present-moment prompts, and **short quotes** from famous teachers or thinkers—used sparingly to support confidence rather than overwhelm. **Chakra language, religious doctrine, and explicitly spiritual framing are out of scope** for the MVP4 corpus.
- **FR-012**: The corpus and any validation layer MUST **exclude** chakra-based instruction, religious or scriptural references, and other **explicitly spiritual** doctrinal content; breath and generic non-religious mindfulness language **are** permitted.
- **FR-007**: Quoted or attributed text MUST follow a **content policy**: public domain, licensed, or brief fair-use excerpts with **clear attribution** in the corpus metadata; no fabricated attributions. **Quote bodies MUST be written in English** in the MVP4 corpus.
- **FR-013**: All **authoritative** instructional and enrichment strings shipped in the MVP4 corpus (step cues, titles where stored, quotes, secular mindfulness lines) MUST be **English**; **Sanskrit** appears only as **transliterated pose names** paired with English common names where used. **Full-corpus localization** is explicitly **out of scope** for MVP4.
- **FR-008**: The corpus MUST remain aligned with the product’s **non-medical** positioning: no diagnostic claims, and enrichment text MUST NOT contradict safety or disclaimer messaging.
- **FR-009**: A **mapping** from logical pose identifiers used in routines to **training-data file paths** (or derived static exports) MUST be maintained and kept in sync when either routines or training figures change.
- **FR-010**: **Constrained generation**: User-visible routines MUST be **LLM-composed** for each session, but MUST **only** emit **pose IDs**, **step patterns**, **duration allocations**, and **enrichment snippets** drawn from **approved catalog definitions** in the MVP4 corpus (including pre-authored sequence fragments and body-focus pools). Inventing poses or timings outside those rules is disallowed except for **documented safety substitutions** or product-mandated restricted-path fallbacks.

### Key Entities

- **Curated routine** (and **approved pools**): Identifier, title, total target duration (~10 minutes), ordered steps with per-step duration and cues, primary/secondary body-focus tags, optional **secular** enrichment blocks (quote, Sanskrit, breath, secular mindfulness), references to still media—used as **canonical building blocks** the generator must select from rather than as the only possible serialized output.
- **Pose illustration reference**: Logical pose key, path or URI to a static asset under `docs/.trainingData` (or derivative), display label, optional Sanskrit transliteration.
- **Body-focus taxonomy**: Named categories used to index routines; tags MAY be **richer** than intake enums. **Intake-to-catalog mapping** (which intake combinations resolve to which tag sets) is a first-class artifact shipped with the corpus documentation under the **same version** as the routines (FR-014).
- **Corpus bundle**: A **single version string** (or equivalent) identifying one joint release of routines + mapping + documentation for that snapshot.
- **Enrichment snippet**: Short **English** text with type (quote, pranayama-style breath, secular mindfulness, Sanskrit transliteration-as-label), source/attribution metadata when applicable; **must not** carry spiritual-doctrine or chakra categorization in MVP4.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The library ships with **at least twelve** distinct 10-minute (±30 s) routines across **at least six** different **catalog** body-focus or wellness-focus categories (these categories MAY exceed intake cardinality; coverage of intake paths is via FR-011 mapping).
- **SC-002**: **At least 80%** of catalog steps that name a mappable pose include a **verified** still-image reference to an existing training asset or an **explicitly documented** approved fallback.
- **SC-003**: **Zero** MVP4 catalog routines require **video** as part of the stored corpus (audit: no video URLs or video MIME types in the canonical routine payloads for this scope).
- **SC-004**: **At least 90%** of published catalog routines include **two or more** distinct enrichment types from FR-006 (for example Sanskrit + breath, or quote + secular mindfulness prompt)—measured by automated or manual checklist review.
- **SC-008**: **Content audit** confirms **zero** MVP4 corpus snippets contain **chakra** terminology, **religious doctrine**, or other **explicitly spiritual** instructional framing defined in FR-012 (quotes may name traditions only if historically attributed and non-prescriptive—reviewer judgment per content policy).
- **SC-009**: **Language audit** confirms **100%** of MVP4 corpus instructional and quote strings (excluding Sanskrit transliteration fields) are **English**, per FR-013.
- **SC-005**: Content review confirms **100%** of quoted material in the corpus has acceptable attribution or licensing notes recorded in metadata.
- **SC-006**: Practitioners or internal reviewers can complete a **spot check** of five random routines in under **30 minutes** total and confirm each reads as coherent, safe for “general wellness” positioning, and time-accurate.
- **SC-007**: For sessions governed by MVP4 constraint rules, **100%** of emitted **pose identifiers** appear on the **approved corpus pool** list (or an explicitly documented safety substitution table); automated or manual audit can verify this per release.
- **SC-010**: Every **published** MVP4 drop lists **one** **corpus bundle version** (FR-014) and ships **mapping + routines** under that identifier together—verified by release checklist or CI rule.

## Assumptions

- Training figures under `docs/.trainingData` are **already cleared** for use within this product context; any third-party pack license is respected when copying or exporting assets.
- “Famous people” quotes are limited to **short** excerpts with attribution. **MVP4 enrichment is secular** (see FR-012): no chakra or religious teaching copy in the corpus; **breath and non-religious mindfulness** are acceptable wellness context, not dogma or medical advice.
- **LLM composition remains primary** for each session; the MVP4 corpus supplies **pools, patterns, durations, imagery mappings, and enrichments** that **constrain** what the model may output (see FR-010), not a separate “static-only” mode unless product owners add one later.
- Expanding “as many combinations as possible” is bounded by **manual or semi-automated authoring** quality; the numeric floors in Success Criteria are **minimums**, with stretch goals documented during planning.
- **MVP4 text is English-only** for instructions and quotes; multilingual UI or corpus localization is a **future** initiative unless product direction changes.
- Video enrichment remains governed by **MVP3** mechanisms where applicable; **MVP4** deliberately does not add video to the curated docs bundle.

## Dependencies

- Existing intake categories, safety evaluation, and disclaimer copy from prior MVPs.
- Availability of `docs/.trainingData` pose figure inventory and naming consistency.
- **Required**: **Joint** releases of **intake → catalog focus** mapping and routine corpus under **one bundle version** (FR-014, SC-010).
- Optional: alignment with `KNOWLEDGE_ENTRIES` pose identifiers where overlap is desired (planning may define mapping rules).

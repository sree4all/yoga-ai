# Feature Specification: MVP3 — Dynamic Routines, Reference Media, Mindfulness UI

**Feature Branch**: `003-mvp3-dynamic-media-ui`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "MVP3 requirements 1. Better temperature in response, more dynamic responses than repeated static responses 2. Integrate search in web and provide the accurate pose pictures (basic) and youtube video links for reference 3. Make UI colorful with some yoga related pictures and backdrops - mindfulness is the theme"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Varied, non-repetitive routines (Priority: P1)

A person completes the same intake selections on separate visits and receives routines that feel fresh: wording, emphasis, or sequencing details differ enough that sessions do not read as copy-paste duplicates, while remaining safe and appropriate for their selections.

**Why this priority**: The core product promise is personalized, supportive movement guidance. Repetition undermines trust and engagement; dynamic responses are the foundation for perceived quality.

**Independent Test**: Submit the same non-severe intake twice (or three times) and compare outputs for noticeable variation in instructions or structure without breaking safety rules. Delivers value even before media or visual polish ship.

**Acceptance Scenarios**:

1. **Given** a user with identical intake answers on two days, **when** they generate a routine each time, **then** the experience includes substantive variation in cues or narrative (not only a single word change), within the same safety profile.
2. **Given** operators tune how “creative” generation is allowed to be **via deployment configuration** (no end-user admin UI), **when** they adjust that control, **then** subsequent generations reflect a perceptible shift in variety versus a baseline, without exposing unsafe content.

---

### User Story 2 - Pose images and reference videos from the web (Priority: P2)

During a routine, the user sees basic, accurate-looking still images for poses where available, and can follow links to short reference videos (for example on a major public video site) to clarify alignment. Results come from integrated search or lookup so the user does not manually hunt the web.

**Why this priority**: Visual and video references reduce misinterpretation of pose names and improve confidence; this directly supports correct, gentle practice.

**Independent Test**: Complete a routine that includes named poses and verify images and optional video links appear and resolve; can ship with static variety (P1) still using placeholders if media fails.

**Acceptance Scenarios**:

1. **Given** a routine step that names a standard pose, **when** the user views that step, **then** they see a still image that plausibly matches the pose name, or a clear fallback when no suitable result exists.
2. **Given** a step includes an instructional video link, **when** the user selects it, **then** they reach a relevant public video page in a new context without leaving the app confused about source.
3. **Given** search returns no trustworthy match, **when** the step renders, **then** the user sees an explicit fallback (text or icon), not a broken image or misleading picture.
4. **Given** reference media is shown, **when** the user reads the step, **then** a short **wellness / educational** line appears near images or links so media is not framed as medical advice (consistent with the routine disclaimer).

---

### User Story 3 - Mindfulness-themed, colorful experience (Priority: P3)

The app feels calm and intentional: a cohesive mindfulness theme with thoughtful color, yoga-related imagery, and backdrops that support focus rather than distraction. The experience remains readable and inclusive.

**Why this priority**: Emotional tone and visual coherence differentiate the product and reinforce the wellness positioning after functional needs are met.

**Independent Test**: Walk through intake and routine flows and confirm themed backgrounds, imagery, and color accents on primary screens; can be evaluated without changing generation or media logic.

**Acceptance Scenarios**:

1. **Given** a user opens the main flows, **when** they move through intake and session views, **then** visual treatment (palette, imagery, backdrops) consistently expresses a mindfulness-oriented, yoga-aligned mood.
2. **Given** decorative imagery is present, **when** users rely on assistive technology or high zoom, **then** essential text and controls remain legible and operable per existing accessibility expectations for the product.
3. **Given** large decorative motion exists, **when** the user has reduced motion enabled, **then** non-essential motion is toned down without hiding essential controls.

---

### Edge Cases

- Generation is tuned for variety but must never override medical/safety messaging for severe or disallowed cases; those paths remain deterministic or restricted as today.
- Search or image providers rate-limit, timeout, or return irrelevant results: user sees safe fallbacks; the system **may retry once** on transient upstream errors before falling back, and may offer an optional **retry** control for a failed image load when feasible—not silent wrong media.
- Video links may be region-blocked or removed: user sees a clear message and can continue with text and stills.
- Very slow networks: images and links load progressively; layout does not jump in a way that traps focus or breaks reading order; loading states do not trap keyboard focus.
- Dark mode or system contrast settings: foreground content on **panels** stays within agreed contrast targets; full dark-theme polish may be phased if timeboxed, but text and primary actions remain usable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST produce generated routines that exhibit meaningful variation across repeated similar requests (non-severe, allowed profiles), so users do not routinely receive near-identical wording or structure when starting new sessions.
- **FR-002**: The system MUST expose an operator-tunable control for how much variety the generation layer applies (“creative latitude”), **via deployment configuration** (e.g. environment variables such as sampling temperature and model selection), without requiring end users to manage low-level technical parameters or a separate admin application in MVP3.
- **FR-003**: For routine steps that reference named poses, the system MUST attempt to attach at least one representative still image per step when a trustworthy match can be obtained via integrated search or lookup.
- **FR-004**: The system MUST surface at least one optional reference video link **per step that names a pose** (or equivalent step identity), where instructional video improves clarity, using stable links to public video pages and clear labeling; if no suitable video is found, the step still shows text and still-image fallback per FR-009.
- **FR-005**: The system MUST integrate web-based discovery (search or equivalent) for pose imagery and video references, with basic accuracy: images and titles must correspond to the pose or topic named on the step, or be withheld in favor of a fallback.
- **FR-006**: The system MUST show attribution or source indication where required by content policies; MUST NOT present media as medical advice; and MUST include **brief wellness / educational** copy adjacent to third-party images or video links so their purpose is instructional, not diagnostic (aligned with the product disclaimer).
- **FR-007**: The user interface MUST apply a mindfulness-oriented visual theme: harmonious color accents, yoga-related imagery, and backdrop treatments on primary journeys (intake, session, results).
- **FR-008**: The system MUST preserve accessibility expectations for the product (e.g., sufficient contrast, focus visibility, non-reliance on color alone for critical state, consideration of **reduced-motion** preferences for decorative effects) when introducing new visuals.
- **FR-009**: When media cannot be loaded or found, the system MUST degrade gracefully with explicit messaging and continued access to text instructions.

### Key Entities

- **Routine step (presentation)**: Step identity, human-readable instructions, optional pose label, optional still image reference, optional video link reference, loading and error state for media.
- **Reference media bundle**: Candidate image URL and caption, candidate video URL and title, provenance for display, freshness or cache hints for operational use.
- **Visual theme tokens**: Conceptual grouping of background styles, accent colors, and imagery motifs applied consistently across screens.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In structured acceptance testing, at least two out of three back-to-back routine generations for the same non-severe intake show clearly distinguishable differences in cue text or step emphasis (reviewer checklist), while safety rules remain satisfied.
- **SC-002**: For steps where pose imagery is expected, at least 90% of sampled steps in test runs show a plausible matching still image or an intentional, labeled fallback—not a blank broken frame.
- **SC-003**: For steps that expose a video link, at least 95% of sampled links resolve to a relevant public video page under normal network conditions.
- **SC-004**: In a short usability or design review session (minimum five participants or three expert reviewers), at least 80% report that the updated interface feels “calm,” “mindful,” or “on-theme” for yoga wellness, without blocking task completion.
- **SC-005**: **Automated checks (e.g. lint/a11y plugins) plus a manual spot-check** (keyboard navigation, visible focus, ~200% zoom, contrast on primary actions over new backdrops) on updated primary screens report **no new critical violations** against the product’s stated accessibility standard.

## Assumptions

- Users have network access for search-backed media; offline-only use is out of scope for full media features.
- “Basic” image accuracy means representative stock or search results aligned to pose names, not clinical precision or individualized anatomy.
- Video references rely on publicly available pages; login-gated or paid-only platforms are out of scope for MVP3.
- Existing intake, safety gating, and severe-intensity handling from prior releases remain unchanged unless explicitly extended.
- Licensed or copyrighted training materials uploaded by the operator are not required to power search; discovery uses permitted web sources or vendor APIs chosen during planning.
- English-only copy and labeling remain in scope unless a future release specifies otherwise.
- Operator-facing documentation for MVP3 references repository **`.env.example`** for creative latitude (e.g. temperature, model) and optional media API keys (`YOUTUBE_DATA_API_KEY`, optional media timeout placeholders), consistent with [tasks.md](./tasks.md) T001.

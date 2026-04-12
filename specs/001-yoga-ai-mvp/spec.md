# Feature Specification: Yoga.ai MVP — Guided Yoga Routine Intake

**Feature Branch**: `001-yoga-ai-mvp`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "Minimal MVP web app (Yoga.ai) with chat-guided intake for a safe ~10-minute yoga routine; budget cap; medical disclaimer; YTT200-level Hatha/Vinyasa knowledge only; no database/auth/payments; structured intake, safety rules, static knowledge base, orchestrated text generation."

## Clarifications

### Session 2026-04-12

- Q: When text-generation orchestration fails or times out, what should the user experience be? → A: Option A — Inform the user that personalized guidance is temporarily unavailable; present static breathing and/or resting instructions taken only from the knowledge module (no model call required for that fallback copy); offer an explicit retry to obtain a full personalized routine.
- Q: How must the medical disclaimer be acknowledged before intake? → A: Option B — The user must complete an explicit acknowledgment (e.g., checkbox and/or an “I understand” control) before they can continue into intake.
- Q: May users enter free text during intake, or only structured choices? → A: Option B — Structured steps for type, region, and intensity, plus **one optional** free-text field (e.g., “Anything else we should know?”); that text is scanned deterministically for curated high-risk terms before any movement content.
- Q: What languages does the MVP support? → A: Option A — **English only** for all user-visible copy; no language selector in the MVP.
- Q: What accessibility standard should core screens meet? → A: Option B (recommended) — **WCAG 2.1 Level AA** for the disclaimer, intake, routine (or safety-limited) results, and orchestration-fallback views.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete intake and receive a personalized routine (Priority: P1)

A person opens the app, sees the medical disclaimer, completes a short guided conversation about where they feel discomfort, what type it is, and how intense it feels, and then receives a supportive, non-medical ~10-minute yoga routine tailored to that input when their answers indicate it is appropriate to do so.

**Why this priority**: This is the core product promise: guided intake leading to a usable routine without accounts or payment friction.

**Independent Test**: Run through a “typical safe” path (e.g., mild stress or mild neck tension) end-to-end and verify the routine length, tone, and alignment with the approved static sequences for that profile.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they begin a session, **Then** they see a clear disclaimer that the app is not a substitute for professional medical advice and **must** complete an explicit acknowledgment (e.g., checkbox and/or “I understand”) before any intake questions appear.
2. **Given** a user on a supported mobile or desktop browser, **When** they complete all intake steps with answers that pass safety checks, **Then** they receive a structured routine intended to fill approximately ten minutes of practice and phrased as wellness support, not diagnosis or treatment.
3. **Given** completed intake, **When** the routine is shown, **Then** suggested movements and sequencing respect the static knowledge base for the identified discomfort profile (including poses to avoid for that profile).
4. **Given** intake answers that pass safety checks, **When** the orchestration layer fails or times out before a personalized routine is delivered, **Then** the user sees a clear notice that personalization is unavailable, receives static breathing and/or resting guidance sourced only from the knowledge module, and can retry to obtain a full personalized routine.

---

### User Story 2 - Safety escalation: severe discomfort or high-risk signals (Priority: P2)

A user reports strong pain or mentions high-risk situations. The experience prioritizes safety: they receive only gentle breathing or resting guidance and do not receive a full pose sequence generated for musculoskeletal “fixes.”

**Why this priority**: Prevents harmful guidance and matches the product’s safety-first positioning.

**Independent Test**: Exercise inputs that should trigger the safety path (including the highest intensity selection and representative high-risk terms) and confirm the response is limited to breathing/resting content and does not present a full routine as if it were appropriate.

**Acceptance Scenarios**:

1. **Given** intake answers indicating the highest severity tier (or equivalent), **When** the user requests a routine, **Then** the product responds with breathing and/or resting guidance only, with an encouragement to seek professional care when appropriate.
2. **Given** structured answers **or** text in the optional intake note field that matches the curated high-risk condition list (e.g., terms such as hernia, fracture, or chronic conditions as defined in the safety rules), **When** the user would otherwise receive personalized movement content, **Then** the safety path applies before any movement-oriented personalization is offered.
3. **Given** the safety path is active, **When** content is presented, **Then** it remains supportive, non-diagnostic, and consistent with the knowledge base’s conservative stance for those cases.

---

### User Story 3 - Trust, clarity, and knowledge fidelity (Priority: P3)

Users and stakeholders can trust that content is grounded in beginner–intermediate teacher-training-level Hatha and Vinyasa material, not ad-hoc improvisation, and that operating costs stay within the stated monthly budget for a small MVP.

**Why this priority**: Protects brand trust and keeps the pilot financially viable.

**Independent Test**: Review routine outputs against the static module for sample profiles; track monthly usage against the budget target using agreed operational definitions.

**Acceptance Scenarios**:

1. **Given** a routine for a profile covered by the knowledge base, **When** an auditor compares output to the static sequences and “poses to avoid,” **Then** there are no contradictions (no recommended pose that the module says to avoid for that profile).
2. **Given** the MVP is operated as designed, **When** monthly infrastructure and third-party text-generation usage are tallied, **Then** total cost remains under twenty U.S. dollars per month under expected pilot volume (see assumptions for volume definition).

---

### Edge Cases

- User attempts to skip the disclaimer: intake content is not available until the explicit acknowledgment required by FR-001 is completed (per session).
- User abandons intake mid-flow: they can start over without needing an account; partial answers do not produce a routine.
- Ambiguous or conflicting answers: the intake asks for clarification or applies the more conservative interpretation before any movement content.
- Optional free-text left blank: safety evaluation uses structured answers only; no penalty or extra prompts solely for skipping the optional field.
- Browser or device language is not English: the product still presents **English** copy only (no locale switching in MVP).
- User repeats sessions: each session is independent; no reliance on stored history in the MVP.
- Elevated demand in a single month: cost controls (rate limits, concise prompts, model choice managed in planning) prevent routine breach of the monthly budget under defined pilot assumptions.
- Text-generation orchestration unavailable or times out after the user is on the safe path: the user is informed that personalized guidance is temporarily unavailable, sees static breathing/rest content from the knowledge module (no model required for that fallback), and can retry for a full personalized routine.
- User relies on keyboard or assistive technology: disclaimer acknowledgment, intake controls, and primary actions remain reachable and operable per FR-012.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST display a prominent medical disclaimer stating that guidance is not a replacement for professional medical advice each session, and MUST require an explicit user acknowledgment (e.g., checkbox and/or an “I understand” action) before presenting intake questions or other substantive interaction.
- **FR-002**: The product MUST collect structured intake data across multiple steps covering discomfort type, body region or location, and intensity using clear, plain-language prompts suitable for mobile screens. The product MUST also offer **one optional** free-text field (e.g., “Anything else we should know?”) that users may skip; when provided, its content is included in the intake session for safety evaluation only (not for long-term storage).
- **FR-003**: The product MUST evaluate deterministic safety rules on the structured intake results **and** on any optional free-text from FR-002 using the same curated high-risk term list (deterministic matching, not free-form model inference) before presenting any personalized movement routine. When rules indicate severe intensity or a high-risk profile per the curated list—including a match in optional text—the product MUST NOT present a full personalized asana sequence intended to address the complaint; it MUST limit guidance to breathing and/or resting practices only.
- **FR-004**: The product MUST maintain a static knowledge module grounded in beginner–intermediate (YTT200-level) Hatha and Vinyasa scope, including sequences and explicit “poses to avoid” for supported discomfort profiles (e.g., neck-focused tension, stress).
- **FR-005**: For users who pass safety checks, the product MUST assemble the final user-facing routine by combining validated intake conclusions with the applicable knowledge module content so that sequencing and contraindications remain faithful to that module.
- **FR-006**: The product MUST produce approximately ten minutes of practice content for the “safe path,” expressed in a way users can follow step by step (timing or pacing cues as appropriate), without claiming medical outcomes.
- **FR-007**: The MVP MUST NOT require user accounts, persistent profiles, payments, or a server-side database for storing end-user data.
- **FR-008**: All machine-generated wording for routines MUST go through the organization’s approved unified text-generation orchestration layer so that structured outputs are obtained consistently without duplicating orchestration logic in the app.
- **FR-009**: Total monthly operating cost for infrastructure and metered text-generation usage MUST remain below twenty U.S. dollars under the pilot usage assumptions stated in this document.
- **FR-010**: When the orchestration layer errors or exceeds the agreed response-time threshold after safety checks have passed, the product MUST explain that personalized guidance is temporarily unavailable, MUST present static breathing and/or resting instructions drawn only from the knowledge module for that fallback (no model call required to render that fallback copy), and MUST provide a clear retry path to obtain a full personalized routine once generation succeeds.
- **FR-011**: All fixed user-visible copy in the MVP (disclaimer, intake prompts, buttons, errors, static knowledge-module text) MUST be written in **English**; the product MUST NOT offer a language or locale selector.
- **FR-012**: Screens that present the medical disclaimer, structured intake (including the optional note field), the final routine or safety-limited guidance, and orchestration-fallback content MUST meet **WCAG 2.1 Level AA** success criteria applicable to those views (including sufficient contrast for text and controls, visible focus for interactive elements, and accessible names for controls and inputs).

### Key Entities

- **Intake session**: A single conversational flow beginning only after explicit disclaimer acknowledgment (see FR-001) through the last intake question; holds structured answers and any optional note text until a routine or safety response is produced (no long-term storage required).
- **Discomfort profile**: A normalized description derived from intake (e.g., region, category, severity tier) used to select knowledge module entries.
- **Safety evaluation**: Outcome of rule-based checks on structured fields and optional note text (pass vs. restricted path) including which triggers fired (severity tier, curated term matches).
- **Knowledge entry**: Static package of sequences, pacing notes, and contraindications for a supported profile, maintained as the authoritative movement reference.
- **Routine presentation**: User-visible steps and cues shown after safety approval, constrained by the selected knowledge entry.
- **Generation fallback**: The user-visible outcome when orchestration fails or times out on the safe path: static knowledge-module breathing/rest copy plus retry affordance, as specified in FR-010.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can move from landing through intake to a final response (routine or safety-limited guidance) in under fifteen minutes on a typical mobile connection.
- **SC-002**: For a defined test suite covering approved safe profiles, one hundred percent of cases receive routines whose movements align with the corresponding knowledge entry and omit every “pose to avoid” listed for that entry.
- **SC-003**: For a defined test suite covering severe intensity and each high-risk trigger category, one hundred percent of cases receive only breathing/resting guidance with no conflicting movement recommendations.
- **SC-004**: In pilot operation, combined monthly infrastructure and text-generation charges stay below twenty U.S. dollars when usage stays within the assumed monthly active session cap documented in assumptions.
- **SC-005**: At least ninety percent of pilot users who complete intake report that the disclaimer was easy to notice **and** that the acknowledgment step was clear (e.g., via a lightweight in-product survey or usability test script).
- **SC-006**: In scripted tests that simulate orchestration failure or timeout on the safe path after intake, one hundred percent of runs show the unavailable-personalization notice, present only knowledge-module breathing/rest content during the fallback, and expose a retry that can lead to a full personalized routine when generation succeeds.
- **SC-007**: A content review of the MVP confirms that **one hundred percent** of non-user-authored, product-controlled strings (UI chrome, disclaimer, static knowledge-module strings surfaced to the user) are in English, with **no** alternate-language option presented.
- **SC-008**: An accessibility review of the disclaimer, intake, routine or safety-limited result, and fallback paths concludes there are **no unresolved WCAG 2.1 Level AA** failures on those views for the MVP’s supported browsers (review may combine automated checks and targeted manual verification).

## Assumptions

- “YTT200-level” is interpreted as foundational teacher-training breadth for Hatha and Vinyasa; advanced therapeutics, props-heavy therapy, or styles outside Hatha/Vinyasa are out of scope for this MVP’s knowledge module.
- Pilot volume is modest (on the order of hundreds of completed sessions per month, not tens of thousands); if adoption exceeds this, the budget target may require revisiting outside this specification.
- The unified text-generation orchestration layer is already available to the project and supports structured outputs suitable for routine steps; credentials and model choices are managed outside this document.
- Intensity is captured as a small fixed set of ordered levels (e.g., mild, moderate, severe); the highest level always invokes the safety-limited path regardless of other answers.
- The high-risk term list is curated and versioned with product and safety review; new terms can be added without changing the overall flow described here.
- Optional intake note text is evaluated only via deterministic matching against that curated list (and severity rules on structured fields); semantic interpretation or open-ended medical inference from free text is out of scope for this MVP.
- The MVP targets English-reading users; machine-generated routine wording MUST be requested and validated in English to satisfy FR-011 and user comprehension.
- WCAG 2.1 Level AA is interpreted using the W3C guidance for web content; machine-generated text is included in contrast and readability checks where it is displayed as part of the routine or fallback experience.

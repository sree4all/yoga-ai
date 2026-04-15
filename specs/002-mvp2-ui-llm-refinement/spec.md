# Feature Specification: MVP2 Refined Recommendations Experience

**Feature Branch**: `002-mvp2-ui-llm-refinement`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "Refine the MVP2 of the app with technical and UI enhancements: multi-select symptoms with state reflecting multiple choices; recommendation content highly specific to selected body areas and symptom combinations, with non-repetitive, context-specific guidance; dynamic suggestions for yoga style categories (e.g., Hatha, Vinyasa, Yin) matched to user input; upgraded results presentation with placeholders for video references and pose imagery per suggestion; clean, calming visual style and intuitive flow between selection and results."

## Clarifications

### Session 2026-04-13

- Q: Should body-area input be single or multiple per session? → A: **Multiple** body areas are selectable; they form a **set** that is evaluated **together** with the symptom set (Option B).
- Q: How should symptom and body-area inputs be handled with respect to **retention** after use? → A: **Ephemeral** (Option A): do **not** retain raw symptom or body-area text after recommendations have been produced and shown; only **transient processing** to generate and display results is allowed.
- Q: What **accessibility conformance** should apply to selection and results? → A: **WCAG 2.1 Level AA** (Option B).
- Q: How quickly should **complete** recommendations appear after submit for **typical** sessions? → A: Within **30 seconds** under **normal product conditions** (Option B); if not met due to degradation, the product MUST show **clear progress or delay** and preserve **in-session** selections.
- Q: What **language** scope applies to the interface and generated recommendations for MVP2? → A: **English only** for **both** UI and generated content (recommended Option A).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-symptom selection and combined context (Priority: P1)

A person chooses one or more symptoms together with relevant body areas, then receives guidance that clearly reflects that **combined** picture—not just a single symptom in isolation.

**Why this priority**: Multi-symptom input is the foundation for accurate, trustworthy recommendations; without it, the rest of the experience cannot deliver differentiated value.

**Independent Test**: Can be validated by selecting multiple symptoms and body areas, requesting recommendations, and confirming that the guidance references the full selection in a coherent way.

**Acceptance Scenarios**:

1. **Given** the user is on symptom selection, **When** they select more than one symptom, **Then** all selected symptoms remain visible and are carried forward as a single combined input for recommendations.
2. **Given** the user is on body-area selection, **When** they select more than one body area, **Then** all selected body areas remain visible and are carried forward as a single combined input alongside the symptom set.
3. **Given** the user has selected body areas and multiple symptoms, **When** they proceed to recommendations, **Then** the guidance addresses the relationship between those areas and symptoms where clinically appropriate for a wellness app (non-diagnostic framing).

---

### User Story 2 - Non-repetitive, context-specific guidance (Priority: P1)

A person who changes body areas or symptom combinations sees **meaningfully different** recommendation text and pose suggestions, not the same generic copy repeated across inputs.

**Why this priority**: Repetitive outputs undermine trust and make the product feel like a static template rather than personalized support.

**Independent Test**: Can be validated by running several sessions with different body-area and symptom combinations and comparing that outputs differ in substance, not only in minor wording.

**Acceptance Scenarios**:

1. **Given** two distinct combinations of body areas and symptoms, **When** the user requests recommendations for each, **Then** the two outputs are not duplicates and each ties guidance to its specific combination.
2. **Given** the same user repeats a session with identical inputs, **When** they request recommendations again, **Then** the experience may allow natural variation in phrasing but must remain consistent with the same combination (no contradictory advice).

---

### User Story 3 - Yoga style guidance matched to needs (Priority: P2)

A person sees which broad yoga **style** (e.g., restorative/slow-paced vs flowing/energizing) fits their stated needs, with a short rationale linked to their symptoms (e.g., stiffness vs low energy).

**Why this priority**: Style guidance helps users choose a practice intensity and rhythm that matches how they feel, improving usefulness without requiring deep yoga knowledge.

**Independent Test**: Can be validated by inputs that map to clearly different needs (e.g., stiffness vs fatigue) and confirming the suggested style category and rationale align with those needs.

**Acceptance Scenarios**:

1. **Given** symptoms suggesting stiffness or limited mobility, **When** recommendations are shown, **Then** the product suggests a style and explanation appropriate to gentle or sustained, joint-friendly practice where applicable.
2. **Given** symptoms suggesting low energy or need for invigoration, **When** recommendations are shown, **Then** the product suggests a style and explanation appropriate to a more dynamic practice where applicable.

---

### User Story 4 - Richer results layout and media placeholders (Priority: P2)

A person reviewing recommended poses sees a clear, calm layout. For each pose, they see a dedicated area for a **video reference** (placeholder or labeled slot) and a **visual** for the pose (placeholder image or equivalent), so they know where external media will appear when available.

**Why this priority**: Structured presentation of video and imagery reduces confusion and sets expectations for follow-up learning.

**Independent Test**: Can be validated by inspecting the results view for each listed pose and confirming both video and visual placeholders are present and labeled.

**Acceptance Scenarios**:

1. **Given** the user has received pose recommendations, **When** they view the results, **Then** each pose includes a clearly indicated place for video guidance and a visual representation.
2. **Given** the user is on the results view, **When** they scan the screen, **Then** typography, spacing, and hierarchy make the primary actions and content easy to find without clutter.

---

### User Story 5 - Calm aesthetic and navigation between selection and results (Priority: P3)

A person moves between choosing symptoms/body areas and reading recommendations using obvious navigation, with a visual tone that feels **calm and unhurried**.

**Why this priority**: Emotional fit matters for a wellness product; navigation clarity reduces drop-off after recommendations.

**Independent Test**: Can be validated by a first-time user completing selection, viewing results, and returning to adjust inputs without external help.

**Acceptance Scenarios**:

1. **Given** the user is viewing recommendations, **When** they want to change symptoms or body areas, **Then** they can reach the selection experience through a clear, consistent control (e.g., back or edit path).
2. **Given** the user moves between selection and results repeatedly, **When** they use the product, **Then** transitions remain predictable and the interface avoids harsh or distracting visual patterns.

---

### Edge Cases

- User selects no symptoms or clears all selections before continuing: the product prevents ambiguous submission or prompts the user to choose at least one symptom (or equivalent minimum), consistent with existing MVP rules.
- User selects no body areas or clears all body-area selections before continuing: when a body-area selection is required to proceed, the product prevents ambiguous submission or prompts the user to choose at least one body area, consistent with the same minimum-input pattern as for symptoms.
- User selects many symptoms at once: the combined input is still represented clearly; guidance acknowledges multiple concerns without becoming unreadable.
- User selects many body areas at once: the combined body-area set remains represented clearly; recommendations reflect the full set together with the symptom set.
- User selects only body areas or only symptoms where the product expects both: behavior matches a defined minimum input rule (see Assumptions).
- Recommendation generation is temporarily unavailable: the user sees a clear, non-technical message and a path to retry; selections may be retried **without re-entry** only while they still exist in the **current session** (the ephemeral policy does **not** require server-side recovery of raw inputs).
- Recommendation generation **runs longer than 30 seconds** (e.g., degraded network or heavy load): the user sees **clear ongoing status** (not a silent wait), and **in-session** selections remain available per **FR-002**.
- Video or image assets are not yet populated: placeholders remain understandable and do not look like broken layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST allow users to select **multiple symptoms** in one flow **and multiple body areas** in one flow; **both** the active symptom selection and the active body-area selection MUST be treated as **sets** that are evaluated **together** when forming recommendations.
- **FR-002**: The product MUST preserve the user’s symptom selections and body-area selections as they move between selection and results **within the same session**, except when the user explicitly resets or clears them (this in-session behavior does **not** override **FR-009**).
- **FR-003**: Recommendation content MUST be **specific** to the **set** of selected body areas **and** the **combination** of symptoms, not generic text that ignores either dimension.
- **FR-004**: Recommendation content MUST **not** present the same substantive guidance for materially different body-area and symptom combinations (i.e., outputs MUST vary meaningfully with input).
- **FR-005**: The product MUST surface **yoga style** guidance (using commonly recognized categories such as Hatha, Vinyasa, Yin, and related labels) chosen to **match** the user’s described symptoms and energy or mobility needs, with a brief rationale the user can understand.
- **FR-006**: For **each** recommended pose on the results view, the product MUST show a **labeled placeholder or slot** for an external **video reference** and a **visual** representation of the pose (image placeholder or equivalent), so users understand what will appear there when content is available.
- **FR-007**: The **selection** and **results** experiences MUST conform to **WCAG 2.1 Level AA**. **Both** MUST use a **clean, calming** visual presentation appropriate to wellness use (clear hierarchy, generous spacing, restrained palette).
- **FR-008**: The product MUST provide **intuitive navigation** between the selection experience and the results experience (clear way to go forward and a clear way to return or edit inputs).
- **FR-009**: The product MUST treat raw symptom text and raw body-area selections as **ephemeral**: it MUST **not persist** them after recommendations for that session have been **produced and shown**, except for **transient processing** required to generate and display the response (no long-term storage of raw inputs for history, profiling, or analytics).
- **FR-010**: Under **normal product conditions**, for **typical** sessions, **complete** recommendations MUST be available within **30 seconds** of the user submitting inputs for generation. When the product cannot meet this bound (e.g., degraded connectivity or heavy load), it MUST communicate **progress or delay** clearly and MUST preserve **in-session** selections.
- **FR-011**: For MVP2, **all** user-visible **interface copy** and **generated** recommendation text for this feature MUST be in **English** (see Assumptions for localization scope).

### Key Entities

- **Symptom selection**: One or more user-chosen symptoms forming the current session’s symptom set.
- **Body-area context**: One or more anatomical or regional foci the user associates with their concern, forming a **set** that is combined with the symptom set for interpretation.
- **Recommendation session**: A single pass from confirmed inputs through generated guidance and pose list.
- **Yoga style suggestion**: A named style category plus short rationale tied to the user’s inputs.
- **Pose recommendation**: A suggested pose with associated explanatory text and slots for video reference and visual depiction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In usability tests, at least **90%** of participants successfully select **two or more** symptoms and proceed to results without abandoning the flow due to confusion about multi-select.
- **SC-002**: In structured content review, for **at least five** distinct input pairs differing in **body-area set** or symptom combination, reviewers rate outputs as **clearly non-duplicate** in substance (not merely reordered sentences) in **at least 80%** of pairwise comparisons.
- **SC-003**: In usability tests, at least **85%** of participants correctly identify where **video** and **pose visuals** will appear for each recommended pose on first exposure to the results screen.
- **SC-004**: In usability tests, at least **90%** of participants return from results to adjust selections within **two** obvious navigation actions or fewer.
- **SC-005**: In a short post-task survey, at least **75%** of participants describe the interface as **calm** or **easy to follow** when moving between selection and results.
- **SC-006**: In a **privacy or product review** against **FR-009**, reviewers find **no** requirement or design intent to **persist** raw symptom or body-area text after recommendations are shown (beyond transient handling).
- **SC-007**: The **selection** and **results** flows **pass** **WCAG 2.1 Level AA** verification using the project’s accessibility checklist (or equivalent process), with **no** unresolved **critical** accessibility defects at release.
- **SC-008**: In structured timing tests under **normal product conditions**, **at least 90%** of **typical** recommendation runs complete within **30 seconds** from user submit until **complete** results are usable on screen.
- **SC-009**: In **copy or product review**, the selection and results flows contain **no** non-English **user-facing** strings required to complete the journey, and **generated** recommendations are **English** for MVP2 (aligned with **FR-011**).

## Assumptions

- MVP2 builds on existing MVP capabilities for body-area and symptom capture; this specification **extends** behavior rather than replacing unrelated product areas.
- **Language**: MVP2 ships **English-only** **interface** and **generated** recommendation text for this feature (**FR-011**). **Localization** (translated UI or generated content) is **out of scope** for this specification unless added by a later initiative.
- **Accessibility**: The selection and results experiences target **WCAG 2.1 Level AA** (see **FR-007**, **SC-007**).
- **Responsiveness**: **Typical** sessions target **30-second** completion for recommendations under **normal product conditions** (see **FR-010**, **SC-008**); extreme network or service outages are out of scope except for clear messaging and retry per Edge Cases.
- A **minimum input** rule applies: users provide at least one symptom; when body areas are required to proceed, users provide at least one body area. **Body-area selection is multi-select**, and the chosen areas form a **set** used with the symptom set.
- **Privacy posture**: Raw symptom and body-area inputs are **ephemeral**—they are **not** retained after recommendations are shown (see **FR-009**). Features such as **saved history** or **cross-session recall** of raw inputs are **out of scope** unless introduced later with explicit user consent.
- **Placeholder** video links and images are acceptable for this release; hosting real video catalogs or licensed imagery may be out of scope if not already available.
- Yoga style names follow **widely understood** public categories; detailed lineage or teacher-specific branding is out of scope.
- Content remains **wellness and educational** in nature and does not replace professional medical diagnosis or treatment.

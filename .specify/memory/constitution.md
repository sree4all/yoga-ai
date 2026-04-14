# yoga-ai Project Constitution

**Version**: 1.0  
**Last updated**: 2026-04-13  
**Scope**: Repository-wide; complements feature specs and `.cursor/rules/`.

## Principles (normative)

### P1 — TypeScript and runtime

- **MUST** use TypeScript on **Node.js 20+** for application code.
- **MUST** use the **Next.js App Router** layout as defined in this repo (`src/app/`).

### P2 — Contracts and validation

- **MUST** validate external API boundaries (e.g. `POST` bodies and response shapes) with **Zod** and keep JSON Schemas in `specs/*/contracts/` or equivalent in sync with Zod where a feature defines both.
- **MUST NOT** expose unvalidated model output to clients without schema validation.

### P3 — Generation and secrets

- **MUST** run LLM / orchestration calls **server-side only** (e.g. Route Handlers, server modules). Client bundles **MUST NOT** embed API keys or orchestrator secrets.
- **SHOULD** support deterministic fallback when generation is unavailable (existing mock path).

### P4 — Health-adjacent data (privacy)

- **MUST NOT** persist raw user intake fields (symptoms, body regions, free-text notes) to durable storage **after** recommendations are returned for that session, unless a future feature adds explicit consent and scope (see product spec **FR-009**).
- **MUST NOT** log full request JSON bodies containing raw intake to production logs, analytics, or error reporters. **MAY** log redacted metadata (e.g. status codes, latency, error class).

### P5 — Accessibility and language

- **MUST** meet **WCAG 2.1 Level AA** for primary user-facing flows that ship in a release when the feature spec requires it.
- **MUST** ship **English-only** UI and generated instructional text for features that declare English-only scope (**FR-011**), until localization is explicitly in scope.

### P6 — Wellness positioning

- **MUST** present movement guidance as **wellness / educational**, not medical diagnosis or treatment; disclaimers and safety paths **MUST** remain when spec requires them.

## Governance

- Feature specs **MAY** add requirements; they **MUST NOT** weaken these MUST rules without a constitution amendment (version bump and date).
- **`/speckit.plan`** and related workflows **SHOULD** verify this document’s gates when present.

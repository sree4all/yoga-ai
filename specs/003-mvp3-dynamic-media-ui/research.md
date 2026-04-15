# Research: MVP3 — Dynamic Routines, Reference Media, Mindfulness UI

**Branch**: `003-mvp3-dynamic-media-ui` | **Spec**: [spec.md](./spec.md)

## R1 — Operator “creative latitude” (FR-002)

**Decision**: Tune variety **only via deployment / environment configuration** (no in-app admin UI in MVP3).

**Rationale**: Matches small-team operations, avoids new authentication and admin surface area, and aligns with existing patterns (`ROUTINE_GEN_TEMPERATURE`, model selection via env). “Operators” are deployers or SREs; end users never see tuning controls.

**Alternatives considered**: In-app admin panel (rejected for MVP3 scope); hybrid env + admin override (deferred until a staffed ops role needs it).

---

## R2 — Meaningful variation vs repetition (FR-001, SC-001)

**Decision**: Combine (1) **sampling temperature** from env (already `ROUTINE_GEN_TEMPERATURE`), (2) **prompt instructions** that explicitly ask for varied cue wording and ordering emphasis when the profile matches prior sessions, and (3) an optional **per-request nonce** (server-generated, not persisted) included in the generation prompt to reduce identical completions, without changing safety rules.

**Rationale**: Temperature alone often produces similar structure; prompt-level diversity plus a nonce is a low-cost lever. Severe/restricted paths remain deterministic.

**Alternatives considered**: Client-sent random seed (rejected — could be abused; server generates nonce); fine-tuned model (out of scope).

---

## R3 — Pose still images (FR-003, FR-005, FR-006)

**Decision**: After the model returns `poseId` / instruction, the **server enriches** each step by resolving a still image via **Wikimedia Commons** (`action=query`, `generator=search` or direct title search) preferring **CC-licensed** thumbnails; attach a short **attribution line** (title + license hint) for display. If no acceptable result within timeout, use a **static local placeholder** and explicit “image unavailable” copy (SC-002).

**Rationale**: No paid Google CSE quota required for baseline; licensing and attribution are tractable; images are fetched server-side so URLs can be validated before the client sees them.

**Alternatives considered**: Google Custom Search JSON API (cost + API setup); generic web scraping (rejected — brittle, policy risk); Unsplash keyword search (poor pose-name alignment).

---

## R4 — YouTube reference links (FR-004)

**Decision**: Use **YouTube Data API v3** `search.list` (server-only key) with query shaped from `poseId` + “yoga tutorial” (English), take the **first reasonable** result with embeddable public `videoId`, expose `https://www.youtube.com/watch?v={id}` (or `youtu.be`) plus **title** for labeling. If API errors, quota exceeded, or empty results, keep **text fallback** (`videoLabel`) and omit `videoUrl`.

**Rationale**: Official API, stable links, clear attribution via title; matches spec’s “public video pages.” Keys stay server-side per constitution P3.

**Alternatives considered**: Hard-coded channel playlists (does not scale); embedding iframes on-page (optional later; MVP3 opens in new tab per existing acceptance language).

---

## R5 — Where enrichment runs (integration shape)

**Decision**: **Post-process** inside `POST /api/routine` after validated generation: parallel per-step enrichment with **per-step and global timeouts**, cap concurrent fetches, strip/fail unsafe URLs. Response validation (Zod) runs **after** enrichment so clients receive a single coherent payload.

**Rationale**: Keeps LLM focused on safe movement copy; media failures do not block text; easier to test and monitor.

**Alternatives considered**: Ask the LLM to return image/video URLs directly (rejected — hallucinated links break SC-002/SC-003); separate client-side fetch (rejects — exposes keys or CORS issues).

---

## R6 — Mindfulness UI (FR-007, FR-008)

**Decision**: Implement a **design token layer** (Tailwind theme extension or shared constants): calm gradient backdrops, **decorative** yoga imagery via optimized static assets in `public/` or `next/image`, foreground content on **solid/translucent** panels to preserve **WCAG 2.1 AA** contrast. Optional `prefers-reduced-motion`: reduce or disable large parallax.

**Rationale**: Meets spec emotional goals without relying on color alone for state; constitution P5 compliance.

**Alternatives considered**: Full-bleed busy photos behind text (rejected — contrast failure risk).

---

## R7 — Performance budgets (non-functional)

**Decision**: Target **p95** end-to-end `POST /api/routine` **≤ 30s** including enrichment (inherits MVP2); per-step media fetch **≤ 3s** with circuit-breaker to fallback; total enrichment adds **≤ 8s** wall-clock worst-case before degrading to placeholders.

**Rationale**: Aligns with existing timeout env; prevents hung requests when Commons/YouTube are slow.

**Alternatives considered**: Async jobs + polling (rejected — overkill for MVP3).

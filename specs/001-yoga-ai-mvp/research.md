# Research: Yoga.ai MVP (`001-yoga-ai-mvp`)

**Date**: 2026-04-12  
**Spec**: [spec.md](./spec.md)

## 1. GenOrchestrator integration (no in-repo package yet)

**Decision**: Implement a **single server-side adapter module** (e.g. `src/lib/gen/orchestrator.ts`) that is the only place importing/calling the organization’s GenOrchestrator SDK or HTTP API. Expose a narrow function `generateRoutineStructured(input): Promise<Result>` matching [contracts](./contracts/README.md). The Next.js **Route Handler** `POST /api/routine` (or Server Action used only from server) invokes this adapter; **no LLM keys or orchestrator credentials in client bundles**.

**Rationale**: Satisfies FR-008 and FR-007 (no client-side duplication of orchestration; secrets stay server-side). Aligns with typical Next.js security model.

**Alternatives considered**:

- Direct OpenAI from the browser — **rejected** (exposes keys; violates orchestration requirement).
- Duplicating orchestration “for speed” — **rejected** (explicitly forbidden by spec).

**Follow-up during implementation**: Wire the adapter to the real GenOrchestrator package name, entrypoint, and auth mechanism when those artifacts are available in the monorepo or internal registry.

---

## 2. Structured output shape

**Decision**: Request **JSON** matching `contracts/routine-response.schema.json` from the orchestrator (GenOrchestrator “structured output” / schema mode). Validate responses with **Zod** (or JSON Schema validator) server-side; on validation failure, treat as orchestration failure and apply FR-010 fallback.

**Rationale**: Testable alignment with knowledge entries (steps, pose ids, timing cues); prevents uncontrolled prose that could contradict “poses to avoid.”

**Alternatives considered**:

- Unstructured markdown only — **rejected** (harder to verify SC-002 automatically).
- Client-side parsing of markdown — **rejected** (weaker guarantees).

---

## 3. Hosting and `<$20/month` budget

**Decision**: Target **Vercel Hobby** (or equivalent static/SSR host with generous free tier) for the Next.js app; **variable cost** is almost entirely **LLM/orchestrator** usage. Enforce **short system prompts**, **low temperature**, **per-session cap** on generation calls (one primary call per completed intake on the safe path; retries user-initiated only), and a **conservative max output token** budget. Track usage via provider dashboard monthly.

**Rationale**: Spec assumes hundreds of sessions/month, not tens of thousands; keeps infra near $0 and leaves headroom for API spend under $20 TCO.

**Alternatives considered**:

- Always-on VPS — **deferred** (adds fixed cost; unnecessary for stateless MVP).

---

## 4. Orchestration timeout and retries

**Decision**: Apply a **server-side timeout** (e.g. **25s** on serverless limits, tunable) around the orchestrator call. **One automatic retry** may be allowed **only** for idempotent safe-path generation if the first attempt fails with a transient error (optional, plan-level); user-facing **Retry** always available per FR-010. On timeout/error → static knowledge-module breathing/rest copy + message.

**Rationale**: Matches clarified failure UX; avoids hung UI.

**Alternatives considered**:

- Infinite wait — **rejected** (poor UX; serverless constraints).

---

## 5. Safety and knowledge modules

**Decision**: Implement **pure TypeScript functions**: `evaluateSafety(intake) → { path: 'restricted' | 'safe', triggers }` and `selectKnowledgeEntry(profile) → KnowledgeEntry | null`. High-risk matching: **case-insensitive substring** (or token list) over optional note + explicit lists in config; **no LLM** for safety decisions.

**Rationale**: FR-003 requires deterministic rules; keeps tests fast and explicit.

---

## 6. Accessibility (WCAG 2.1 AA)

**Decision**: Use **semantic HTML**, **focus-visible** styles, **label** associations for inputs, **axe-core** in CI or pre-release checks on critical routes, and manual keyboard passes for disclaimer → intake → result.

**Rationale**: SC-008 and FR-012; Next.js + React do not guarantee accessibility without discipline.

---

## 7. Testing stack

**Decision**: **Vitest** (or Jest) for unit tests of safety + knowledge selection + schema validation; **Playwright** (optional in MVP) for e2e smoke of critical paths; minimum bar is **strong unit coverage** on safety and contracts.

**Rationale**: No DB means domain logic tests carry most assurance.

---

## Resolved clarifications

| Topic | Resolution |
|-------|------------|
| GenOrchestrator location | Adapter boundary in repo; real SDK wired when available |
| Secrets | Server-only env vars |
| Fallback UX | Static KB breathing/rest + retry (per spec clarification) |
| Budget guardrails | Short prompts, one main gen call, token caps, monthly dashboard review |

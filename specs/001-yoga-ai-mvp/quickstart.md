# Quickstart: Yoga.ai MVP (development)

**Branch**: `001-yoga-ai-mvp`  
**Repo root**: `c:\Users\sree4\OneDrive\Desktop\Sree\Git\yoga-ai` (adjust for your machine)

## Prerequisites

- **Node.js** LTS (20.x or 22.x recommended)
- **npm** (a `package-lock.json` is created after the first `npm install`)
- Access to **GenOrchestrator** credentials (server-side only) and whichever provider the orchestrator uses

## Environment variables

Create `.env.local` in the project root (never commit secrets):

| Variable | Purpose |
|----------|---------|
| `ROUTINE_GEN_TIMEOUT_MS` | Abort orchestration after this many ms (default `25000`) |
| `GENORCHESTRATOR_BASE_URL` | Base URL of [GenOrchestrator](https://github.com/sree4all/genorchestrator) (e.g. `http://localhost:8000`) — **no** path suffix |
| `GENORCHESTRATOR_API_KEY` | Bearer user API key from GenOrchestrator (`create_user.py`) — **not** provider keys |
| `GENORCHESTRATOR_MODEL` | Optional (default `gpt-3.5-turbo`) |
| `GENORCHESTRATOR_PROVIDER_PREFERENCE` | Optional — e.g. `cost_optimized` (see upstream `docs/api.md`) |
| `GENORCHESTRATOR_USE_JSON_OBJECT` | Optional — `false` if `response_format` json_object is unsupported |
| `OPENAI_API_KEY` | **Direct OpenAI** JSON mode (server-side). If set, it is used **before** GenOrchestrator even when orchestrator vars exist. |
| `OPENAI_MODEL` | Optional override (default `gpt-4o-mini`) |

> Full integration notes: `docs/GENORCHESTRATOR.md`. With no `OPENAI_API_KEY` and no orchestrator base + key, the app uses a **deterministic mock**.

## Install and run

```bash
cd /path/to/yoga-ai
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify critical paths (manual)

1. Disclaimer → explicit acknowledgment → intake steps appear.
2. Safe profile (mild/moderate + supported region) → structured routine (orchestrator reachable).
3. Severe intensity → breathing/rest only; no full asana sequence.
4. Optional note containing a curated high-risk term → restricted path.
5. Simulate orchestrator failure (mock or disconnect) → FR-010 fallback + retry.

## Tests

```bash
npm run test
```

Aim to keep safety and schema validation tests green before merging.

## Spec artifacts

| Doc | Path |
|-----|------|
| Feature spec | `specs/001-yoga-ai-mvp/spec.md` |
| Plan | `specs/001-yoga-ai-mvp/plan.md` |
| Contracts | `specs/001-yoga-ai-mvp/contracts/` |

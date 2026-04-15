# Quickstart: MVP3 — Dynamic Routines, Reference Media, Mindfulness UI

**Branch**: `003-mvp3-dynamic-media-ui`

## Prerequisites

- Node.js **20+**
- `npm install`

## Run the app

```bash
npm run dev
```

Open the URL shown (default `http://localhost:3000`).

## Environment (after implementation)

Copy `.env.example` to `.env.local`. For MVP3, plan for:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` or GenOrchestrator vars | Routine generation (unchanged) |
| `OPENAI_MODEL` / `GENORCHESTRATOR_MODEL` | Model selection (operator / deploy config) |
| `ROUTINE_GEN_TEMPERATURE` | Creative latitude — “operator tuning” for variety (**FR-002**) |
| `YOUTUBE_DATA_API_KEY` | YouTube Data API v3 for reference video links (optional; text fallback if unset) |
| Optional `MEDIA_ENRICH_BUDGET_MS` / `MEDIA_STEP_TIMEOUT_MS` | If implemented, cap enrichment time (see repo `.env.example`) |
| Wikimedia | Often usable without a key; see `plan.md` / implementation |

Never expose API keys to the client bundle.

## API smoke test

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/routine' -Method Post -ContentType 'application/json' -Body '{"disclaimerAcknowledged":true,"discomfortTypes":["stress"],"bodyRegions":["whole_body"],"intensity":"mild"}'
```

Expect `kind: safe_routine` and steps with enriched `media` (Wikimedia image URLs when reachable; YouTube when `YOUTUBE_DATA_API_KEY` is set).

**GET diagnostics** (no secrets):

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/routine' -Method Get
```

Expect `mediaEnrichmentCommons`, `mediaEnrichmentYoutubeConfigured`, `routineGenTemperature`, etc.

## Quality gates

- `npm run lint`
- `npm test`
- Manual **WCAG spot-check** on intake → session → results (keyboard Tab, visible focus, ~200% zoom, contrast) per spec **SC-005** / [tasks.md](./tasks.md) **T018**

## Docs index

| Artifact | Path |
|----------|------|
| Spec | [spec.md](./spec.md) |
| Plan | [plan.md](./plan.md) |
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Contract | [contracts/routine-response.schema.json](./contracts/routine-response.schema.json) |

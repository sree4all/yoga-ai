# Quickstart: MVP2 Refined Recommendations

**Branch**: `002-mvp2-ui-llm-refinement`

## Prerequisites

- Node.js **20+**
- Dependencies installed: `npm install`

## Run the app

```bash
npm run dev
```

Open the local URL shown in the terminal (default `http://localhost:3000`).

## Configure generation (optional)

Same as MVP1 (see repo root `.env.example`):

- `OPENAI_API_KEY` **or** `GENORCHESTRATOR_BASE_URL` + `GENORCHESTRATOR_API_KEY`
- If neither is set, the app uses the **deterministic mock** path.

## API smoke test (after implementation lands)

`POST /api/routine` with MVP2 body shape (arrays):

```bash
curl -s -X POST http://localhost:3000/api/routine ^
  -H "Content-Type: application/json" ^
  -d "{\"disclaimerAcknowledged\":true,\"discomfortTypes\":[\"stiffness\",\"fatigue\"],\"bodyRegions\":[\"hips\",\"back\"],\"intensity\":\"mild\"}"
```

PowerShell (avoid caret):

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/routine' -Method Post -ContentType 'application/json' -Body '{"disclaimerAcknowledged":true,"discomfortTypes":["stiffness"],"bodyRegions":["neck","shoulders"],"intensity":"moderate"}'
```

Expect a JSON response validating against `contracts/routine-response.schema.json` (kind `safe_routine`, `routine.yogaStyle`, steps with `media` once implemented).

## Tests & lint

```bash
npm test
npm run lint
```

## Accessibility spot-check

- Tab through intake (multi-select) and results; verify focus rings and labels.
- Run axe or Lighthouse accessibility audit on selection + results pages (target **WCAG 2.1 AA** per spec).

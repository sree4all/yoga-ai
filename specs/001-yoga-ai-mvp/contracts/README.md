# API Contracts: Yoga.ai MVP

Server-facing interfaces for routine generation. Clients call **Next.js Route Handlers** only; they never call GenOrchestrator directly.

## Endpoints (planned)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/routine` | Accepts completed intake payload; runs safety evaluation; if safe, calls GenOrchestrator adapter and returns structured routine or fallback metadata. |

## Schemas

| File | Purpose |
|------|---------|
| [routine-request.schema.json](./routine-request.schema.json) | Body for `POST /api/routine` |
| [routine-response.schema.json](./routine-response.schema.json) | Success body for safe path + structured steps |
| [orchestrator-failure.schema.json](./orchestrator-failure.schema.json) | Body when generation fails (FR-010); client shows static KB + retry |

## Versioning

MVP: unversioned JSON; breaking changes require spec + contract bump together.

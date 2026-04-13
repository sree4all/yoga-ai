# GenOrchestrator integration (Yoga.ai)

Yoga.ai talks to **[GenOrchestrator](https://github.com/sree4all/genorchestrator)** using its **OpenAI-compatible** HTTP API.

## Architecture

| Layer | Responsibility |
|-------|------------------|
| **GenOrchestrator** (separate repo) | FastAPI service: auth, routing, failover, budgets, provider keys (OpenAI, Anthropic, Google in *its* `.env`). |
| **Yoga.ai** (`src/lib/gen/orchestrator.ts`) | Server-only client: `POST {GENORCHESTRATOR_BASE_URL}/v1/chat/completions` with `messages`, `model`, optional `provider_preference`, optional `response_format`. |

API keys for **providers** are **not** set in Yoga.ai — only the **GenOrchestrator user API key** (Bearer token) is needed here.

## Environment variables (Yoga.ai)

| Variable | Required | Description |
|----------|----------|-------------|
| `GENORCHESTRATOR_BASE_URL` | For orchestrator path | e.g. `http://localhost:8000` (default port from [README](https://github.com/sree4all/genorchestrator/blob/main/README.md)) |
| `GENORCHESTRATOR_API_KEY` | For orchestrator path | Key from `scripts/create_user.py` (format like `go_…` per [docs/api.md](https://github.com/sree4all/genorchestrator/blob/main/docs/api.md)) |
| `GENORCHESTRATOR_MODEL` | No | Default `gpt-3.5-turbo` |
| `GENORCHESTRATOR_PROVIDER_PREFERENCE` | No | e.g. `cost_optimized` |
| `GENORCHESTRATOR_USE_JSON_OBJECT` | No | Default `true`; set `false` if JSON mode is unsupported by the routed provider |
| `ROUTINE_GEN_TIMEOUT_MS` | No | Aborts the HTTP call (default 25000) |

## Running GenOrchestrator locally

Follow the upstream [Quick Start](https://github.com/sree4all/genorchestrator#quick-start): Docker for Postgres/Redis, `alembic upgrade`, create user, `uvicorn src.api.main:app --reload` (port **8000** by default).

Then in Yoga.ai `.env.local`:

```env
GENORCHESTRATOR_BASE_URL=http://localhost:8000
GENORCHESTRATOR_API_KEY=go_your_key_from_create_user
```

## Fallbacks (routing order in `src/lib/gen/orchestrator.ts`)

1. **Direct OpenAI** when `OPENAI_API_KEY` is set (takes precedence over GenOrchestrator if both are configured).  
2. **GenOrchestrator** when `GENORCHESTRATOR_BASE_URL` and `GENORCHESTRATOR_API_KEY` are both set and OpenAI is not.  
3. **Mock** from static knowledge when neither path is configured.

## References

- [ENV_CONFIGURATION.md](https://github.com/sree4all/genorchestrator/blob/main/ENV_CONFIGURATION.md) — orchestrator server `.env` (database, Redis, **provider** API keys, JWT, etc.)  
- [env.example](https://github.com/sree4all/genorchestrator/blob/main/env.example) — template for the Python service  
- [docs/api.md](https://github.com/sree4all/genorchestrator/blob/main/docs/api.md) — `POST /v1/chat/completions`

# Yoga.ai (MVP)

Minimal **Next.js (App Router)** web app: structured intake → deterministic safety → static **YTT200-inspired** knowledge → optional **LLM** wording via a server-only orchestration adapter.

- **Feature spec**: [`specs/001-yoga-ai-mvp/spec.md`](specs/001-yoga-ai-mvp/spec.md)  
- **Quickstart**: [`specs/001-yoga-ai-mvp/quickstart.md`](specs/001-yoga-ai-mvp/quickstart.md)  
- **Tasks**: [`specs/001-yoga-ai-mvp/tasks.md`](specs/001-yoga-ai-mvp/tasks.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint (Next + jsx-a11y) |
| `npm run test` | Vitest unit tests |
| `npm run build:corpus` | Build `docs/routine-corpus/bundle.json` from source files |
| `npm run sync:pose-assets` | Copy training SVGs into `public/routine-corpus/assets/` |
| `npm run validate:corpus` | Validate corpus duration, policy, and no-video rules |

## Environment

Copy `.env.example` to `.env.local`. **Never** commit secrets. Orchestration stays **server-side** only (`src/lib/gen/orchestrator.ts`, `src/app/api/routine/route.ts`).

**LLM routing** (server-only): if `OPENAI_API_KEY` is set, Yoga.ai calls **OpenAI** directly. Otherwise, **GenOrchestrator** ([sree4all/genorchestrator](https://github.com/sree4all/genorchestrator)) is used when `GENORCHESTRATOR_BASE_URL` + `GENORCHESTRATOR_API_KEY` are set. See [`docs/GENORCHESTRATOR.md`](docs/GENORCHESTRATOR.md).

## Disclaimer

Yoga.ai provides general wellness education only—not medical advice. See in-app copy for full wording.

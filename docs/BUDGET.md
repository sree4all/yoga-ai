# Monthly cost guardrails (Yoga.ai MVP)

**Target**: Combined hosting + metered LLM usage **under USD $20/month** during pilot (FR-009, SC-004).

## Assumptions

- Pilot volume on the order of **hundreds** of completed sessions per month, not tens of thousands (see `specs/001-yoga-ai-mvp/spec.md`).
- **One primary** text-generation call per successful safe-path intake (retries are user-initiated).
- Hosting on a **free or low-cost** tier suitable for a stateless Next.js deployment (e.g., Vercel Hobby or equivalent).

## Guardrails

1. **Short prompts**: system + user prompts include only the selected knowledge entry and intake fields—no chat history stored server-side.
2. **Model choice**: prefer smaller / lower-cost models when using OpenAI fallback (`OPENAI_MODEL`, default `gpt-4o-mini` in code).
3. **Token caps**: enforce reasonable `max_tokens` when extending OpenAI calls (future tweak in `src/lib/gen/orchestrator.ts`).
4. **Monitoring**: once per month, review provider dashboard (tokens + hosting invoice) against the $20 cap.

## If usage grows

Revisit model tier, caching (not applicable to personalized routines), or require a budget increase before scaling traffic.

# QA matrix — success criteria (spec SC-001–SC-008)

Manual verification for `specs/001-yoga-ai-mvp/spec.md`. Adjust as automation is added.

| SC | Criterion | How to verify |
|----|-----------|----------------|
| SC-001 | First-time user completes landing → result in **under 15 minutes** on mobile | Time a full run on a phone or emulator with typical network; stopwatch from load to routine or restricted view. |
| SC-002 | Safe profiles: movements align with knowledge entry; **no** avoided poses | For mild neck + mild stress paths, compare API `safe_routine` steps to `src/lib/knowledge/entries.ts`; run `validateRoutineAgainstAvoidList` in console or add unit fixture. |
| SC-003 | Severe + high-risk: **only** breathing/rest; no conflicting asana | Choose **Severe** or optional note with `hernia`; confirm UI shows `RestrictedRoutineView` only. |
| SC-004 | Monthly cost **&lt; $20** at pilot volume | Follow `docs/BUDGET.md` monthly review. |
| SC-005 | **90%** of pilot users find disclaimer **noticeable** and acknowledgment **clear** | Out of product: usability session + short survey (not implemented in-app for MVP). |
| SC-006 | Simulated orchestration failure → notice + KB breathing + retry | Temporarily set invalid `GENORCHESTRATOR_BASE_URL` / `GENORCHESTRATOR_API_KEY` or `OPENAI_API_KEY=invalid` to force fallback; confirm `GenerationFallbackView` and retry works. |
| SC-007 | **100%** product-controlled strings in **English** | String audit of UI + API disclaimer constants; confirm no locale switcher. |
| SC-008 | **WCAG 2.1 AA** on core paths | Run automated axe (browser devtools) + keyboard-only pass on disclaimer, intake, result, fallback. |

**FR-006 (~10 minutes)**: Check `totalDurationMinutes` and sum of `durationSeconds` on safe-path responses; mock path should total roughly 10 minutes from knowledge sequences.

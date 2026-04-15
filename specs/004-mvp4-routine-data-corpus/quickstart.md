# Quickstart: MVP4 Corpus (operators & developers)

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## What ships

- **`docs/routine-corpus/`** — JSON corpus bundle (versioned jointly per FR-014): routines (~10 min each), intake→catalog mapping, pose→still image index, optional enrichment library.
- **Still images** — SVGs referenced from the pose index; typically mirrored under **`public/routine-corpus/assets/`** for web URLs (see [research.md](./research.md) R2).
- **Validation** — `npm run validate:corpus` (to be wired in implementation) checks durations, pose closure, banned spiritual terms, and absence of video URLs.

## Local checks (after implementation tasks)

1. Author source files under `docs/routine-corpus/` (`routines.json`, `intake-mapping.json`, `pose-asset-index.json`, `enrichment-library.json`).
2. Build canonical bundle: `npm run build:corpus`.
3. Sync still image assets: `npm run sync:pose-assets`.
4. Run corpus validator; fix reported errors until SC-001–SC-010 criteria met: `npm run validate:corpus`.
5. Run `npm test` and `npm run lint`.

Expected successful command snippets:

- `npm run build:corpus` → `Wrote corpus bundle: .../docs/routine-corpus/bundle.json`
- `npm run sync:pose-assets` → `Synced <N> pose asset files ...`
- `npm run validate:corpus` → `Corpus validation passed.`
- `npm test` → all unit suites pass
- `npm run lint` → no warnings or errors

## Runtime (high level)

1. Load validated bundle in server module (`src/lib/corpus/` — planned).
2. Resolve **catalog tags** from current intake via `intakeMapping`.
3. Pass **allowed pose IDs** + snippets into the **orchestrator** system prompt; validate model JSON output against allowed IDs (constrained blend).

## Operator notes

- **English only** for cues and quotes (FR-013); Sanskrit as transliterated labels only.
- **Secular** content only — no chakra or religious instruction in corpus (FR-012, SC-008).
- **Do not** ship mapping without routines for the same **bundleVersion** (FR-014).

## Related contracts

- [corpus-bundle.schema.json](./contracts/corpus-bundle.schema.json)

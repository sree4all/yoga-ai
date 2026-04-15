# MVP4 Routine Corpus

This directory stores the MVP4 **corpus bundle** used for constrained generation.

## Files

- `bundle.json` (canonical runtime artifact)
- `routines.json` (authoring source)
- `intake-mapping.json` (authoring source)
- `pose-asset-index.json` (authoring source)
- `enrichment-library.json` (authoring source)

## Policy

- Joint release: routines + mapping + docs share one `bundleVersion`.
- English-only instructional text and quote bodies.
- Secular-only enrichment: no chakra or religious doctrine.
- No video URLs in corpus data.

## Mapping precedence

`intake-mapping.json` resolution is additive by key order in runtime:

1. `region:*` tags
2. `discomfort:*` tags
3. `intensity:*` tags

Duplicate tags are de-duplicated; if no key matches, runtime falls back to all routines.

## Joint release checklist (FR-014 / SC-010)

- [ ] `bundleVersion` in `bundle.json` matches the release note/version tag.
- [ ] `bundle.json` was regenerated from current source files (`npm run build:corpus`).
- [ ] `validate:corpus` passes with zero errors.
- [ ] Spot-check review completed in `review-checklist.md`.
- [ ] Mapping and routines were shipped in the same PR/commit set.

## Reviewer checklist

Use `review-checklist.md` during release validation for SC-006.

# Handoff Notes
<!-- SUMMARY: Working-state handoff for the English Constructionary · status: current · updated: 2026-07-16 -->

**Date:** 2026-07-16

---

## Current State

- 91 construction files, all validating; tree clean at last commit
- Public site: https://brettrey.github.io/English-Constructionary/ (Pages deploys from main on push)
- CI: `npm run validate` runs on every push/PR
- Framework: **projectibility-first**; the `kind` block replaced `hpc` (see `docs/projectibility-first.md` and the migration map in `docs/SCHEMA.md`)
- A Codex audit for CGEL category violations was dispatched 2026-07-16; report lands in `/tmp/claude-agent-output/cgel-category-audit.md`

## Key Design Principles (see CLAUDE.md for full details)

1. **Category vs. Use**: Don't create `cardinal-noun-proper-001` and `cardinal-noun-common-001`. Instead: one category entry (`cardinal-noun-001`) plus use entries (`numerical-label-001`, `year-name-001`, etc.)

2. **Avoid redundant inverses**: If children have `specialization-of` pointing to parent, parent does NOT need `contains`. Browser computes inverses automatically.

3. **Bracket notation**: Use `[target]` in examples to mark the construction within context. Browser renders as bold.

4. **Morphological strategies** (suppletion, affixation, ablaut) are NOT constructions - they're strategies for filling paradigm cells. See `data/indices/morphological-strategies.yaml`.

5. **Securing-ladder discipline**: `kind.projection.target` first; `secured` only as high as the rung-specific evidence; only corrective control earns "homeostatic". The linter warns on violations.

## Next logical steps

- Triage the Codex CGEL audit when it completes
- Add projection targets to `directive-ostensive-001` and `vocative-001`
- Rung-by-rung review of the migrated `secured: stable` assignments (all provisional)
- Split `adjective-001` (failure-mode: fat)
- Expand to clausal constructions (relative clauses, conditionals, etc.)

## Technical notes

- Web browser: `npm run web` (local); site rebuilds manifest in CI, so `web/manifest.json` need not be committed fresh
- Validation: `npm run validate` · Lint only: `npm run lint` · Manifest: `npm run build:web`

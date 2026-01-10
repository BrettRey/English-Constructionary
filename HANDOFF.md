# Handoff Notes

**Date:** 2026-01-10
**Last commit:** `67dae10` "add bracketed context to cardinal-determinative examples"

---

## Uncommitted Changes

- `STATUS.md` updated with current state (79 constructions, session log)

To commit:
```bash
cd /Users/brettreynolds/Documents/LLM-CLI-projects/tools/English-Constructionary
git add STATUS.md && git commit -m "update status for Jan 10"
git push
```

---

## Project Location

Moved to: `/Users/brettreynolds/Documents/LLM-CLI-projects/tools/English-Constructionary/`

(Previously was at portfolio root level)

---

## Key Design Principles (see CLAUDE.md for full details)

1. **Category vs. Use**: Don't create `cardinal-noun-proper-001` and `cardinal-noun-common-001`. Instead: one category entry (`cardinal-noun-001`) plus use entries (`numerical-label-001`, `year-name-001`, etc.)

2. **Avoid redundant inverses**: If children have `specialization-of` pointing to parent, parent does NOT need `contains`. Browser computes inverses automatically.

3. **Bracket notation**: Use `[target]` in examples to mark the construction within context. Browser renders as bold.

4. **Morphological strategies** (suppletion, affixation, ablaut) are NOT constructions - they're strategies for filling paradigm cells. See `data/indices/morphological-strategies.yaml`.

---

## Current Coverage (79 files)

- Numeratives: complete (basic, teens, decades, compounds, magnitude, factor, addition, ordinals, fractionals, fused-head)
- Cardinal nouns/determinatives: restructured with use constructions
- Negation: secondary verbal, constituent, imperative, absolute negators, never-adv
- NP structure: bare, determined, genitive, pronominal, proper
- Definiteness, number, countability: full HPC treatment

---

## Next logical steps

- Review remaining entries for CGEL alignment
- Expand to clausal constructions (relative clauses, conditionals, etc.)
- Expand HPC metadata (stabilisers, mechanisms)

---

## Technical notes

- Web browser: `npm run web`
- Validation: `npm run validate`
- Lint: `npm run lint`
- Build manifest: `npm run build:web`

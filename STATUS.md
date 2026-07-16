# English Constructionary
<!-- SUMMARY: CxG dictionary of English constructions, projectibility-first framework, public site + CI live · status: active · updated: 2026-07-16 -->

**Status:** Active development
**Last updated:** 2026-07-16

**See also:** `NOTES.md` for theoretical ideas in progress

---

## Current State

- **91 construction YAML files** in `data/constructions/`
- Full validation tooling (`npm run validate`, `npm run lint`), now enforcing securing-ladder discipline on `kind` blocks
- **Public site live:** https://brettrey.github.io/English-Constructionary/ (GitHub Pages, auto-deploys from main)
- **CI:** schema validation + lint on every push/PR (`.github/workflows/validate.yml`)
- `docs/CONTRIBUTING.md` published (data format, style guide, review process)
- Web interface with bracket highlighting, dimensions, symmetric relations, kind-block display
- Morphological strategies index (`data/indices/morphological-strategies.yaml`)

## Theoretical Framework

**Projectibility-first** (Reynolds 2026, "Not every stable cluster is homeostatic"); the earlier HPC framing is deprecated (2026-07-16). A category earns an entry as a **projectible profile**: observing part of it licenses expectations about the rest, for a declared field-relative purpose. Stronger claims climb a ladder (stable → networked → maintained → controlled), each rung needing its own evidence; only corrective control earns "homeostatic". The `kind` metadata block (formerly `hpc`) records the projection target, the secured tier, and rung-specific evidence. See `docs/projectibility-first.md`.

Key insight from mereology work: **projectibility determines field-specificity**. The `type` field indicates which domain (syntactic, semantic, morphological) provides maximal predictive power for this cluster.

Example: "Brett" in "I met Brett" - the syntactician tracks it as a proper *noun* (projectible for distributional predictions); the semanticist tracks it as a proper *name* (projectible for interpretive predictions). Both are real; neither reduces to the other.

**Category vs. Use distinction**: Category entries (e.g., `cardinal-noun-001`) document what exists; use entries (e.g., `numerical-label-001`, `year-name-001`) document how categories are employed. Don't conflate them.

## Construction Coverage

Major areas:
- **Numeratives**: Basic lexemes (0–12), teens, decades, compounds (21–99), magnitude, factor, addition, ordinals, fractionals, fused-head
- **Cardinal nouns & determinatives**: Category entries plus use constructions (numerical labels, abstract numerals, year names, magnitude quantifiers, collective numerals, denominator numerals)
- **Negation**: Secondary verbal, constituent, imperative, absolute negator determinatives, never-adv
- **NP structure**: Bare, determined, genitive, pronominal, proper
- **Definiteness, number, countability**: kind metadata with securing tiers

## Next Steps

- [x] Build validation tooling
- [x] Develop web interface
- [x] Implement category vs use distinction
- [x] Add bracket notation for examples
- [x] Add morphological strategies index
- [x] Public deployment (GitHub Pages) + CI + CONTRIBUTING
- [x] Migrate `hpc` metadata to projectibility-first `kind` blocks
- [ ] Review remaining entries for CGEL alignment (Codex audit dispatched 2026-07-16)
- [ ] Add projection targets to `directive-ostensive-001` and `vocative-001` (lint warns)
- [ ] Rung-by-rung review of migrated `secured: stable` assignments (all provisional)
- [ ] Split `adjective-001` (failure-mode: fat)
- [ ] Expand to clausal constructions

---

## Session Log

- **2026-07-16**: Major session. Public GitHub Pages site + CI validation live; `docs/CONTRIBUTING.md` added. Absolute negators recategorized as determinatives (CGEL Ch. 9 §3.2), entry renamed. HPC framing deprecated in favour of projectibility-first framework: `hpc` block → `kind` block (projection target first; secured tier stable/networked/maintained/controlled; only corrective control earns "homeostatic"); 8 entries migrated with honest tier deflation; docs, schema, lint, and browser updated; `docs/hpc-implications.md` → `docs/projectibility-first.md`. Codex dispatched for CGEL category-violation audit.
- **2026-02-01**: Brief session. Discussed whether Peircean triad (from mereology work) could improve the form+meaning schema. Created NOTES.md to track the idea.
- **2026-01-10**: Status check and update after 2+ week gap. 79 constructions now in repository.
- **Late Dec 2025**: Major session on numeratives and cardinal nouns. Implemented category vs use distinction (cardinal-noun-001 as category, numerical-label-001/year-name-001/etc. as uses). Added bracket notation `[target]` for in-context examples. Browser improvements: name prominent, dimensions block, symmetric mereological relations. Fixed redundant contains/specialization-of relations. Added morphological strategies index (suppletion, affixation, ablaut, etc.).
- **2025-12-22**: Major development session. HPC theoretical architecture added (typed mereology, projectability as field-specificity criterion). Validation and lint scripts built. Web interface functional.
- **2025-12-21**: Cloned from GitHub, integrated into portfolio

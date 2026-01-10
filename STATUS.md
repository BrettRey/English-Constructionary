# English Constructionary

**Status:** Active development
**Last updated:** 2026-01-10

---

## Current State

- **79 construction YAML files** in `data/constructions/`
- Full validation tooling (`npm run validate`, `npm run lint`)
- Web interface functional (`npm run web`) with bracket highlighting, dimensions, symmetric relations
- HPC theoretical framework integrated into CLAUDE.md
- Morphological strategies index (`data/indices/morphological-strategies.yaml`)

## Theoretical Framework

Constructions treated as **HPC kinds**. Key insight from mereology work: **projectability determines field-specificity**. The `type` field indicates which domain (syntactic, semantic, morphological) provides maximal predictive power for this cluster.

Example: "Brett" in "I met Brett" - the syntactician tracks it as a proper *noun* (projectable for distributional predictions); the semanticist tracks it as a proper *name* (projectable for interpretive predictions). Both are real; neither reduces to the other.

**Category vs. Use distinction**: Category entries (e.g., `cardinal-noun-001`) document what exists; use entries (e.g., `numerical-label-001`, `year-name-001`) document how categories are employed. Don't conflate them.

## Construction Coverage

Major areas:
- **Numeratives**: Basic lexemes (0–12), teens, decades, compounds (21–99), magnitude, factor, addition, ordinals, fractionals, fused-head
- **Cardinal nouns & determinatives**: Category entries plus use constructions (numerical labels, abstract numerals, year names, magnitude quantifiers, collective numerals, denominator numerals)
- **Negation**: Secondary verbal, constituent, imperative, absolute negators, never-adv
- **NP structure**: Bare, determined, genitive, pronominal, proper
- **Definiteness, number, countability**: Full HPC treatment

## Next Steps

- [x] Build validation tooling
- [x] Develop web interface
- [x] Implement category vs use distinction
- [x] Add bracket notation for examples
- [x] Add morphological strategies index
- [ ] Review remaining entries for CGEL alignment
- [ ] Expand to clausal constructions
- [ ] Expand HPC metadata (stabilisers, mechanisms)

---

## Session Log

- **2026-01-10**: Status check and update after 2+ week gap. 79 constructions now in repository.
- **Late Dec 2025**: Major session on numeratives and cardinal nouns. Implemented category vs use distinction (cardinal-noun-001 as category, numerical-label-001/year-name-001/etc. as uses). Added bracket notation `[target]` for in-context examples. Browser improvements: name prominent, dimensions block, symmetric mereological relations. Fixed redundant contains/specialization-of relations. Added morphological strategies index (suppletion, affixation, ablaut, etc.).
- **2025-12-22**: Major development session. HPC theoretical architecture added (typed mereology, projectability as field-specificity criterion). Validation and lint scripts built. Web interface functional.
- **2025-12-21**: Cloned from GitHub, integrated into portfolio

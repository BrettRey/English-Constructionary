# English Constructionary

**Status:** Active development
**Last updated:** 2025-12-23

---

## Current State

- 41+ construction YAML files in `data/constructions/`
- Full validation tooling (`npm run validate`, `npm run lint`)
- Web interface functional (`npm run web`)
- HPC theoretical framework integrated into CLAUDE.md

## Theoretical Framework

Constructions treated as **HPC kinds**. Key insight from mereology work: **projectability determines field-specificity**. The `type` field indicates which domain (syntactic, semantic, morphological) provides maximal predictive power for this cluster.

Example: "Brett" in "I met Brett" - the syntactician tracks it as a proper *noun* (projectable for distributional predictions); the semanticist tracks it as a proper *name* (projectable for interpretive predictions). Both are real; neither reduces to the other.

## Construction Coverage

Entries include:
- Genitive 's (detailed polysemy network)
- Definiteness constructions
- Gradation/comparison
- Interrogatives
- Noun types (common, proper, mass, plural)
- And more...

## Next Steps

- [x] Build validation tooling
- [x] Develop web interface
- [ ] Review existing entries for CGEL alignment
- [ ] Add missing core constructions
- [ ] Expand HPC metadata (stabilisers, mechanisms)

---

## Session Log

- **2025-12-22**: Major development session. HPC theoretical architecture added (typed mereology, projectability as field-specificity criterion, category vs use distinction). Validation and lint scripts built. Web interface functional. Insight from linguistics-mereology project integrated.
- **2025-12-21**: Cloned from GitHub, integrated into portfolio

# English Constructionary
<!-- SUMMARY: Projectibility-first English construction dictionary with 391 published constructions, a lexicon layer, and linked evidence · status: active · updated: 2026-11-19 -->

**Status:** Active development
**Last updated:** 2026-11-19

**See also:** `NOTES.md` for theoretical ideas in progress

---

## Current State

- **391 published construction entries** in `data/constructions/`
- **Lexicon layer**: 603 browsable cards, including new cards for *need*, *tell*, and *explain*. The profile pilot records use-specific construction links for those verbs and the two existing *that* cards.
- **Division of labour (2026-07-16): Brett authors entries; agents plan and maintain** (see `docs/ROADMAP.md`)
- Full validation tooling (`npm run validate`, `npm run lint`), now enforcing securing-ladder discipline on `kind` blocks
- **Public site live:** https://brettrey.github.io/English-Constructionary/ (GitHub Pages, auto-deploys from main)
- **CI:** schema validation + lint on every push/PR (`.github/workflows/validate.yml`)
- `docs/CONTRIBUTING.md` published (data format, style guide, review process)
- Web interface with bracket highlighting, dimensions, symmetric relations, kind-block display
- **Evidence links** connect examples and claims to 62 registered sources. The browser displays the links, and the project exports them in its construction graph.
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
- **NP structure**: Bare, determined, genitive, pronominal, and proper NPs. The Chapter 5 entries include bare noun coordination, evaluative binominals, genitive quantification, and property-value modifiers.
- **Definiteness, number, countability**: kind metadata with securing tiers
- **Clause structure**: VP-headed Clause backbone; declarative, closed/open interrogative, exclamative, and imperative Clause types; clause-analogue semantics kept outside Clause
- **Questions**: semantic Question parent with declarative, tag, and echo specializations, interfacing with interrogative Clause types
- **Argument structure and voice**: Ditransitive, caused motion, time-away, particle-object, goal/source/path, object resultative, way motion, conative *at*, *into*-causative, and verbal *be*-passive
- **Degree and quantity**: Comparative correlatives, indefinite-denominator rates, subject-linked genitive superlatives, and intensifying *so* with a nominal
- **Discourse**: Strong proper names, paired-NP introductions such as *Alex, Teacup*, *let alone*, and *it*-clefts
- **Fused-head network**: broader `fused-head-001` parent with `fused-determiner-head-001`, plus numerative and demonstrative subtypes

## Next Steps

See [the roadmap](docs/ROADMAP.md) for the entry, adjudication, and infrastructure queues.

- [x] Build validation tooling
- [x] Develop web interface
- [x] Implement category vs use distinction
- [x] Add bracket notation for examples
- [x] Add morphological strategies index
- [x] Public deployment (GitHub Pages) + CI + CONTRIBUTING
- [x] Migrate `hpc` metadata to projectibility-first `kind` blocks
- [x] Review remaining entries for CGEL alignment (Codex audit triaged 2026-07-16; 26 findings resolved)
- [x] Add a projection target to `directive-ostensive-001`
- [ ] Reassess the projection target for `vocative-001` after withdrawal of the kinship evidence
- [ ] Rung-by-rung review of migrated `secured: stable` assignments (all provisional)
- [ ] Split `adjective-001` (failure-mode: fat)
- [x] Add Clause/VP backbone and primary Clause-type entries
- [ ] Expand the Clause network with relative and content Clauses

---

## Session Log

- **2026-11-19** — Published the approved emphatic polarity response family and its three additional sources.

- **2026-11-19** — Screened relations across all 389 published constructions and revised 134 entries. Corrected hierarchy cycles and added diagnostic notes to comparisons across construction families.

- **2026-11-19** — Published lexical profiles with links in both directions between words and constructions. Expanded the bare role entry’s relations and added a relation search to the authoring workflow.

- **2026-11-19** — Published revisions to 97 entries, including the bare role construction. Added distributional contrasts and source locators and repaired construction links. The catalogue has 389 published entries and 58 evidence sources.
- **2026-11-19** — Published 237 entries from the constructicon comparison and the expanded grammar survey. The release brings the public catalogue to 389 constructions with 55 registered sources.
- **2026-11-18** — Doubled the local catalogue from 195 to 390 records. The 195 new entries have source locators, diagnostic examples, and relations in the browser. [Decision log](DECISIONS.md#2026-11-18)
- **2026-11-18** — Added 42 local entries after a broader screen of English constructicons. See the coverage and selection notes in [DECISIONS.md](DECISIONS.md#2026-11-18).
- **2026-11-18** — Published 26 new entries. Sixteen came from the CGEL Chapter 5 audit, nine from a selective scan of other English constructicons, and one documents the paired-NP introduction. The browser index and evidence graph include the new entries and their sources. The release brought the public inventory to 152 constructions.
- **2026-10-30** — Added the strong proper name construction and withdrew the kinship evidence previously used in the vocative entry. The public inventory reached 126 constructions.
- **2026-07-24 (shutdown addendum)**: Broadened the fused-head taxonomy with a new `fused-head-001` parent, renamed `determinative-fused-head-001` to `fused-determiner-head-001`, kept `numerative-fused-head-001` as a determiner-head subtype, and regenerated the derived web artifacts after validation. The clause-analogue rename from the previous session remains in place. Repository now has 125 constructions.
- **2026-07-16 (construction-network addendum)**: Added 15 connected entries: VP, strict VP-headed Clause, clause-analogue semantics, five primary Clause types, semantic Question, declarative question, Tag Question, and four argument-structure neighbours (prepositional particle-object, path, object resultative, way motion). Reworked Echo Question as a semantic overlay, kept Question distinct from Clause type, connected the new nodes through families and typed relations, and added rung-matching grounds. Repository now has 124 constructions.
- **2026-07-16 (evening addendum)**: Lexicon layer built end to end (Wiktionary standoff design, gold lists from Simple English, glosses, per-lexeme browser cards). Indeterminate and deitality architectures per Brett's rulings and papers; exclamation/ostensive-NP two-axis analysis; constituent-type layer (phrase/coordination); preposition batch and path-complement family, heavily Brett-corrected (ago, intransitive = no object, PP grain, forcing test). Division of labour set: Brett authors entries, agents plan/maintain. ROADMAP.md rewritten as prioritized queues.
- **2026-07-16**: Major session. Public GitHub Pages site + CI validation live; `docs/CONTRIBUTING.md` added. Absolute negators recategorized as determinatives (CGEL Ch. 9 §3.2), entry renamed. HPC framing deprecated in favour of projectibility-first framework: `hpc` block → `kind` block (projection target first; secured tier stable/networked/maintained/controlled; only corrective control earns "homeostatic"); 8 entries migrated with honest tier deflation; docs, schema, lint, and browser updated; `docs/hpc-implications.md` → `docs/projectibility-first.md`. Codex dispatched for CGEL category-violation audit.
- **2026-02-01**: Brief session. Discussed whether Peircean triad (from mereology work) could improve the form+meaning schema. Created NOTES.md to track the idea.
- **2026-01-10**: Status check and update after 2+ week gap. 79 constructions now in repository.
- **Late Dec 2025**: Major session on numeratives and cardinal nouns. Implemented category vs use distinction (cardinal-noun-001 as category, numerical-label-001/year-name-001/etc. as uses). Added bracket notation `[target]` for in-context examples. Browser improvements: name prominent, dimensions block, symmetric mereological relations. Fixed redundant contains/specialization-of relations. Added morphological strategies index (suppletion, affixation, ablaut, etc.).
- **2025-12-22**: Major development session. HPC theoretical architecture added (typed mereology, projectability as field-specificity criterion). Validation and lint scripts built. Web interface functional.
- **2025-12-21**: Cloned from GitHub, integrated into portfolio

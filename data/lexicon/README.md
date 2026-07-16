# Lexical Category Layer
<!-- SUMMARY: Standoff CGEL category overrides keyed to Wiktionary lemma+POS · status: design draft · updated: 2026-07-16 -->

From the CxG perspective, individual words are constructions, so a complete Constructionary needs the lexical end of the lexicon–syntax continuum. This directory holds a **standoff override layer**: CGEL category assignments keyed to an external dictionary, not a copy of the dictionary itself.

## Design

**Base:** English Wiktionary, accessed through the wiktextract JSONL dumps at [kaikki.org](https://kaikki.org/dictionary/English/). Wiktionary is the only English dictionary that is simultaneously (a) licensed for derivative use (CC BY-SA), (b) machine-readable at scale, (c) broad enough in coverage for a complete-description ambition, and (d) freely checkable by readers, which matters for a reference work: a category correction keyed to an entry nobody can consult is uncheckable. OED is the better lexicographic record but its licence blocks redistribution and systematic annotation (secondary citation target only). WordNet covers only the four open classes, and CGEL's divergences from dictionary practice live overwhelmingly in the closed classes. Wikidata lexemes are too sparse.

**The base is never vendored.** As of 2026-07-16 the kaikki English extraction covers ~1.38M words (~3.0 GB JSONL); the override layer is a few MB. Readers and tooling join the layer to whichever dated dump they download.

**Keying:** lemma + source POS, not sense ID. Wiktionary sense IDs are unstable; headword-level identity is fine for category assignment (Kilgarriff 1997 was right about word senses). A consequence worth having: keyed this way, the layer is nearly dictionary-agnostic — the same overrides apply if a reader prefers Merriam-Webster. Where CxG needs sense-grain distinctions (e.g. the *way*-construction), that belongs in construction entries citing lemmas, not in this layer.

**Method** (corrections are small and systematic):

1. **Default mapping rules** from traditional POS to CGEL categories: `pos-defaults.yaml`. Examples: *determiner/article* → determinative; *conjunction* splits into coordinator, subordinator, and preposition; a sizeable chunk of "adverbs" (*outside*, *abroad*, *ago*, *downstairs*) → intransitive preposition.
2. **Hand-curated gold lists for the closed classes** (determinatives, prepositions, subordinators, coordinators, pronouns). Finite, bounded; they override the defaults. This is where most of the real work sits. Seeded (2026-07-16) from **Simple English Wiktionary**, where Brett hand-curated the closed-category lexemes: see `gold/` (158 determinatives incl. the compound series and magnitude words; 356 prepositions incl. intransitive and conjunction-reanalysis items; 61 CGEL-clean pronouns; 25 conjunctions pre-split into coordinator/subordinator/to-adjudicate). Cross-check against `data/indices/syntactic-diagnostics.yaml`.
3. **Adjudicate the open-class residue** lexeme by lexeme (*worth*, *near*, *several*, *due*), recording the distributional tests that justify each call as evidence fields. The tests are what make the layer citable rather than stipulative: this layer is precisely the point where dictionary categories stop licensing the inferences a grammar needs.
4. **Publish as versioned data**: each release keyed to a dated dump (`keyed-to` block in `overrides.yaml`), validated against `data/schemas/lexicon-override.json`.

## Files

- `gold/` — closed-class gold-list seeds extracted from the Simple English Wiktionary kaikki dump (see each file's source block)

- `pos-defaults.yaml` — default mapping table, source POS → CGEL category, with rule notes and confidence
- `overrides.yaml` — the override records (gold lists + adjudications); seeded with worked examples
- `../schemas/lexicon-override.json` — JSON Schema for `overrides.yaml`

## Licence

This layer (this directory) is released under **CC BY-SA 4.0**, matching Wiktionary's licence, independently of the repository's MIT licence for code.

## Status

Design draft (2026-07-16). The wiktextract `pos` codes in `pos-defaults.yaml` must be verified against an actual dump at first ingest; gold lists are seeds, not yet frozen.

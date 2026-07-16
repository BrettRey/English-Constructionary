# Evidence Grounding: A Typed Network to Ground Sources
<!-- SUMMARY: Design for typed evidence links connecting every claim to its ground (CGEL, dictionaries, corpora, papers, judgments) · status: draft for Brett's review · updated: 2026-07-16 -->

Goal (Brett, 2026-07-16): connect everything connectable, through a typed network, to ground evidence — CGEL, a dictionary, COCA, a published paper, or something else.

## What exists now, untyped

Evidence currently lives as free text scattered across: `kind.projection.evidence`, `stabilisers[].evidence`, `maintenance`, override `tests` and `references` ("CGEL Ch. 7"), prose citations in `details` (Reynolds 2026 EL&L, LingBuzz ids, Goldberg 1995, CGEL page numbers you added today), source blocks on gold lists / glosses / deitality-status, and the diagnostics registry. Examples carry no attestation marking at all. None of it is queryable, checkable, or renderable as a chain.

## Design

### 1. Source registry — `data/sources.yaml`

One entry per ground source, typed and versioned:

```yaml
sources:
  cgel-2002:
    type: reference-grammar
    citation: "Huddleston & Pullum (2002), The Cambridge Grammar of the English Language, CUP"
  reynolds-2026-numerals:
    type: paper
    citation: "Reynolds (2026), The lexicon-syntax boundary in English numerals, EL&L"
    doi: "10.1017/S1360674325100518"
  reynolds-deitality:
    type: paper
    citation: "Definiteness and Deitality in English (under review, JoL)"
    url: "https://ling.auf.net/lingbuzz/009369"
    status: under-review
  wiktionary-simple:
    type: dictionary
    url: "https://kaikki.org/dictionary/downloads/simple/simple-extract.jsonl.gz"
    version: "2026-07-06"          # dump date; re-pin on refresh
  coca:
    type: corpus
    citation: "Davies (2008-), Corpus of Contemporary American English"
    access-note: "agent wrapper blocked (Cloudflare); Brett supplies queries and counts by hand"
  cgelbank:
    type: treebank
    url: "https://github.com/nert-nlp/cgel"
  childes:
    type: corpus
    citation: "MacWhinney, CHILDES"
  brett-judgment:
    type: author-judgment       # dated rulings; first-class evidence, clearly typed
  agent-judgment:
    type: agent-judgment        # lowest tier; must be marked, never laundered as anything else
```

Source **types**: reference-grammar, dictionary, corpus, treebank, paper, dataset, author-judgment, agent-judgment. Every type is versionable (edition, dump date, commit) so a claim is keyed to what its ground said *then*.

### 2. Typed evidence links — one small object, attachable anywhere

```yaml
evidence:
  - source: cgel-2002
    locator: "pp. 918-20"                 # page, corpus query, tree id, section
    relation: cites                        # see relation inventory
    note: "exclamative what is an adjective; interrogative what a determinative"
  - source: coca
    locator: "query: * from under [nn*]; 312 hits, 2026-07-16"
    relation: attests
  - source: brett-judgment
    locator: "2026-07-16"
    relation: adjudicates
```

**Relation inventory** (the edge types of the network):
- `cites` — the claim is stated/argued in the source
- `attests` — tokens in the source instantiate the form (corpora, treebanks)
- `adjudicates` — a dated ruling settles the point (author-judgment)
- `derives-from` — the data was mechanically extracted from the source (glosses, gold lists)
- `contradicts` — the source pushes against the claim (worth recording: CGEL Ch. 5's determinative-only cardinals vs the numerals paper)
- `discusses` — relevant treatment without settling

**Second typing dimension** — what the evidence grounds, aligned with the ladder:
`bears-on: category-assignment | attestation | projection | stability | network | maintenance | control`
This is what lets the lint say "this entry claims `secured: maintained` but no evidence link bears on maintenance."

### 3. Attachment points

- `kind.projection`, `stabilisers[]`, `maintenance`, `network`, `control` — each takes an `evidence` list (replacing free-text `evidence` strings gradually)
- **examples** — optional `evidence` (an `attests` link with corpus locator); examples with none are constructed by definition, and the browser can say so
- lexicon override records — `tests[]` and the record itself take evidence links (your rulings become `adjudicates` links automatically)
- gold lists, glosses, deitality-status — file-level `derives-from` links to the registry (mostly already there in ad-hoc form; this normalizes them)
- meanings/`details` claims — attachable but not required; prose citation remains legal

### 4. Enforcement and audit (lint + report)

- Source ids must resolve to the registry (error)
- `secured` tier without an evidence link bearing on that rung: warn (upgrades today's ladder lint from field-presence to ground-presence)
- `agent-judgment` as the *only* ground for any claim: warn (flag for your adjudication)
- New script `npm run grounding`: coverage report — claims with typed ground vs free-text vs nothing; per-source dependency lists ("everything resting on CGEL pp. 918-20", "everything only agent-grounded")

### 5. Browser

Evidence chips on entry and lexeme cards (source + locator, linked when a URL/DOI exists); a source page per registry entry listing everything it grounds. The reader-checkability principle made visible: any claim, two clicks to its ground.

### 6. Graph export

`npm run graph` emits the whole network as typed nodes and edges (constructions, lexemes, diagnostics, sources; specialization/contains/implements edges plus the evidence edges) in plain JSON. Enables the queries the YAML can't answer directly and keeps the door open to LLOD/JSON-LD later without committing now.

## Phasing (all agent-lane except your rulings)

1. **Registry + schema + validator** — `sources.yaml` seeded with the ~10 sources already cited; `evidence` object added to construction and lexicon-override schemas; resolution checks in validate.
2. **Mechanical retrofit** — today's page-cited CGEL references, the paper citations, the dump provenance, and your dated rulings converted to typed links; no new analysis, just typing what's already written.
3. **Lint upgrade + grounding report.**
4. **Browser chips + source pages.**
5. **Graph export; CGELBank locators and COCA attestations** added as they're acquired (COCA by your hand, per the access note).

## Open questions for your markup

1. **Field name**: `evidence` vs `grounds` vs `groundedIn`?
2. **Relation inventory**: right set? Is `contradicts` wanted (I'd argue yes: the CGEL-vs-numerals-paper tension is exactly what it's for)?
3. **`bears-on` values**: aligned to the ladder plus category-assignment/attestation — anything missing (acquisition? diachrony?)?
4. **Constructed examples**: is absence-of-evidence sufficient marking, or do you want explicit `constructed: true`?
5. **agent-judgment**: allowed as a source type at all, or should agent-drafted claims simply be unlinked until grounded?
6. **Granularity for the inventories**: deitality-status and gold lists link per-file now; per-item linking (each lemma's row to its ruling) is possible but noisy — worth it?

# Roadmap
<!-- SUMMARY: English Constructionary entry, adjudication, and infrastructure queues · status: active · updated: 2026-11-18 -->
## Division of labour
**Brett authors construction entries.** Agents plan, maintain infrastructure, keep the lexicon layer and indices in sync, run and triage audits, and record adjudications. Agents do not create entries unprompted.
## Where things stand (2026-11-18)

The public site has 152 construction entries, 600 lexeme cards, and 44 registered evidence sources. The November release added entries from the CGEL Chapter 5 audit, a selective scan of other English constructicons, and the paired-NP introduction. [Current status and session history](../STATUS.md)
## Entry queue (Brett)
Ordered by how much downstream work each unblocks:

1. **Relative and content Clause entries** — extend the new Clause backbone into the major subordinate-Clause systems without collapsing relative and interrogative semantics.
  
2. **Locative-complement parent** — assess whether goal, source, and path now support a genuine high-degree parent with projections beyond the three role labels.
  
3. **Remaining phrasal categories** (DP, AdjP, AdvP) under phrase-001 — quick wins, mostly settled analysis.
  
4. `adjective-001` **split** — has carried `failure-mode: fat` since the migration (gradable vs classificatory diagnostics diverge).
  
5. **Proper-noun meanings relocation** (audit uncertain case 6) — whether the "feature bundle" meanings move from `n-proper-001` to `proper-name-001`.
  
6. **Rung reviews** — review the provisional `secured: stable` assignments and the proposed maintained tier for deitality. Reassess the vocative projection now that its earlier kinship evidence has been withdrawn.
  
## Adjudication queue (Brett rules, agents record)
1. **17 conjunction-residue items** (as well as, rather than, whilst, for, so, yet, iff, ...) — each needs a verdict + tests in `overrides.yaml`.
  
2. **worth / near / due / several** — the adjective–preposition/determinative boundary flagged in `pos-defaults.yaml`.
  
3. **us / we / you as personal determinatives** — provisional in both the deitality inventory and the Simple det list.
  
4. **Full-Wiktionary adverb sweep** — agents can extract the candidate list (traditional adverbs matching the intransitive-preposition profile) from the full dump for batch ruling.
  
## Infrastructure queue (agents)
1. **Per-lexeme construction links** — join override `references` into lexeme cards, preferring them over file-level gold pointers (fixes _many_ linking to absolute-negator).
  
2. **Ladder-sync lint** — warn when an entry's `secured` tier disagrees with `kind-status.yaml`.
  
3. **CGELBank cross-linking pilot** — attested, tree-verified examples for entries; also the place to check for committed analyses of the _off to school_ attachment question.
  
4. **Full-dump ingest tooling** — kaikki full English extraction, producing adjudication candidate lists (adverb sweep first), never bulk assignments.
  
5. **Deploy hygiene** — the validate step masked a failure once (pipe exit codes); harden the local workflow.
  
## Authoring checks (distilled from 2026-07-16 corrections)
For any new entry, before it lands:

1. **Residue test** — do the properties exceed what category assignments + ordinary selection give? No residue, no entry (_bare-goal_ failure).
  
2. **Forcing test** — for attachment/constituency claims, find the parse-forcing case (never-intransitive members); diagnostics both parses predict decide nothing (_off to school_ failure).
  
3. **Grain test** — relations point at the phrase the slot takes, not the categories heading it (PP, not preposition).
  
4. **Contentful pattern** — the pattern field shows internal structure, never the entry's own name.
  
5. **Form/meaning sides** — syntactic categories in form fields, semantic categories in meaning fields (proper noun vs proper name).
  
6. **Category vs function** — determinative/determiner discipline, everywhere.
  
7. **Rung honesty** — `secured` no higher than the recorded evidence; projection target declared before mechanisms.
  
## Definition of done (per change) — unchanged
- Conforms to schema; `npm run validate` passes; CGEL-aligned terminology; indices updated when relations change.

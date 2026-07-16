# Roadmap
<!-- SUMMARY: Prioritized queues after the 2026-07-16 overhaul; Brett authors entries, agents handle infrastructure · status: active · updated: 2026-07-16 -->

## Division of labour

**Brett authors construction entries.** Agents plan, maintain infrastructure, keep the lexicon layer and indices in sync, run and triage audits, and record adjudications. Agents do not create entries unprompted.

## Where things stand (2026-07-16)

108 entries; public site + CI live; projectibility-first `kind` blocks with ladder-enforcing lint; CGEL audit triaged (26 findings resolved); lexicon layer seeded (600 lexemes from Simple English Wiktionary with glosses, browsable); constituent-type layer (phrase / coordination) in place; first frame entries (goal, source complements) and preposition batch built and Brett-corrected.

## Entry queue (Brett)

Ordered by how much downstream work each unblocks:

1. **Clause and VP entries** under `phrase-001` — phrase-001 already names Clause (Head:VP) and VP; the entries don't exist. Unblocks: clause-type entries, the clausal expansion generally.
2. **Clause-type entries** (open/closed interrogative, exclamative, imperative) — the indeterminate packagings and `exclamation-001` all point at clause types that have no entries yet. Exclamative first: `exclamative-word-001` and the deitality inventory's clause-type-dependent rows both need it.
3. **Route/path complement** — third sister to goal/source. Needs your ruling first: does any never-intransitive preposition take a route complement, or is route in the same unestablished position as PP-internal goals?
4. **Remaining phrasal categories** (DP, AdjP, AdvP) under phrase-001 — quick wins, mostly settled analysis.
5. **`adjective-001` split** — has carried `failure-mode: fat` since the migration (gradable vs classificatory diagnostics diverge).
6. **Proper-noun meanings relocation** (audit uncertain case 6) — whether the "feature bundle" meanings move from `n-proper-001` to `proper-name-001`.
7. **Rung reviews** — every `secured: stable` is provisional; deitality's maintained tier is argued in the JoL paper and awaits your award; vocative is closest to maintained (removal counterfactual on record).

## Adjudication queue (Brett rules, agents record)

1. **17 conjunction-residue items** (as well as, rather than, whilst, for, so, yet, iff, ...) — each needs a verdict + tests in `overrides.yaml`.
2. **worth / near / due / several** — the adjective–preposition/determinative boundary flagged in `pos-defaults.yaml`.
3. **us / we / you as personal determinatives** — provisional in both the deitality inventory and the Simple det list.
4. **Full-Wiktionary adverb sweep** — agents can extract the candidate list (traditional adverbs matching the intransitive-preposition profile) from the full dump for batch ruling.

## Infrastructure queue (agents)

1. **Per-lexeme construction links** — join override `references` into lexeme cards, preferring them over file-level gold pointers (fixes *many* linking to absolute-negator).
2. **STATUS.md refresh** and session log for 2026-07-16 (much has landed since the morning update).
3. **Ladder-sync lint** — warn when an entry's `secured` tier disagrees with `kind-status.yaml`.
4. **CGELBank cross-linking pilot** — attested, tree-verified examples for entries; also the place to check for committed analyses of the *off to school* attachment question.
5. **Full-dump ingest tooling** — kaikki full English extraction, producing adjudication candidate lists (adverb sweep first), never bulk assignments.
6. **Deploy hygiene** — the validate step masked a failure once (pipe exit codes); harden the local workflow.

## Authoring checks (distilled from 2026-07-16 corrections)

For any new entry, before it lands:

1. **Residue test** — do the properties exceed what category assignments + ordinary selection give? No residue, no entry (*bare-goal* failure).
2. **Forcing test** — for attachment/constituency claims, find the parse-forcing case (never-intransitive members); diagnostics both parses predict decide nothing (*off to school* failure).
3. **Grain test** — relations point at the phrase the slot takes, not the categories heading it (PP, not preposition).
4. **Contentful pattern** — the pattern field shows internal structure, never the entry's own name.
5. **Form/meaning sides** — syntactic categories in form fields, semantic categories in meaning fields (proper noun vs proper name).
6. **Category vs function** — determinative/determiner discipline, everywhere.
7. **Rung honesty** — `secured` no higher than the recorded evidence; projection target declared before mechanisms.

## Definition of done (per change) — unchanged

- Conforms to schema; `npm run validate` passes; CGEL-aligned terminology; indices updated when relations change.

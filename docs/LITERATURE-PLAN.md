# Literature-Driven Expansion Plan

## Inventory & Mapping

| Source | Focus | Candidate Outputs | Notes |
|---|---|---|---|
| `literature/cgel-negation.pdf` | Clause polarity, verbal/non-verbal negation, diagnostics | Negation constructions (imperative negation, constituent not, never, negative determinatives), syntactic diagnostics | Already added imperative negation + constituent/never/no. Remaining: secondary verbal negation, synthetic absolute negators, non-verbal negation scope notes. |
| `literature/cgel-determiner.pdf` | Determiner function, determinatives, subject‑determiners | Determination construction refinements, syntactic diagnostics for deitality, determinative inventory | Determination + diagnostics already added; can expand examples/constraints. |
| `literature/deitality copy.tex` | Deitality vs definiteness (HPC), diagnostics | Syntactic diagnostics registry, HPC notes for determination | Diagnostics added; can add deitality HPC notes or notes on mismatches. |
| `literature/numerals.tex` | Numeratives: determinatives vs phrases; factors/magnitudes/additions | Numerative constructions, determinative inventory refinement, syntactic diagnostics | Best next batch: creates multiple bounded constructions with clear diagnostics. |

## Batch 1 Proposal: Numeratives Core (from `numerals.tex`)

### Scope (what we will do)
- Add **core numeratives constructions** grounded in morphosyntax and diagnostics.
- Cover **cardinals plus ordinal/fractional morphology** where it diagnoses constituency.
- Do **not** cover decimals, algebraic expressions, or idiomatic quantity nouns (dozen, score, etc.) in this batch.

### New/Updated Constructions
1) **`cardinal-determinative-001`**
   - Form: basic determinatives (0–99) in determiner function.
   - Meaning: count/quantity specification.

2) **`numerative-magnitude-head-001`**
   - Form: magnitude heads (hundred, thousand, million) with factors as modifiers.
   - Meaning: multiplicative scaling.

3) **`numerative-factor-modifier-001`**
   - Form: factor + magnitude (two hundred, forty‑two million).
   - Diagnostics: modifier behavior; not a determiner.

4) **`numerative-addition-coordination-001`**
   - Form: additive coordination (two hundred and five).
   - Diagnostics: coordination constituency and ellipsis.

5) **`numerative-fused-head-001`** (optional)
   - Form: DP in fused determiner‑head function ("twenty‑two" standing alone).
   - Evidence: substitution/ellipsis.
6) **`numerative-ordinal-adjective-001`**
   - Form: ordinal adjectives in modifier position.
   - Meaning: rank/order.
7) **`numerative-fractional-001`**
   - Form: numerator + fractional noun (+ of NP).
   - Meaning: partitive fraction.

### Registry Additions
- **Syntactic diagnostics** (new entries):
  - ordinal/fractional morphology targets rightmost base
  - prosodic breaks at magnitude boundaries
  - coordination/ellipsis inside numeratives
- **Semantic features** (optional):
  - quantity
  - measure

### Deliverables
- 6–7 new constructions with examples and constraints.
- 3–4 new syntactic diagnostics entries.
- Validation after each small batch; one themed commit.
Status: Completed for numeratives core (cardinal, ordinal, fractional).

## Batch 2 (Next): Negation Refinements
Status: Completed (secondary verbal negation, absolute negator pronouns, neither/nor coordination, polarity diagnostics).

## Batch 3 (Next): Determination/Deitality Expansion
Status: Completed (subject and minor determiners added; determination entry updated with CGEL determiner types).

## Workflow
1) Draft constructions/diagnostics in small chunks.
2) Run `npm run validate` after each chunk.
3) Commit by theme (numeratives / negation / determination).

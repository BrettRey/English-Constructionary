# Contributing to the English Constructionary

Thanks for your interest in contributing. This document covers the data format, the style guide, the review process, and the code of conduct.

## What this resource is

The Constructionary documents English constructions: conventional pairings of form and meaning, from lexical categories (noun, determinative) to phrasal patterns (NP structure, negation, numeratives). Entries are YAML files validated against a JSON schema, browsable through a static web interface.

The framework is **projectibility-first**. A category earns an entry because knowing that an expression belongs to it licenses reliable predictions about its other properties (what observing some features licenses us to predict about others; Goodman 1955). Each entry's `type` field records the domain (syntactic, semantic, morphological, phonological, pragmatic, mixed) in which membership supports the most reliable predictions. That's a claim about predictive purchase, not about what the construction "is made of". Two entries can legitimately cover overlapping territory when they project in different domains: the syntactician's *proper noun* and the semanticist's *proper name* are both real, and neither reduces to the other.

Stronger claims sit on a ladder, and each rung needs its own evidence: a stable property profile; network order that makes the profile non-accidental; a mechanism that maintains the profile; and, last and strictest, corrective (homeostatic) control. Don't describe an entry as homeostatic just because its properties cluster stably. The schema's `kind` block records the claim: `projection.target` comes first (what membership licenses us to predict), `secured` names the tier the recorded evidence actually reaches (`stable`, `networked`, `maintained`, `controlled`), and the `network`, `stabilisers`, `maintenance`, and `control` fields hold the rung-specific evidence. The linter warns when a tier is claimed without its evidence.

## Quick start

```bash
git clone https://github.com/BrettRey/English-Constructionary.git
cd English-Constructionary
npm ci
npm run validate   # schema validation + lint
npm run build:web && npm run web   # browse locally at http://localhost:8000/web/
```

Add or edit YAML files in `data/constructions/`, run `npm run validate`, and open a pull request. CI runs the same validation on every PR.

## Data format

Each construction is one YAML file in `data/constructions/`, named after its `id`.

**Required fields:** `id`, `name`, `pattern`, `meanings`.

- `id` — lowercase letters and hyphens plus a three-digit suffix (`np-001`, `genitive-s-001`). The regex is `^[a-z-]+[0-9]{3}$`.
- `name` — human-readable name (`Noun Phrase`).
- `pattern` — the formal pattern (`NP`, `N + 's`).
- `meanings` — an object keyed by sequential integer strings (`'1'`, `'2'`, …). Each meaning takes one of two forms:
  - **Definition form:** `definition` (+ optional `details`) + `examples`.
  - **Implementation form:** `implements` (a reference like `definite-001.1`) + `specialization` (how this construction realizes that meaning) + `examples`.

**Useful optional fields:**

- `type` — the domain of maximal projectibility (see above).
- `dimensions` — a bundle of one-line summaries: `form`, `meaning`, `function`, `distribution`.
- `constraints` — typed restrictions (`syntactic`, `semantic`, `pragmatic`, …) with descriptions.
- `relatedConstructions` — links to other entries (see Relations below).
- `semanticRefs`, `formRefs`, `syntacticRefs` — pointers into the shared registries in `data/indices/` (semantic features, form features, syntactic diagnostics).
- `lexiconRefs` — pointers into `data/lexicon/` gold lists giving the construction's lexical membership.
- `kind` — projectibility-first kind metadata: `projection` (target, evidence, confidence), `secured` (tier reached), `failure-mode` (thin/fat/negative), `profile` (core and peripheral properties with diagnostics), `network`, `stabilisers`, `maintenance`, `control`, `boundaries`, `grain`. Use `provisional: true` for exploratory metadata. See `docs/SCHEMA.md` and `docs/projectibility-first.md`.

### Examples and bracket notation

Every meaning needs at least one example, each with a `form` and usually a `note`. Use `[brackets]` to mark the target construction inside a longer example; the browser renders the bracketed text in bold.

```yaml
# Standalone: the whole form is the target
- form: twenty-one
  note: Compound basic numerative

# In context: brackets identify the target
- form: "She bought twenty books, but I bought [twenty-two]."
  note: Fused determiner-head use
```

Prefer attested or naturalistic examples. Don't invent linguistic data you wouldn't defend in print.

### Relations

Link entries through `relatedConstructions`, each with an `id` and a `relationship` (`specialization-of`, `implements`, `contains`, `interfaces-with`, `overlaps-with`, `inherits-from`, `alternates-with`, `see-also`, …). Optional typing:

- `parthood` (`formal` | `semantic` | `functional`) for part-whole relations.
- `overlap-dimension` for `overlaps-with`.

Two conventions:

- **No redundant inverses.** If a child has `specialization-of` pointing to its parent, don't add `contains` on the parent; the browser computes incoming relations.
- **Category vs use.** A category gets one entry (`cardinal-noun-001`); its distinct uses get their own entries (`numerical-label-001`, `magnitude-quantifier-001`) linked with `specialization-of`. Category entries answer "what exists?"; use entries answer "how is it used?".

## Style guide

Terminology follows the *Cambridge Grammar of the English Language* (CGEL):

- **Determinative** is the lexical category; **determiner** is the syntactic function. *The dog* is an NP with a determinative in determiner function (no DP hypothesis).
- **Count/non-count**, not "mass".
- **Genitive**, not "possessive", for the *'s* construction.
- Keep syntactic categories and semantic categories distinct: a proper noun is a syntactic category, a proper name a semantic one.

Formatting: no leading/trailing whitespace in string fields; meaning keys sequential from `'1'`; relation references in meanings must point to existing top-level relations. The linter (`npm run lint`) checks these.

## Review process

1. Open a pull request with a focused change (one construction or one themed batch).
2. CI must pass (`npm run validate`).
3. A maintainer reviews for: schema conformance, CGEL-aligned terminology, example quality and bracket notation, relation hygiene (no redundant inverses, targets exist), and whether claimed projectibility or stabiliser metadata is backed by the cited diagnostics.
4. Expect discussion on analysis, not just format. Disagreement about an analysis is normal; entries can record open questions in `details` or `notes` fields.

If you're unsure whether something merits an entry, open an issue first and sketch the case: what predictions does membership license, and in which domain?

## Code of conduct

Be respectful and constructive. Critique analyses, not people; give evidence rather than authority; assume good faith from contributors at every level of experience. Harassment or personal attacks aren't tolerated. To report a problem, contact the maintainer through GitHub (issue or email listed on the profile). Maintainers may edit or reject contributions and will explain why.

## Citation

If you use this resource, please cite it as described in the [README](../README.md).

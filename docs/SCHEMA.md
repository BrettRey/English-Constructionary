# Construction Schema

This repository validates construction entries against `data/schemas/construction.json`. Use this document as the human-readable guide for authoring or editing YAML in `data/constructions/`.

## Required Top-Level Fields
- `id`: unique identifier matching `^[a-z-]+[0-9]{3}$` (example: `np-001`).
- `name`: human-readable construction name.
- `pattern`: formal syntactic/morphological pattern.
- `meanings`: numbered meanings keyed by integer strings (`"1"`, `"2"`, …).

## Meanings
Each meaning is an object in one of two forms:
1) **Definition form**
   - `definition` (string)
   - `examples` (array of `{ form, note? }`)
   - optional `details`, `relations`
2) **Implementation form**
   - `implements` (string, `construction-id.meaning-number`)
   - `specialization` (string)
   - `examples` (array of `{ form, note? }`)
   - optional `relations`

Example:
```yaml
meanings:
  1:
    definition: "Identifiable referent"
    examples:
      - form: "the dog"
        note: "Previously mentioned"
```

## Relations
`relations` is an optional object keyed by integer strings. Each relation includes:
- `construction` (string)
- `type` (enum; e.g., `specialization-of`, `implements`, `related-to`, `see-also`)
- optional `notes`

Meanings can reference these relations via their `relations` array.

## Optional Fields
- `constraints`: array of `{ type, description }` where `type` is one of `syntactic`, `morphological`, `semantic`, `pragmatic`, `structural`, `head`, `position`.
- `semanticType`: `reference`, `predication`, `modification`, or `quantification`.
- `relatedConstructions`: array of `{ id, relationship, notes? }` using the schema’s relationship enums.
- `hpc`: optional HPC metadata block (see below).
- `semanticRefs`: list of IDs in `data/indices/semantic-features.yaml` relevant to the construction.
- `syntacticRefs`: list of IDs in `data/indices/syntactic-diagnostics.yaml` relevant to the construction.

## HPC Metadata (`hpc`)
Use `hpc` to document mechanism-grounded cluster structure, stabilisers, and diagnostics. The stabiliser types are open-ended; add new types as needed with clear evidence.

Example:
```yaml
hpc:
  status: hpc
  cluster:
    core:
      - property: "Degree modification compatibility"
        diagnostics: ["accepts very/too/so", "supports -er/-est"]
        weight: high
    peripheral:
      - property: "Predicative-only adjectives"
        diagnostics: ["attributive position degraded"]
        weight: low
  stabilisers:
    - type: entrenchment
      evidence: "high-frequency degree frames"
    - type: acquisition
      evidence: "early acquisition of adjective templates"
  projectibility:
    scope: "new adjectives generalize to degree frames"
    evidence: "productivity of -er/-est and very"
    confidence: medium
  homeostasis:
    perturbations:
      - "reduced exposure to degree morphology weakens comparative usage"
  variation:
    activation_states:
      - context: "predicative vs attributive frame"
        effect: "acceptability shifts at boundary items"
    speaker_variation: "lexeme- and register-sensitive"
  boundaries:
    overlaps_with: ["preposition-001", "adverb-001"]
    known_boundary_items: ["near", "fast", "fun"]
  grain:
    level: meso
    parent_families: ["modifier-001"]
  coupling:
    linked_cluster: "semantic gradability"
    mechanism: "bidirectional inference between scale semantics and form"
  provisional: true
```

### Stabiliser Types (Non-exhaustive)
Common types include: `acquisition`, `entrenchment`, `alignment`, `transmission`, `functional-pressure`, `processing-economy`, `social-indexing`. New types are expected; record them directly with evidence.

## Semantic & Syntax Registries
Two non-construction registries live in `data/indices/`:
- `semantic-features.yaml`: shared semantic property clusters and diagnostics (e.g., definiteness, identifiability).
- `syntactic-diagnostics.yaml`: shared syntactic diagnostics (e.g., existential *there* pivot, partitive *of*, one-substitution).

Constructions can reference these via `semanticRefs` and `syntacticRefs` to avoid repeating long diagnostics across entries.

## CGEL Terminology
Use CGEL-aligned terms where applicable, e.g., **determinative** (lexical category) rather than **determiner** (function), and **genitive** rather than **possessive**.

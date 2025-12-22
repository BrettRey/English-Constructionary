# Construction Schema

This repository validates construction entries against `data/schemas/construction.json`. Use this document as the human-readable guide for authoring or editing YAML in `data/constructions/`.

## Theoretical Framework

### Constructions as Form-Meaning Pairings

In Construction Grammar, a construction is a conventional pairing of form and meaning. But form and meaning aren't separable components that get linked together – they're mutually constituting through bidirectional homeostatic mechanisms. Count morphosyntax cues individuated construals in comprehension; individuated construals license count morphosyntax in production. Deital morphology tends to mark definite referents; definite referents tend to receive deital marking. The pairing is maintained by mechanisms operating across both domains.

### The `type` Field: Projectability, Not Ontology

The `type` field (`syntactic`, `semantic`, `morphological`, `mixed`) indicates which domain provides **maximal projectability** for the cluster documented in that entry – not an ontological claim about what the entry "is made of."

- **Projectability** (from Boyd's HPC framework): A category is projectable if treating it as a natural kind supports reliable generalizations and predictions.
- **Deitality** is maximally projectable for the syntactician: knowing something is deital lets you predict distributional behaviour (partitive licensing, *there*-resistance, identificational hosting).
- **Definiteness** is maximally projectable for the semanticist: knowing something is definite lets you predict interpretive properties (identifiability, uniqueness, anaphoric accessibility).

Both clusters are real in Boyd's sense. Neither reduces to the other. The overlap is substantial but imperfect – which is why both categories exist and why separate entries documenting each are legitimate.

### Why Separate Entries for Related Clusters?

Entries like `n-proper-001` (type: syntactic) and `proper-name-001` (type: semantic) aren't redundant or poorly factored. They document different HPC kinds serving different explanatory purposes:

- `n-proper-001` documents the cluster maximally projectable for syntactic purposes: distributional properties, morphological behaviour, syntactic diagnostics
- `proper-name-001` documents the cluster maximally projectable for semantic purposes: interpretive properties, discourse functions, semantic diagnostics

Each cluster includes tendencies toward the other as part of what makes it a cluster (the syntactic cluster has semantic tendencies; the semantic cluster has formal tendencies). The `implements` or `realized-by` relations between entries document the conventional pairing that speakers rely on – how the clusters co-occur and what stabilises that co-occurrence.

### Construal vs Construction

Construal (e.g., individuation, definiteness-as-interpretation) is what licenses or is licensed by construction. It's a cognitive/semantic operation – how the speaker chooses to conceptualise a referent (treating a baby as a person or not, construing rice as mass or portions). Construal isn't the construction; it's what motivates choice among constructions.

The Constructionary documents:
1. **Constructions** – conventional form-meaning pairings with their diagnostics and mechanisms
2. **Semantic clusters** (in `type: semantic` entries) – the interpretive property clusters that constructions encode
3. **The interface** – via relations like `implements`, `realized-by`, `can-manifest-as`

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
- `formRefs`: list of IDs in `data/indices/form-features.yaml` relevant to the construction.
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
- `form-features.yaml`: shared form/lexical classes (e.g., single‑digit, decade, compound numeratives).
- `syntactic-diagnostics.yaml`: shared syntactic diagnostics (e.g., existential *there* pivot, partitive *of*, one-substitution).

Constructions can reference these via `semanticRefs`, `formRefs`, and `syntacticRefs` to avoid repeating long diagnostics across entries.

## CGEL Terminology
Use CGEL-aligned terms where applicable, e.g., **determinative** (lexical category) rather than **determiner** (function), and **genitive** rather than **possessive**.

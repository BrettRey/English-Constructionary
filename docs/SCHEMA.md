# Construction Schema

This repository validates construction entries against `data/schemas/construction.json`. Use this document as the human-readable guide for authoring or editing YAML in `data/constructions/`.

## Theoretical Framework

### Constructions as Form-Meaning Pairings

In Construction Grammar, a construction is a conventional pairing of form and meaning. But form and meaning aren't separable components that get linked together – they're mutually constituting through bidirectional mechanisms. Count morphosyntax cues individuated construals in comprehension; individuated construals license count morphosyntax in production. Deital morphology tends to mark definite referents; definite referents tend to receive deital marking. The pairing is maintained by mechanisms operating across both domains.

### Projectibility First

The framework is projectibility-first (Reynolds 2026, "Not every stable cluster is homeostatic"). A category documented here is a **projectible profile**: observing part of it licenses expectations about the rest (what observing some features licenses us to predict about others; Goodman 1955), for a declared field-relative purpose. Claims that the profile is *stable*, *network-ordered*, *maintained*, or *secured by corrective control* are four further evidential achievements. Each rung of that ladder needs its own evidence, and only corrective control earns the label "homeostatic". The earlier HPC framing of this document is deprecated; where older text or fields say "HPC", read "projectible kind" and check which rung the evidence actually supports.

### The `type` Field: Projectibility, Not Ontology

The `type` field (`syntactic`, `semantic`, `morphological`, `phonological`, `pragmatic`, `mixed`) indicates which domain provides **maximal projectibility** for the cluster documented in that entry – not an ontological claim about what the entry "is made of."

- **Deitality** is maximally projectible for the syntactician: knowing something is deital lets you predict distributional behaviour (partitive licensing, *there*-resistance, identificational hosting).
- **Definiteness** is maximally projectible for the semanticist: knowing something is definite lets you predict interpretive properties (identifiability, uniqueness, anaphoric accessibility).

Both clusters are projectible; neither reduces to the other. The overlap is substantial but imperfect – which is why both categories exist and why separate entries documenting each are legitimate. Field-relativity is scope, not truth: the field selects which question to ask; it doesn't make the projection succeed.

### Why Separate Entries for Related Clusters?

Entries like `n-proper-001` (type: syntactic) and `proper-name-001` (type: semantic) aren't redundant or poorly factored. They document different projectible kinds serving different explanatory purposes:

- `n-proper-001` documents the cluster maximally projectable for syntactic purposes: distributional properties, morphological behaviour, syntactic diagnostics
- `proper-name-001` documents the cluster maximally projectable for semantic purposes: interpretive properties, discourse functions, semantic diagnostics

Each cluster includes tendencies toward the other as part of what makes it a cluster (the syntactic cluster has semantic tendencies; the semantic cluster has formal tendencies). The `implements` or `realized-by` relations between entries document the conventional pairing that speakers rely on – how the clusters co-occur and what stabilises that co-occurrence.

### Construal vs Construction

Construal (e.g., individuation, definiteness-as-interpretation) is what licenses or is licensed by construction. It's a cognitive/semantic operation – how the speaker chooses to conceptualise a referent (treating a baby as a person or not, construing rice as mass or portions). Construal isn't the construction; it's what motivates choice among constructions.

The Constructionary documents:
1. **Constructions** – conventional form-meaning pairings with their diagnostics and mechanisms
2. **Semantic clusters** (in `type: semantic` entries) – the interpretive property clusters that constructions encode
3. **The interface** – via relations like `implements`, `realized-by`, `can-manifest-as`

### Mereological Framework

The Constructionary employs a typed mereology – part-whole relations that are dimension-specific and cross-cutting.

#### The Constructicon as Whole

Constructions are parts of **the constructicon**: the structured inventory of conventional form-meaning pairings that constitutes a speaker's grammatical knowledge. The constructicon isn't a list; it's a network with inheritance, overlap, and interface relations. Individual constructions are what the constructicon is made of; the constructicon is what makes individual constructions cohere.

#### Typed Parthood

A single parthood relation (≤) is too coarse. Construction A can be "part of" construction B in different senses:

| Parthood Type | Notation | Meaning | Example |
|---------------|----------|---------|---------|
| **Formal** | A ≤_form B | A's form is a subpattern of B's | N ≤_form Nom ≤_form NP |
| **Semantic** | A ≤_sem B | A's meaning specializes B's | definite-reference ≤_sem reference |
| **Functional** | A ≤_func B | A serves a functional role in B | determinative ≤_func NP (in determiner function) |

These don't always align. A determinative is formally contained in an NP but semantically operates on the whole NP's reference. Typed parthood captures this without forcing false choices.

In the schema, use the `parthood` field in relations to specify which dimension:
```yaml
relations:
  1:
    construction: np-001
    type: contains
    parthood: formal
    notes: NP formally contains Nom
```

#### Adjacency vs Containment

Not all systematic interactions are containment. The `interfaces-with` relation captures **adjacency**: constructions that interact bidirectionally without one containing the other.

- Deitality and definiteness are adjacent: deital forms cue definite interpretations; definite intentions license deital forms. Neither contains the other.
- Syntax and semantics at clause level are adjacent: syntactic structure constrains interpretation; intended interpretation shapes syntactic choice.

Use `interfaces-with` when:
- The interaction is bidirectional (each side influences the other)
- Neither construction is a proper part of the other
- The connection is systematic, not accidental

```yaml
relatedConstructions:
  - id: definiteness-001
    relationship: interfaces-with
    notes: Bidirectional form-meaning interface; see deitality paper
```

#### Constructions as Bundles

Following the mereology paper's ⟨P, M, T⟩ structure for subfields, constructions can be viewed as bundles across dimensions:

| Dimension | What it captures | Schema field |
|-----------|-----------------|--------------|
| **Form** | Phonological, morphological, syntactic pattern | `pattern`, `formRefs` |
| **Meaning** | Semantic content, interpretive properties | `meanings`, `semanticRefs` |
| **Function** | Discourse role, pragmatic contribution | `semanticType`, `constraints` |
| **Distribution** | Where the construction can appear | `syntacticRefs`, diagnostics |

The optional `dimensions` field makes this explicit:
```yaml
dimensions:
  form: "Det + Nom"
  meaning: "Referential, identifiable"
  function: "Argument, topic-worthy"
  distribution: "Appears in argument positions; hosts identification"
```

#### Typed Overlap

Two constructions can share parts without either containing the other. The `overlaps-with` relation should specify which dimension:

```yaml
relatedConstructions:
  - id: adjective-001
    relationship: overlaps-with
    overlap-dimension: formal
    notes: Shares prenominal modifier position
```

Overlap is pervasive and principled:
- **Formal overlap**: different constructions using the same structural slot
- **Semantic overlap**: different forms expressing related meanings
- **Functional overlap**: different constructions serving similar discourse roles

#### Intensional Mereology

Classical mereology describes structure but doesn't ask why parts cohere. **Intensional mereology** asks: what makes parthood real rather than stipulated?

For constructions, the answer is the stabilising mechanisms: bidirectional inference, entrenchment, acquisition, alignment, transmission. A construction that lacks stabilising mechanisms isn't a genuine part of the constructicon – it's a nonce formation or an analyst's invention. (Naming a stabiliser is a maintenance claim, not a control claim; see the `kind` block below.)

This connects to Newton's Third Law precedent: mereology as consistency constraint. Internal forces must cancel for a whole to be genuine. Analogously, a construction's form-meaning pairing must be stabilised by mechanisms for it to be a genuine part of the grammar.

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
- `kind`: optional projectibility-first kind metadata block (see below).
- `semanticRefs`: list of IDs in `data/indices/semantic-features.yaml` relevant to the construction.
- `formRefs`: list of IDs in `data/indices/form-features.yaml` relevant to the construction.
- `syntacticRefs`: list of IDs in `data/indices/syntactic-diagnostics.yaml` relevant to the construction.
- `lexiconRefs`: references into `data/lexicon/` (e.g. `gold/determinatives`) giving the construction's lexical membership; gold files carry reciprocal `constructions:` pointers.

## Kind Metadata (`kind`)
Use `kind` to record the kind claim for an entry: what the category licenses us to project, and which securing tier the recorded evidence has reached. The block replaces the earlier `hpc` block (renamed 2026-07-16); the migration mapping is at the end of this section.

The order of fields mirrors the diagnostic ladder:

1. **`projection`** – the point of the entry, declared before mechanisms. `target` states the field-relative inference the category supports; `evidence` says why it's reliable; `confidence` is `high`/`medium`/`low`. A projection should go beyond the diagnostics used to detect membership (predicting only your own membership tests is circularity, not projection).
2. **`secured`** – the highest rung the recorded evidence reaches: `stable` → `networked` → `maintained` → `controlled`. Each rung needs its own evidence. Co-occurrence doesn't establish network order; persistence doesn't establish a maintainer; a maintainer doesn't establish corrective control.
3. **`failure-mode`** – demotion flag: `thin` (too little content), `fat` (heterogeneous lump that needs splitting), `negative` (defined by absence).
4. **`profile`** – core and peripheral properties with their diagnostics and weights.
5. **`network`** – the ordering relation (core-to-derivative, conditioning, licensing) that explains *which* projections are licensed. Required for `secured: networked`.
6. **`stabilisers`** – named maintainers with evidence. The types are open-ended; common ones: `acquisition`, `entrenchment`, `alignment`, `transmission`, `functional-pressure`, `processing-economy`, `social-indexing`. Required for `secured: maintained`.
7. **`maintenance`** – removal counterfactuals: what should fragment or drift if a stabiliser weakens. This is still maintenance evidence, not control.
8. **`control`** – strict corrective control, the only thing that earns "homeostatic". All four marks: `perturbation` (what threatens the profile), `coupled-relation` (what the response pathway tracks), `response` (what changes lower-scale conditions), `preserved-relation` (the higher-scale relation kept projectible). Required for `secured: controlled`. Entrenchment and transmission can maintain a profile without controlling anything.
9. **`variation`**, **`boundaries`**, **`grain`**, **`coupling`** – as before: activation states and speaker variation; overlaps and boundary items; micro/meso/macro level and parent families; linked cluster and mechanism.
10. **`provisional`** – marks exploratory metadata, including tiers assigned during migration that haven't had a rung-by-rung review.

Example (deliberately stopping at the rung the evidence earns):
```yaml
kind:
  projection:
    target: "new gradable predicates generalize to degree frames"
    evidence: "productivity of -er/-est and periphrastic more/most"
    confidence: medium
  secured: stable
  profile:
    core:
      - property: "Scale comparison morphology/periphrasis"
        diagnostics: ["-er/-est", "more/most", "as X as"]
        weight: high
    peripheral:
      - property: "Measure phrase integration"
        diagnostics: ["two inches taller"]
        weight: medium
  stabilisers:
    - type: entrenchment
      evidence: "high-frequency degree templates reinforce usage"
  maintenance:
    perturbations:
      - "loss of degree morphology shifts toward periphrastic comparatives"
  boundaries:
    overlaps_with: ["adjective-001"]
    known_boundary_items: ["unique", "dead"]
  grain:
    level: meso
    parent_families: ["modification"]
  provisional: true
```
Here `secured: stable` because the projection evidence is distributional productivity; the stabilisers are named candidates (plausible support, not demonstrated removal counterfactuals), so `maintained` is not claimed, and nothing approaching corrective control is on record, so `controlled` would be an overclaim.

### Migration from `hpc` (2026-07-16)
- `hpc:` → `kind:`
- `status: hpc` → deleted; `secured` now records the earned tier (entries migrated with projection evidence got `secured: stable` and `provisional: true`)
- `status: thin | fat | negative` → `failure-mode`
- `status: uncertain` → `provisional: true`
- `cluster` → `profile`; `projectibility` → `projection` (`scope` → `target`); `homeostasis` → `maintenance`
- `control` and `network` are new, and empty until rung-specific evidence exists

## Semantic & Syntax Registries
Two non-construction registries live in `data/indices/`:
- `semantic-features.yaml`: shared semantic property clusters and diagnostics (e.g., definiteness, identifiability).
- `form-features.yaml`: shared form/lexical classes (e.g., single‑digit, decade, compound numeratives).
- `syntactic-diagnostics.yaml`: shared syntactic diagnostics (e.g., existential *there* pivot, partitive *of*, one-substitution).

Constructions can reference these via `semanticRefs`, `formRefs`, and `syntacticRefs` to avoid repeating long diagnostics across entries.

## CGEL Terminology
Use CGEL-aligned terms where applicable, e.g., **determinative** (lexical category) rather than **determiner** (function), and **genitive** rather than **possessive**.

# HPC Implications for the Constructionary

Purpose: translate the HPC (Homeostatic Property Cluster) view from the HPC book into concrete guidance for restructuring and improving the Constructionary. This is written for another model to follow when editing schema, entries, and indices.

## Core HPC commitments to encode
1) Constructions are real because they are maintained, not because they have definitions. Treat entries as clusters of co-occurring properties supported by mechanisms.
2) Projectibility and homeostasis are the two diagnostics. A construction should support induction (projectibility) and have identifiable stabilisers (homeostasis).
3) Boundaries are sharp but epistemically fuzzy. Gradience lives in typicality and stability, not in fuzzy membership.
4) Variation is signal, not noise. Treat register, context, and speaker variation as activation states of the same system.
5) Categories can overlap. Dual membership and overlapping basins are expected and should be represented explicitly.
6) Failure modes are real. Some labels are thin, fat, or negative. These should be marked, split, or reframed.
7) Grain matters. Do not force a single level of analysis; represent micro- and macro-constructions and their coupling.

## Recommended schema extension (add a new top-level `hpc` block)
Add an optional `hpc` object to `data/schemas/construction.json` and document it in `docs/SCHEMA.md`. Suggested shape:

```
hpc:
  status: hpc | thin | fat | negative | uncertain
  cluster:
    core:
      - property: "..."
        diagnostics: ["..."]
        weight: high | medium | low
    peripheral:
      - property: "..."
        diagnostics: ["..."]
        weight: medium | low
  stabilisers:
    - type: acquisition | entrenchment | alignment | transmission | functional-pressure | processing-economy | social-indexing | (other as needed)
      evidence: "corpus / experiment / usage pattern"
  projectibility:
    scope: "what generalises to what"
    evidence: "held-out tests / corpus transfer / speaker agreement"
    confidence: high | medium | low
  homeostasis:
    perturbations:
      - "what should change if a stabiliser weakens"
  variation:
    activation_states:
      - context: "register / discourse frame / constructional slot"
        effect: "how the form-meaning mapping shifts"
    speaker_variation: "who diverges and why"
  boundaries:
    overlaps_with: ["construction-id-001", "construction-id-002"]
    known_boundary_items: ["lexemes / subpatterns"]
  grain:
    level: micro | meso | macro
    parent_families: ["family-id"]
  coupling:
    linked_cluster: "semantic / morphosyntactic / pragmatic cluster"
    mechanism: "bidirectional inference / selectional fit / alignment"
```

If you do not want to modify the schema yet, store this block in a parallel doc or notes file per construction and migrate later.

## Entry-level instructions (apply to each construction)
For each construction YAML:
1) Replace definitional tone with cluster tone. Definitions should describe typical properties, not necessary/sufficient conditions.
2) List core vs peripheral properties. Use diagnostics to show how each property is observed (morphology, distribution, pragmatics).
3) Name stabilisers. At least two mechanisms should be listed with evidence or plausible support. The mechanism list is open-ended; add new types as needed.
4) Record projectibility. State what generalises (to new lexemes, new contexts, new speakers) and how strong the bet is.
5) Record perturbation expectations. What should weaken first if input/usage shifts?
6) Capture variation as activation states. Separate within-speaker context shifts from between-speaker differences.
7) Mark overlap. If dual membership is stable, link to overlapping constructions in `relations` and in `hpc.boundaries`.
8) Tag failure mode if applicable. If thin/fat/negative, mark `hpc.status` and add notes on next steps (split, merge, or reframe).
9) Set grain. Identify if the entry is a micro-construction, a family, or a macro-category.

## Failure-mode handling (specific actions)
- Thin classes: keep minimal entries, label as `thin`, and avoid building large inheritance from them. Treat as byproducts of other constructions unless new stabilisers are found.
- Fat classes: split into mechanistically coherent sub-constructions. For example, do not treat all adverbs as one cluster; separate at least manner vs degree vs sentence-level clusters.
- Negative classes: avoid entries that are defined by absence. Convert them into positive clusters or treat them as index filters only.

## Index restructuring (recommended new indices)
Add indices in `data/indices/` to support HPC structure:
- `hpc-status.yaml` (lists constructions by `hpc.status`)
- `stabilisers.yaml` (map stabiliser type to constructions)
- `boundary-overlaps.yaml` (explicit overlap graph)
- `families.yaml` (macro -> micro coupling and inheritance)

## Audit workflow (apply to the current inventory)
1) Start with high-level labels (e.g., adjective, adverb, noun, clause-type). Assign provisional `hpc.status`.
2) Identify fat classes and split them into subclusters with distinct stabilisers.
3) Identify thin classes (low frequency, no stabilisers) and mark as `thin` or demote to notes.
4) Identify negative classes (e.g., non-finite) and reframe as positive clusters or remove from construction list.
5) For each entry that survives, add stabilisers, diagnostics, and boundary links.
6) Update indices to reflect overlap and multiple inheritance.

## Concrete examples to guide restructuring
- Adverb: almost certainly fat. Split into at least manner, degree, and sentence adverb clusters; attach distinct stabilisers and diagnostics.
- Countability-related constructions: treat as a coupling between semantic individuation and morphosyntactic count-marking; encode bidirectional inference.
- Boundary constructions (e.g., items like fast/near/fun): keep explicit overlap links and note activation-state effects by context.

## Validation and tests (HPC-aligned)
- Projectibility check: test if cues transfer across corpora/registers or time slices.
- Homeostasis check: document what happens under perturbations (contact, reduced transmission, register shift).
- Variation check: confirm that boundary items show higher variance than core items.

## Minimal implementation path (if schema changes are deferred)
- Add `hpc` notes to `docs/` and reference them from `relations.notes`.
- Create a single `docs/hpc-audit.md` listing statuses and next steps per construction.
- Later migrate the notes into the schema once the structure stabilises.

Use this file as the working blueprint for any HPC-driven restructuring.

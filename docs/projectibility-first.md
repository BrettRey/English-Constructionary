# Projectibility-First Guidance for the Constructionary

Purpose: translate the projectibility-first framework (Reynolds 2026, "Not every stable cluster is homeostatic") into concrete guidance for editing schema, entries, and indices. This supersedes the earlier HPC blueprint (`hpc-implications.md`, removed 2026-07-16); the `hpc` metadata block it introduced is now the `kind` block (migration mapping in `SCHEMA.md`).

## Core commitments to encode

1) **Projectibility is the point.** A construction earns an entry because knowing part of its profile licenses reliable expectations about the rest, for a declared field-relative purpose. Mechanisms are the ground for why projection is reliable; they are not the payoff.
2) **The securing claims are separate achievements.** Stable, network-ordered, maintained, and control-secured come apart in practice. A profile can be stable and projectible without being controlled; a maintainer can hold a profile together without correcting anything.
3) **Only corrective control earns "homeostatic".** Everything below that rung is described as stable, ordered, or maintained – never as homeostatic.
4) **Boundaries are sharp but epistemically fuzzy.** Gradience lives in typicality and stability, not in fuzzy membership.
5) **Variation is signal, not noise.** Register, context, and speaker variation are activation states of the same system.
6) **Categories can overlap.** Dual membership and overlapping profiles are expected and should be represented explicitly.
7) **Failure modes are real.** Some labels are thin, fat, or negative. Mark, split, or reframe them; failed projection is a reason to scope, demote, split, or retire a category, not something to hide.
8) **Grain matters.** Represent micro-, meso-, and macro-constructions and their coupling; don't force one level of analysis.

## The diagnostic ladder

Five demands, in order. Each needs its own evidence; watch for *therefore/thereby/so* carrying a free upgrade.

| Demand | Evidence needed | Failure mode |
|--------|-----------------|--------------|
| **Projection target** | A field-relative inference, prediction, or intervention the category supports, declared before mechanisms | Kind talk with no statement of what the category lets us project |
| **Stable profile** | Projection from observed subcluster to unobserved features across relevant contexts | Mere recurrence; co-occurrence treated as projection |
| **Network order** | An ordering relation (core-to-derivative, conditioning, licensing) that explains which projections are licensed | Causal vocabulary applied to an unordered list |
| **Maintenance** | A stabiliser whose removal would make the profile fragment, drift, or dissolve | Persistence treated as if a maintainer had been specified |
| **Corrective control** | Perturbation-sensitive correction preserving a higher-scale relation through lower-scale variation | Stability, maintenance, or bare feedback treated as control |

**Stabiliser vs controller** is the sharpest discipline. Maintenance asks: what happens to the profile if the stabiliser is removed? Control asks: does some process register a perturbation and answer it, bringing the system back toward a projectible relation? Entrenchment, transmission, analogy, or a frozen accident can satisfy the first and fail the second. Corrective control has four marks, all required: (a) a perturbation threatening the profile, (b) a relation the response pathway is coupled to, (c) a response that changes lower-scale conditions, (d) preservation of the higher-scale relation that supports projection.

**Field-relativity is scope, not truth.** The field selects which question to ask; it doesn't make the projection succeed. "Projectible for a purpose" must not slide into "real because it's useful to someone."

## Entry-level instructions

For each construction YAML with a `kind` block:

1) **Declare the projection target first.** What does membership let us predict, and for whom (syntactician, semanticist, typologist)? An entry with mechanisms but no target is upside-down; fix the target before touching mechanisms.
2) **Make the projection non-trivial.** At least one licensed inference should go beyond the diagnostics used to detect membership (acquisition order, processing signature, diachronic behaviour, perturbation response, behaviour in untested frames). Predicting only your own membership tests is circularity.
3) **List core vs peripheral properties** in `profile`, each with observable diagnostics.
4) **Set `secured` to the rung the recorded evidence actually reaches**, and no higher. Say what's missing for the next rung rather than implying it.
5) **Name stabilisers as maintenance claims.** Evidence should bear on the removal counterfactual; record expected fragmentation or drift under `maintenance.perturbations`.
6) **Claim `controlled` only with all four marks in `control`.** Specify the corrector as a real system or practice (a monitored production loop, a metalinguistic sanction, an acquisition pathway) – never "the grammar corrects" (mereological slippage).
7) **Capture variation as activation states**; separate within-speaker context shifts from between-speaker differences.
8) **Mark overlap** in `boundaries` and with `overlaps-with` relations.
9) **Tag failure modes** (`thin`, `fat`, `negative`) and note next steps: split, merge, scope, or retire.
10) **Set grain** (micro/meso/macro) and parent families.

## Failure-mode handling

- **Thin**: keep minimal entries, avoid building inheritance on them; treat as byproducts of other constructions unless new evidence appears.
- **Fat**: split into projectibly coherent sub-constructions (e.g., don't treat all adjectives as one profile when gradable and classificatory diagnostics diverge; `adjective-001` carries this flag).
- **Negative**: don't define entries by absence; convert to positive profiles or demote to index filters.
- Also watch: **too local** (projects only in one register or lineage but exported as general), **wrong level**, **over-mechanized** (mechanism detail standing in for projection), **over-homeostatized** (control claimed from persistence).

## Index

`data/indices/kind-status.yaml` lists constructions by securing tier, failure mode, and missing projection targets. Keep it in sync when editing `kind` blocks.

## Migration state (2026-07-16)

All eight entries with legacy `hpc` blocks were migrated to `kind` with `provisional: true`. Entries with recorded projection evidence were assigned `secured: stable`; none currently earns `networked`, `maintained`, or `controlled` on the recorded evidence (stabiliser lists are candidate maintainers with plausibility support, not demonstrated removal counterfactuals). `directive-ostensive-001` and `vocative-001` lack projection targets and need them. `adjective-001` carries `failure-mode: fat` pending a split. The old `status: hpc` label was an overclaim under the current framework and was not carried over.

# Reciprocal Learning: English Constructionary & Linguistics Mereology

## 1. What the Constructionary can learn from the Mereology paper

**Source:** `literature/mereology.tex` (relative to Constructionary root)

The Constructionary is currently grappling with how to classify its entries (syntax vs. semantics vs. morphology) and how to relate them (inheritance, containment). The Mereology framework offers a formal scaffold to solve these exact problems.

*   **Typed Parthood & Lenses:** The paper argues for distinguishing **types of parthood** (phenomenal, methodological, theoretical) rather than forcing a single tree structure.
    *   *Application:* Instead of forcing a construction like `data/constructions/plural-s-001.yaml` to be *just* "morphological" or *just* "syntactic", it can be viewed through different lenses. It is a **morphological part** of the word-formation system, but a **semantic part** of the individuation system (countability). This validates the recent addition of the `type` field but suggests future need for multiple types or "facets" for complex entries.
*   **Interfaces as Adjacency, not Containment:** The paper suggests modeling interfaces (like Syntax-Semantics) as **contact zones** (`adj(x,y)`) rather than containment.
    *   *Application:* The relationship between `data/constructions/n-proper-001.yaml` (syntactic) and `data/constructions/proper-name-001.yaml` (semantic) is currently modeled as `related-to`. The Mereology framework would formalize this as an **adjacency** or **interface** relation. They don't "contain" each other; they systematically interact. This supports keeping them as distinct files linked by a relation, rather than merging them.
*   **Fusions:** The paper treats subfields as "bundles" of phenomena, methods, and theories.
    *   *Application:* A complex construction like `data/constructions/numerative-complex-001.yaml` is a fusion. It bundles **syntactic structure** (the phrase), **semantic composition** (arithmetic), and **lexical constraints** (0-99 vs >99). Recognizing it as a fusion of these distinct systems explains why it feels "complex" — it inherits constraints from multiple domains simultaneously.

## 2. What the Mereology paper can learn from the Constructionary

**Data Source:** `data/constructions/` (relative to Constructionary root)

The Constructionary serves as a concrete, data-rich **testbed** for the abstract principles in the Mereology paper.

*   **The "Object-Level" Mereology is Real:** The Mereology paper distinguishes "Object-level" (language parts) from "Meta-level" (disciplinary parts). The Constructionary **is** the object-level map.
    *   *Lesson:* The Constructionary's struggle with `noun` (syntax) vs. `name` (semantics) provides empirical proof that the "Object-level" is not a tidy tree either. It requires the same "cross-cutting" logic as the meta-level. The paper should explicitly state that **linguistic objects themselves** (not just subfields) require typed mereology.
*   **Granularity of "Parts":** The Constructionary shows that "parts" aren't just big blocks like "Syntax" and "Phonology." They are granular, specific constructions like `data/constructions/numerative-teen-001.yaml`.
    *   *Lesson:* A useful mereology must handle **micro-parts** (specific affixes) and **macro-parts** (whole grammars) in the same system. The Constructionary demonstrates how `part-of` relations scale from the bottom up.
*   **Formalizing "Adjacency":** The Constructionary's `relations` field (specifically `implements` and `related-to`) is a working implementation of the paper's `adj(x,y)` concept.
    *   *Lesson:* The Constructionary provides the data to define *types* of adjacency. `implements` is a vertical adjacency (form realizing meaning), while `related-to` might be horizontal adjacency (alternates within a system). The Mereology paper could refine its `adj` operator based on these real-world distinctions.

## Summary of Reciprocity
*   **Constructionary** gets a theoretical justification for its complex, non-tree-like cross-references and the `type` distinction.
*   **Mereology** gets a dataset of real linguistic objects that proves its core thesis: that language cannot be modeled as a single disjoint hierarchy.
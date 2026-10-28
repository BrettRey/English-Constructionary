# Construction-network expansion
Status: reviewed and implemented on 2026-07-16. The reviewed thirteen-entry scope expanded to fifteen after Brett's subsequent rulings that Question is a semantic category and that Tag Question combines a declarative or exclamative Anchor Clause with an auxiliary-headed, pronominal-Subject Tag Clause.
## Aim
Add a small set of high-degree construction nodes rather than a long list of isolated patterns. Each new entry must have its own projectible residue, use CGEL-compatible function labels, and connect to the existing constructicon through typed relations whose direction is justified.

The reviewed plan proposed thirteen entries in two tranches:

1. the missing Clause/VP backbone, a formally distinct clause-analogue construction, and CGEL's five major clause types;
  
2. four well-diagnosed argument-structure neighbours of the new ditransitive, caused-motion, and time-away entries.
  
## Discovery results
| Load-bearing assumption | Test | Result |
| --- | --- | --- |
| Clause and VP will be genuine hubs rather than decorative parents. | Inspect the roadmap and incoming/outgoing relation graph. | Confirmed. The roadmap ranks them first, and at least nine existing constructions are explicitly VP-internal while several clause-level entries currently lack a taxonomic home. |
| A generic `interrogative-clause` parent would improve the syntax. | Check CGEL's clause-type system. | Rejected. CGEL treats closed and open interrogatives as distinct primary clause types because their defining syntax differs; “interrogative” is mainly a semantic cover term. |
| A generic monotransitive VP would add useful constructional predictions. | Apply the residue test to the candidate profile. | Rejected for this tranche. Object presence alone does not yet support projections beyond the ordinary object diagnostics already needed by its specific children. |
| Path can be added without deciding disputed PP-internal attachments. | Check CGEL's realization and forcing evidence. | Confirmed if the entry is restricted to `Head:V + Comp:PP[locative, path]`. It makes no claim about a P taking a path PP complement. |
| The current `echo-question-001` already occupies the right place in the clause system. | Compare it with CGEL's declarative-question and echo-question sections. | Rejected. Its present declarative-syntax examples instantiate declarative questions. True echo questions are an overlay on independently determined clause types, including imperatives and closed interrogatives. |
### Inversions
- The backbone would fail if it merely duplicated `phrase-001`. To avoid that, `vp-001` must project from verb valency and clause-head distribution, while `clause-001` must project from Subject/Head organization, clause type, finiteness, and external clause distribution.
  
- The clause-type tranche would fail if it encoded characteristic speech acts as necessary meanings. Each entry will separate grammatical form from characteristic use: declaratives can ask questions, interrogatives can issue directives, and imperatives need not command.
  
- The relation network would fail if high degree were manufactured with vague `related-to` edges. Taxonomic, formal-parthood, realization, alternation, and interface edges will be used first; thematic similarity alone will not earn an edge.
  
- The argument-structure tranche would fail if ordinary lexical selection were mistaken for a construction. Each proposed entry therefore needs independent diagnostics: particle shift, intermediate-location/aspect contrasts, result-state predication, or the productive _one's way_ frame.
  
## Tranche A: phrasal backbone and clause type
### 1. `vp-001` — Verb Phrase
Pattern: `Head:V + (complements) + (modifiers)`.

Residue and projection: head-verb valency predicts the complement inventory and the VP's ability to head a Clause. Existing VP-level constructions will point child-to-parent with `specialization-of`: ditransitive, caused-motion, time-away, goal, source, perfect, and progressive, plus the four new argument-structure entries below where appropriate.
### 2. `clause-001` — Clause
Pattern: `(Subject +) Head:VP`, following {==Brett's definition==}{>>yes, this is going to be more or less by stipulation, just as phrase is a headed constituent by stipulation<<}{id="c1" by="user" at="2026-07-17T11:54:14.354Z"}. The Subject is optional; the VP is the immediate head and V the ultimate head. This is a definition, not merely the central case: a constituent without a VP head is not a Clause.

Connections: `specialization-of phrase-001`; formal containment of `vp-001`; interface with verb-number agreement and clause-level negation; parent of the five major clause types.
### 3. {==`clause-analogue-001`==}{>>how about clause-analogue-001 as a label?<<}{id="c2" by="user" at="2026-07-17T11:55:22.303Z"}
Pattern: `Non-headed constituent[clausal semantics]`.

This entry houses the constructions CGEL calls “verbless clauses”, such as phrase-only open questions and _what/how_ exclamatives. They can express propositions, questions, or exclamatory evaluations without thereby becoming Clauses: clausal semantics does not determine syntactic category.

Connections: formal contrast with `clause-001`; `see-also coordination-001` because both are non-headed constituent types without being the same construction; interfaces with `exclamation-001`, `exclamative-word-001`, and `interrogative-word-001`. It does not specialize `phrase-001`, since Phrase is defined as headed.
### 4–8. The five major clause types
| ID | Defining grammatical profile | Existing connections |
|---|---|---|
| `declarative-clause-001` | Default clause type, lacking the special markers of the other four; characteristically used for statements. | `scalar-recalibration-declarative-001`; new declarative-question node in a later pass or as a necessary correction during integration. |
| `closed-interrogative-clause-001` | Main-clause Subject–auxiliary inversion; subordinate *whether/if* pattern; characteristically expresses a closed question. | `echo-question-001` as a possible overlaid clause type, never as its parent. |
| `open-interrogative-clause-001` | Headed Clause containing an interrogative phrase; non-subject phrases normally front and trigger main-clause inversion, while interrogative subjects retain basic position. Phrase-only question counterparts belong to the clause-analogue construction. | `interrogative-word-001`, `indeterminate-word-001`, and `echo-question-001` by contrast/overlay. |
| `exclamative-clause-001` | Headed Clause with an initial exclamative phrase based on *what/how* and normally Subject–Predicator order. *What a disaster!* belongs instead to the clause-analogue construction. | `exclamative-word-001`, `exclamation-001`, and `indeterminate-word-001`. |
| `imperative-clause-001` | Plain-form V, optional second-person Subject, special *do* behavior, normally main-clause distribution. | `imperative-negation-do-001`, `exclamation-001`, and extra-clausal directive alternatives. |

All five point to `clause-001` with `specialization-of`. They are mutually exclusive values on the clause-type dimension; characteristic illocutionary force is not treated as a necessary condition.
### 9. Necessary integration correction: declarative question vs echo question
Add `declarative-question-001` for declarative syntax plus question prosody and epistemic bias (_They've finished?_). Rework `echo-question-001` to the actual overlay construction (_Give it to who? Did I use a what?_), which seeks repetition or clarification and can combine with more than one clause type. Repoint the scalar-recalibration and scalar-challenge links when their examples instantiate declarative questions rather than echoes.

Leaving the existing conflation in place would corrupt the new clause-type network.
### 9a–b. Semantic Question and Tag Question addendum
`question-001` is a semantic answer-set category, not a Clause type. `declarative-question-001`, `echo-question-001`, and `tag-question-001` specialize that semantic category while preserving the syntactic classification of their hosts. A Tag Question has a declarative or exclamative Anchor Clause plus a supplementary Tag Clause whose VP is headed by an auxiliary and whose Subject is a personal-pronoun NP. The two-Clause combination is not itself a Clause.
## Tranche B: connected argument-structure constructions
### 10. `verb-particle-object-001`
Pattern: `Head:V + Comp:PP[particle] + Od:NP ↔ Head:V + Od:NP + Comp:PP[particle]`.

Diagnostics: an unstressed pronoun must precede the particle; the particle and following NP do not form a constituent; PP fronting is unavailable. The particle is a one-word phrase, centrally a PP headed by an intransitive preposition.

Connections: parent/formal neighbour of `time-away-001`; `vp-001`, `pp-001`, `intransitive-preposition-001`, and literal-motion overlap with `caused-motion-001` where independently justified.
### 11. `path-complement-001`
Pattern: `Head:V + Comp:PP[locative, path]`.

Diagnostics: the PP is within _do so_ scope, identifies an intermediate location, can occur between source and goal, and on its path reading normally does not bound the event. Restrict the entry to VP hosting.

Connections: third sister of `source-complement-001` and `goal-complement-001`; possible final-dependent role in `caused-motion-001`; component of way-motion; contains `pp-001`; specializes `vp-001`.
### 12. `object-resultative-001`
Pattern: `Head:V + Od:NP[predicand] + PredComp:AdjP/NP[result-state]`.

Diagnostics: the predicative complement denotes the object's resultant state and reorients to the passive Subject. Optional resultatives remain complements; optional depictives are adjuncts. State-goal PPs such as _into a stupor_ remain locative complements, not predicative complements.

Connections: formal and semantic neighbour of `caused-motion-001`; explicit contrast with `ditransitive-vp-001`; `vp-001`, `np-001`, and `adjective-001`; boundary link to `time-away-001` only if the relation is diagnostic rather than thematic.
### 13. `way-motion-001`
Pattern: `Head:V + Od:NP[x's way] + Comp:PP[locative, path/goal]`.

Diagnostics: _x's way_ is the direct object; the productive frame licenses a manner verb and a change-of-location complement; central cases construe progress as effortful or stop-and-start rather than continuous.

Connections: `vp-001`, `np-001`, `genitive-s-001`, `path-complement-001`, `goal-complement-001`, and `caused-motion-001` as a contrast in which _way_, not the moving theme, is Od.
## Relation and evidence policy
- Child-to-parent `specialization-of`; never encode its inverse as parent `contains`.
  
- Whole-to-part `contains`, with `parthood: formal` for constituent structure.
  
- `interfaces-with` for genuine cross-domain interaction; `overlaps-with` only with a named overlap dimension.
  
- Reciprocal symmetric edges only where the current browser otherwise hides the relation from one endpoint.
  
- Every new entry gets CGEL `grounds` with a precise locator. Goldberg is added only where the source directly bears on a constructional generalization.
  
- Every `kind.secured` entry is mirrored in `data/indices/kind-status.yaml`; the clause-type and argument-structure family registries are updated without inventing inverse edges.
  
## Explicit deferrals
- Generic monotransitive and intransitive VP entries: defer until they have positive projectibility beyond presence/absence of an object.
  
- Recipient/beneficiary PP alternants, cognate objects, and a broader resultative family: good next candidates, but they should follow this backbone rather than compete with it.
  
- Relative and content clauses, AdjP, AdvP, and DP: still high-value roadmap items, but outside this coherent pass.
  
- No broad repair of legacy relation-direction errors; only touched nodes are normalized.
  
## Verification
1. Run schema validation and lint.
  
2. Audit all new/touched relation targets and filename/ID matches independently of the current validator.
  
3. Check family and kind-status mirrors.
  
4. Run the projectibility/HPC audit on every new `kind` block, stopping at `secured: stable` unless stronger evidence independently earns another rung.
  
5. Rebuild the manifest and graph after the concurrent graph-export work has settled; do not overwrite unrelated worktree changes.
  
## Review outcome
Brett approved the scope and supplied three controlling adjudications during implementation: Clause is strictly VP-headed; CGEL's “verbless clauses” are instead non-headed constructions with clausal semantics; and Question, including Tag Question, is semantic rather than a Clause type.

# CGEL compliance and argument-structure build
Status: reviewed in Roughdraft and implemented on 2026-07-16. Brett's review fixed the unit of analysis at VP level (`Head:V`, no Subject slot); a central verbal Clause is a phrase with optional Subject plus Head:VP, with verbless clauses recorded as a boundary case.

## Scope and source policy
I am treating “recent additions” as the changes after the resolved category audit at commit `c3136fc`. That captures the new preposition, path-complement, indeterminate, exclamation, ostensive, phrase, and coordination work without reopening findings Brett already adjudicated.

For the build, CGEL controls lexical categories, phrase categories, grammatical functions, and transitivity labels. Goldberg and Jackendoff control construction-specific licensing and semantic generalizations where CGEL does not posit the construction. This permits Construction Grammar entries that are not CGEL categories, but their internal syntax must still use CGEL labels.
## Compliance corrections
| Area | Current problem | Proposed correction | Grounding |
|---|---|---|---|
| *ago* | The audit initially followed CGEL p. 632 in treating *ten years* as a complement and then wrongly inferred that *ago* was not intransitive. | Retain *ago* as an intransitive preposition with an obligatory pre-head measure modifier. The parallel *ten years before Christ* shows that a measure phrase of this form can be a modifier; obligatoriness alone does not make it a complement. Record the departure from CGEL explicitly. | CGEL Ch. 7 §2.4, p. 613 supplies the measure-modifier parallel; the Constructionary rejects the tentative complement analysis in Ch. 7 §4.2, p. 632. |
| Intransitive prepositions | `intransitive-preposition-001` equates “no NP object” with “no complement at all.” | Broaden the entry to every objectless P use: complementless *away/outside*, PP-complement *owing to the rain*, predicative-complement *as satisfactory*, and clause-complement *because it rained*. | CGEL Ch. 4 §6, p. 272: an intransitive P may have a non-object complement. |
| PP structure | `pp-001` mentions only NP object/no object in its form field and calls the PP after *from* a “PP object.” | Generalize the pattern to `Head:P (+ Comp)`; distinguish NP objects from PP, AdvP, clause, and predicative complements; call *under the bed* a PP complement. | CGEL Ch. 2 §7, p. 58. |
| Goal/source | The path entries use semantic roles as if they were syntactic functions, and `source-complement-001` says source function recurs inside *from under the bed*. | Use **locative complement** for the CGEL function and **source/goal** for the role. Restrict the source construction to the higher `V + PP[source]` frame. The inner PP expresses the source location; it is a complement of *from*, not another source complement. Remove the inherited “forcing” argument from the goal entry. | CGEL Ch. 4 §5.2, pp. 257–59. |
| Interrogatives | The indeterminate entry says the full series fronts and that main interrogatives invert, including subject *who* in *Who came?* | State that interrogative subjects retain basic subject position; non-subject interrogative phrases are normally fronted and trigger inversion in main clauses; subordinate clauses do not normally invert; echoes may remain in situ. | CGEL Ch. 3 §2.1.2, pp. 95–96. |
| Ostensive NP | The proposed parent requires ordinary determination across both packagings, despite bare common-noun vocatives such as *Mum*, *driver*, and *buddy*. | Keep normal determination as a projection of directive-ostensives only. At the parent level, say that NP-internal licensing varies by packaging, with a specifically licensed bare-vocative pattern. Revise the kind projection/profile accordingly. | CGEL Ch. 5 §20.5, pp. 522–23. |
| Phrase | `phrase-001` omits Clause from the full list and says the immediate head is always a word. | Add central verbal Clause: it is a phrase headed by VP with an optional Subject; the VP is ultimately headed by V. Distinguish immediate phrasal heads from ultimate lexical heads and record verbless clauses as a boundary case. | CGEL Ch. 1, pp. 22–25. |
| Exclamative words | The semantic entry does not record the category split between interrogative and exclamative *what*. | State that exclamative *how* is adverbial, while exclamative *what* is an adjective functioning as external or internal modifier; interrogative *what* is a determinative in determiner use and a pronoun as NP head. | CGEL Ch. 5 §7.13, pp. 397–98; Ch. 10 §8.1, pp. 918–20. |
| Numeral POS default | `pos-defaults.yaml` sends magnitude lexemes such as *hundred* to nouns, contradicting the resolved audit and the rest of the current inventory. | Map basic and magnitude numeratives to the determinative adjudication; reserve the noun mapping for genuinely nominal uses such as plural *hundreds* and numerical labels. | `DECISIONS.md` audit triage and Reynolds (2026), Fig. 2. |
| Kind index | The index lists only five stable entries and still says the vocative and directive-ostensive lack projection targets. | Regenerate the stable/failure/needs-target lists from the actual `kind` blocks after the edits. | Repository projectibility-first policy. |

I will not treat the project-specific categories _indeterminate_, _deitality_, _ostensive NP_, or _exclamation_ as errors merely because CGEL does not posit them. I will add one boundary sentence to `exclamation-001` noting CGEL’s warning that “exclamation” is not a well-defined grammatical class, while preserving Brett’s explicit decision to model a pragmatic force profile. I will not demote its kind status in this pass.
## New construction 1: ditransitive VP
**ID:** `ditransitive-vp-001`  
**Pattern:** `Head:V + Oi:NP + Od:NP`

The entry will be syntactically defined: a VP whose verb head is followed by indirect object and direct object. The corresponding clause is the CGEL double-object construction. _I sent a copy to Sue_ instead contains a monotransitive VP with `Head–Od–Comp`; neither the to-PP nor _Sue_ is an indirect object.

The semantic side will record, but not use as the membership test, Goldberg’s caused-receipt prototype and its extensions. Separate meanings/examples will cover:

1. recipient/theme: _I sent Sue a copy_;
  
2. intended goods-beneficiary: _She baked Kim a cake_;
  
3. prevented receipt, source, or loss: _They refused Kim permission_, _They charged Ed ten dollars_, _It cost Mel his job_.
  

This grain avoids a false equation of “ditransitive” with transfer, trivalence, or CAUSE-RECEIVE. It also records lexeme- and sense-specific alternant classes, the fixed canonical `Oi–Od` order, the first/second passive contrast, and the fact that a sole object is `Od` even when its role resembles a ditransitive `Oi`.

The projectibility claim will stop at `secured: stable`: identifying an `Oi + Od` use predicts independent Oi/Od asymmetries in fronting, heavy postposing, predicand/control behavior, and passivization (CGEL Ch. 4 §4.3, pp. 248–51; lexical classes pp. 308–13). No network, maintenance, or homeostasis claim will be made.
## New construction 2: caused motion
**ID:** `caused-motion-001`  
**Pattern:** `Head:V + Od:NP[theme] + Comp:PP[locative: source/path/goal/direction/location]`

The CGEL analysis is one direct object plus an object-oriented locative complement—not two objects, an “oblique object,” or a predicative complement. Its central meaning is that the subject referent causes the object referent to move along/from/to the location or path expressed by the PP. The construction can license dependents not licensed by the verb’s ordinary valency.

Core examples will be:

- _He sneezed his tooth right across town_ (the user-requested, attested Munsch/Goldberg example);
  
- _She sneezed the foam off the cappuccino_;
  
- _Pat shoveled the hay into the wagon_.
  

The entry will distinguish the core caused-motion reading from caused-location, enabled-motion, and prevented-motion extensions. Its stable projection target is productive argument licensing: the form predicts a causer, theme, object-oriented locative complement, and caused-motion construal even with a normally intransitive verb. Grounding: CGEL pp. 257–59 and 684–88; Goldberg (2006), especially pp. 6, 33–35, 94, 98–100, 106–10. The containing Clause is a phrase with optional Subject plus Head:VP; the construction itself remains VP-internal.
## New construction 3: time-away
**ID:** `time-away-001`  
**Pattern:** `Head:V[activity construal] + Od:NP[time-period] + Comp:PP[particle, Head:away]`

The time NP is a construction-licensed direct object, not a temporal adjunct. _Away_ remains a CGEL preposition: it heads a one-word PP and, in this transitive clause, has particle use. “Particle” names the syntactic placement, not a lexical category.

The meaning is that an agentively engaged subject uses up a bounded interval by continuously or repeatedly carrying out the verbal activity. The heedless/pleasurable/time-wasting implication is defeasible, not the definition.

Examples will include _Bill slept the afternoon away_, _Saul sneezed the afternoon away_, and a passive example. Constraints will record the time-period object, exclusion of a separate lexically selected object, activity/iteration requirement, fixed _away_, canonical `V–NP–away` order, and limited particle shift with heavy NPs.

The stable projection target is independent of the surface identification: membership predicts direct-object behavior under passive/tough/ellipsis diagnostics, particle placement, and bounded time-use semantics despite absent verb-level object licensing. Grounding: Jackendoff (1997), pp. 534–43; CGEL Ch. 4 §6.2, pp. 280–84.
## Wiring and verification
I will add an `argument-structure` family containing the three new entries plus the corrected goal and source entries. Relations will connect caused motion to goal complementation and PP structure, time-away to intransitive-preposition/particle syntax, and ditransitive to caused motion as a contrasting argument-structure frame.

The implementation will touch only the three new YAML files, the high-confidence compliance files listed above, `families.yaml`, `kind-status.yaml`, the append-only correction in `DECISIONS.md`, and the generated web manifest. I will not add unsupported top-level source fields or invent dangling feature/diagnostic IDs.

Verification:

1. run `npm run validate` (schema plus projectibility lint);
  
2. rebuild the web manifest and rerun validation;
  
3. check every relation/index ID against an existing file;
  
4. inspect the final diff specifically for CGEL category/function separation and projectibility-tier overclaim.
  
## Assumptions tested before implementation
- **“Ditransitive” means caused receipt.** Falsified by CGEL’s source/loss/prevention uses; syntax defines the entry and the semantic network remains a tendency.
  
- **The inner PP in _from under the bed_ is another source complement.** Falsified by CGEL’s explicit analysis: _from_ marks source while _under the bed_ expresses the source location.
  
- **No object means no complement for P.** Falsified by objectless prepositions with PP, predicative, or clause complements.
  
- **The time NP is an adjunct.** Falsified by its object diagnostics and exclusion of another lexical object.
  
- **A stable construction licenses a higher securing tier.** Rejected. Each new entry claims only the stable rung supported by its own independent projections.

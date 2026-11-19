# Adopted emphatic polarity response family
<!-- SUMMARY: Emphatic polarity response entry and source mapping · status: published · updated: 2026-11-19 -->

The [Emphatic Polarity Response Family](../data/constructions/emphatic-polarity-response-001.yaml) groups documented combinations for comparison. Their range and internal category assignments remain open. Brett approved the entry and its three new source records on 14 November 2026.

```yaml
id: emphatic-polarity-response-001
name: Emphatic Polarity Response Family
pattern: "hell + yeah | shit + no | fuck + {yeah, yes, no} | fucking + {yes, no} | hell fucking no"
type: pragmatic
dimensions:
  form: "Documented linear combinations of an emphatic expression with a polarity response; the expanded hell fucking no is included without a commitment about its internal bracketing"
  meaning: "Emotional emphasis on the response expressed through yeah, yes or no"
  function: "An emphatic response, sometimes followed by a longer turn; the conversational action depends on context"
  distribution: "Independent response uses and documented turn-preface uses; excludes nominal answer expressions and questions presenting answer alternatives"
meanings:
  '1':
    definition: "Adds emotional emphasis to an affirmative or negative response while preserving the response orientation of yeah, yes or no"
    details: "This is a family of related local patterns, not a claim that every emphatic form combines freely with every response word. Norrick (2009: 880) analyzes hell in hell yeah and shit in shit no as intensifiers; the whole hell yeah or fuck yeah expression can function as a pragmatic marker before a longer turn. Intensifier describes an internal contribution, while pragmatic marker describes a use of the whole. Neither label settles lexical category. Following CGEL (2002: 848), response polarity must be distinguished from agreement, refusal and other conversational actions. Emotional emphasis need not raise epistemic certainty or express approval of the event."
    examples:
      - form: "hell yeah."
        note: "Published response token: Norrick (2009: 880), SCoSE Football; response to did you burn anything?"
        grounds:
          - source: norrick-2009
            locator: "p. 880, SCoSE Football"
            relation: attests
      - form: "[fuck yeah] it placed third in the derby in his year."
        note: "Published turn preface: Norrick (2009: 880), WSC DPC032; the excerpt ends before a further continuation"
        grounds:
          - source: norrick-2009
            locator: "p. 880, WSC DPC032"
            relation: attests
      - form: "Fuck yes!"
        note: "Published author example, not a corpus attestation: Mackenzie (2019: 69), example (43a)"
        grounds:
          - source: mackenzie-2019-expletive
            locator: "p. 69, example (43a)"
            relation: cites
      - form: "[Fuck no], you don’t care about the money."
        note: "Published scripted-dialogue example: Moreau (2024: 8), Table 3, Orange Is the New Black; preceding turn not supplied"
        grounds:
          - source: moreau-2024-subtitling
            locator: "p. 8, Table 3"
            relation: attests
      - form: "Fucking yes!"
        note: "COCA supplied concordance, Green Street Hooligans, year label 2005, MOV: response to a football-draw announcement; source/date metadata not independently checked"
        grounds:
          - source: coca
            locator: "Green Street Hooligans; COCA year 2005, MOV; supplied 2026-11-14"
            relation: attests
      - form: "Fucking no."
        note: "COCA supplied concordance, V/H/S Viral, year label 2014, MOV: response to Was he bleeding?; source/date metadata not independently checked"
        grounds:
          - source: coca
            locator: "V/H/S Viral; COCA year 2014, MOV; supplied 2026-11-14"
            relation: attests
      - form: "Hell fucking no."
        note: "COCA supplied concordance, The Bronze, year label 2015, MOV: negative response; source/date metadata not independently checked"
        grounds:
          - source: coca
            locator: "The Bronze; COCA year 2015, MOV; supplied 2026-11-14"
            relation: attests
constraints:
  - type: pragmatic
    description: "This is a provisional descriptive family. Its predictive advantage over listing the documented local patterns has not been established; no independent projection target or securing tier is claimed."
  - type: structural
    description: "The reversed sequence no shit has a different idiomatic interpretation (Norrick 2009: 881) and is outside this family."
  - type: structural
    description: "The pattern enumerates documented combinations, not a Cartesian product or an unrestricted slot-filling rule. The labels emphatic expression and polarity response specify contributions, not lexical categories."
  - type: pragmatic
    description: "Use is form-, context- and potentially variety-sensitive. Mackenzie (2019: 69, example 43) stars fucking yes/no; supplied COCA contexts attest both bare forms. Retain this source contrast without extending one judgment to all English speakers or claiming to know its cause."
  - type: structural
    description: "Norrick explicitly reports one intonation unit and primary stress on hell for the SCoSE hell yeah example. This does not establish a uniform stress rule for the other combinations. Commas do not determine intonation, Discourse Act boundaries or internal bracketing."
  - type: syntactic
    description: "Nominal answer expressions such as a big fucking yes/no are a separate environment. Their nominal packaging does not establish that bare response yes/no is nominal. Alternative questions such as yes or fucking no, no idea, no before a noun, and verbal fucking are also outside this entry."
  - type: structural
    description: "The internal analysis of hell fucking no remains open: the string alone does not decide nested modification, multiple emphatic dependents or a stored larger formula."
relatedConstructions:
  - id: exclamation-001
    relationship: overlaps-with
    overlap-dimension: functional
    notes: "Some emphatic responses have exclamatory force; response use alone does not establish the exclamation entry's prosodic and force profile"
grounds:
  - source: norrick-2009
    locator: "pp. 880-882"
    relation: cites
    note: "Distinguishes intensification inside the combination from pragmatic-marker use of the whole and from independent turn-initial markers"
  - source: cgel-2002
    locator: "pp. 558, 568, 848"
    relation: discusses
    note: "Expressive attributives, adjective/adverb pairs and context-dependent response actions; these comparisons do not classify the components of the present patterns"
  - source: mackenzie-2019-expletive
    locator: "p. 69, example (43)"
    relation: discusses
    note: "Permits fuck yes/no and stars fucking yes/no; the latter restriction does not cover the full supplied COCA range"
  - source: moreau-2024-subtitling
    locator: "p. 8, Table 3"
    relation: attests
    note: "Supplies fuck no with a following clause; the interjection label is the source's analysis, not an adopted lexical classification here"
```

## Adopted source and index mapping

The entry reuses `cgel-2002` and `coca` and adds three paper records to `data/sources.yaml`:

- `norrick-2009`: Neal R. Norrick (2009), “Interjections as pragmatic markers”, *Journal of Pragmatics* 41: 866–891. DOI: 10.1016/j.pragma.2008.08.005.
- `mackenzie-2019-expletive`: J. Lachlan Mackenzie (2019), “The syntax of an emotional expletive in English”, in *Emotion in Discourse*, pp. 55–86. DOI: 10.1075/pbns.302.03mac. Used at printed p. 69, example (43).
- `moreau-2024-subtitling`: Eponine Moreau (2024), “The Subtitling Strategies Adopted to Render the Four-Letter Words Fuck, Shit and Their Variants in the French Version of Orange Is the New Black: A Corpus-Based Study”, *Anglo Saxonica* 22(1), article 11: 1–15. DOI: 10.5334/as.195.

No new lexical inventory, category entry, reciprocal relation or hierarchy index is needed. The entry links to `exclamation-001` without modifying it. `clause-analogue-001` and `question-001` are relevant comparisons but do not warrant inheritance relations: the draft establishes neither the former's non-headed clause-like structure nor the latter's question meaning. The optional `kind` block is omitted: the present discovery examples do not establish a predictive advantage over listing local patterns or warrant a projection confidence or securing tier.

Existing entries/indices were searched for `hell yeah`, `fuck(ing)? (yes|no|yeah)`, `emphatic`, `interjection`, `polarity` and `taboo`; that search found no corresponding active entry. Nominal answer expressions remain a separate possible entry, outside this proposal.

## Verification and provenance

The entry matches the approved block above. The browser lists its three new sources and shows its overlap with `exclamation-001`. Validation and the browser and graph builds passed.

The COCA snippets and metadata come from the supplied concordances. The excerpts document occurrence in the given contexts.

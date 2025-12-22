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

## CGEL Terminology
Use CGEL-aligned terms where applicable, e.g., **determinative** (lexical category) rather than **determiner** (function), and **genitive** rather than **possessive**.

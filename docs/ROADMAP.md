# Roadmap

## Goal
Maintain a coherent, validated Construction Grammar (CxG) dataset with consistent structure, terminology, and contributor workflow.

## Definition of Done (per change)
- Entry conforms to `data/schemas/construction.json`.
- `npm run validate` passes.
- Terminology is CGEL-aligned where applicable.
- Cross-references in `data/indices/` are updated when relevant.

## Current Focus (Now)
- Normalize legacy entries to the current schema.
- Remove formatting/structure drift (meanings as objects, consistent relations).
- Eliminate YAML parse errors and empty files.

## Near Term (Next 2–4 weeks)
- Establish a single source of truth for contributor guidance (`docs/SCHEMA.md`, `AGENTS.md` if adopted).
- Add a lightweight review checklist for construction entries (structure, examples, relations, terminology).
- Expand core construction coverage with small, validated batches.

## Mid Term (1–3 months)
- Improve validation tooling (clearer errors, optional linting for style issues).
- Add metadata for coverage tracking (e.g., required core constructions list).
- Start a minimal web/UI preview once data is stable.

## Workflow
1) Edit or add YAML in `data/constructions/`.
2) Update `data/indices/` if relations/implementations change.
3) Run `npm run validate`.
4) Commit with a concise, descriptive message.

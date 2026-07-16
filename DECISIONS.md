# Decisions Log
<!-- SUMMARY: Append-only decision record for the English Constructionary · status: active · updated: 2026-07-16 -->

Append-only record of project decisions. Agents: add an entry whenever a non-trivial decision is made during a session (structural changes, venue choices, theoretical commitments, scope changes, reviewer feedback acted on). Keep entries short.

Format: `## YYYY-MM-DD` then bullet points with **bold topic** and brief rationale.

---

## 2026-07-16

- **Projectibility-first supersedes HPC framing.** Per Brett: public-facing docs describe the framework as projectibility-first (projectibility is the target of kind claims; homeostasis is the strictest rung of a diagnostic ladder, per Reynolds 2026, "Not every stable cluster is homeostatic"). The schema's `hpc` block stays for now as a legacy field name, with `projectibility` treated as its primary subfield. CONTRIBUTING.md written in these terms; CLAUDE.md/SCHEMA.md/STATUS.md still carry the old framing and need a pass.
- **Public deployment via GitHub Pages + CI.** Static browser deploys from a workflow (`pages.yml`); `validate.yml` runs schema validation + lint on every push/PR. `web/app.js` gained base-path resolution so root-absolute manifest paths work under `/<repo>/`. Untracked `literature/` (CGEL PDF excerpts, copyrighted) stays out of the repo and the site; the manifest builder now drops empty sections.


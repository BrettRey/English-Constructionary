#!/usr/bin/env node
// Checks reader editions against their entries with Codex (a different model
// family from the Claude drafters), through the portfolio's read-only wrapper
// tools/codex/bin/codex-readonly. Same criteria and record format as
// check-editions.js; entries go to Codex in batches.
//
//   node scripts/check-editions-codex.js --out <dir> [--ids a,b] [--editions-dir <dir>]
//        [--batch 20] [--concurrency 3] [--write]

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const OUT = path.resolve(arg('--out') || '');
if (!arg('--out')) { console.error('--out <dir> is required'); process.exit(2); }
const EDDIR = path.resolve(arg('--editions-dir', path.join(ROOT, 'data/editions')));
const BATCH = Number(arg('--batch', '20'));
const CONC = Number(arg('--concurrency', '3'));
const WRITE = argv.includes('--write');
const WRAPPER = path.resolve(ROOT, '../codex/bin/codex-readonly');
fs.mkdirSync(OUT, { recursive: true });

const fileById = new Map();
for (const f of fs.readdirSync(path.join(ROOT, 'data/constructions')).filter((x) => x.endsWith('.yaml'))) {
  const id = (yaml.load(fs.readFileSync(path.join(ROOT, 'data/constructions', f), 'utf8')) || {}).id;
  if (id) fileById.set(id, f);
}
const ids = arg('--ids') ? arg('--ids').split(',') : fs.readdirSync(EDDIR).filter((f) => f.endsWith('.yaml')).map((f) => f.slice(0, -5)).sort();
const batches = [];
for (let i = 0; i < ids.length; i += BATCH) batches.push(ids.slice(i, i + BATCH));

const CRITERIA = `You are checking plain-language reader editions of a linguistics dictionary entry against the entry itself. Be adversarial: your job is to find real problems, not to approve. Report only problems you can point to with an exact quotation.

The editions are "curious" for interested adults, "teacher" for language teachers and, where present, "child" for readers aged 8 to 11. List every statement in the editions that:
- contradicts the entry (kind: contradiction);
- states something the entry doesn't support: a grammatical claim it doesn't make, or history, frequency, region, statistics or a named scholar it doesn't mention (kind: unsupported);
- presents an example as unacceptable, odd or wrong when the entry doesn't (kind: new_judgment);
- presents an analysis as settled when the entry calls it provisional, debated or open (kind: overstated);
- in the child edition, is unsuitable for a child aged 8 to 11 or too hard to follow (kind: child_unsuitable).

Do not report: leaving things out, plain-language paraphrase that keeps the meaning, ordinary constructed example sentences that are clearly acceptable English, the drafter_note field, or matters of style. A widely used textbook term offered in the teacher "terms" field as "sometimes called" is not a problem if it maps accurately onto the entry's own term.

Severity: "high" for a contradiction, an invented fact, a new judgment or unsuitable child content; "low" for a borderline wording.`;

function prompt(batch) {
  const list = batch.map((id) => `- ${id}: entry data/constructions/${fileById.get(id) || `${id}.yaml`}; editions ${path.relative(ROOT, path.join(EDDIR, `${id}.yaml`))}`).join('\n');
  return `${CRITERIA}

Read each pair of files below (paths are relative to the current directory). Check every id; don't skip any, and keep the same care for the last as for the first. You cannot edit files; don't try.

${list}

Reply with one JSON array and nothing else, one object per id, in this form:
[{"id": "...", "verdict": "pass" or "fail", "issues": [{"edition": "curious|teacher|child", "field": "...", "quote": "exact words from the edition", "kind": "...", "severity": "high|low", "explanation": "one sentence"}]}]
Use "fail" if and only if the id has at least one high-severity issue.`;
}

function runCodex(text) {
  return new Promise((resolve) => {
    const p = spawn(WRAPPER, [ROOT], { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (code) => resolve({ code, out, err }));
    p.stdin.end(text);
  });
}

function parseArray(text) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end < start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

async function runBatch(batch, n) {
  const t0 = Date.now();
  let parsed = null;
  let last = { err: '' };
  for (let attempt = 0; attempt < 2 && !parsed; attempt += 1) {
    last = await runCodex(prompt(batch));
    parsed = parseArray(last.out);
  }
  const model = ((last.err.match(/model:\s*([^\s]+)/) || [])[1]) || 'codex default';
  const byId = new Map((parsed || []).map((r) => [r.id, r]));
  for (const id of batch) {
    const r = byId.get(id) || null;
    const record = { id, provider: 'codex', model, date: new Date().toISOString(), result: r ? { verdict: r.verdict, issues: r.issues || [] } : null, error: r ? undefined : (parsed ? 'missing from Codex reply' : `unparseable reply: ${last.err.slice(-300)}`) };
    fs.writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify(record, null, 2));
    if (WRITE && r) {
      const edFile = path.join(EDDIR, `${id}.yaml`);
      const ed = yaml.load(fs.readFileSync(edFile, 'utf8'));
      const high = (r.issues || []).filter((i) => i.severity === 'high');
      ed.checked = { date: record.date.slice(0, 10), model: `codex (${model})`, result: high.length ? 'flagged' : 'pass' };
      if (high.length) ed.checked.note = high.map((i) => `${i.edition}.${i.field}: ${i.kind}: ${i.explanation}`).join(' | ').slice(0, 900);
      fs.writeFileSync(edFile, yaml.dump(ed, { lineWidth: -1, noRefs: true }));
    }
    console.log(`${id}: ${r ? `${r.verdict} (${(r.issues || []).length} issues)` : 'ERROR'}`);
  }
  console.log(`# batch ${n} (${batch.length} ids) took ${Math.round((Date.now() - t0) / 1000)}s, model ${model}`);
}

(async () => {
  const queue = batches.map((b, i) => [b, i]);
  await Promise.all(Array.from({ length: Math.min(CONC, queue.length) }, async () => {
    while (queue.length) { const [b, i] = queue.shift(); await runBatch(b, i); }
  }));
})();

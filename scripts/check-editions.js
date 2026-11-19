#!/usr/bin/env node
// Checks reader editions against their construction entries with a second
// model family (default z-ai/glm-5.3-flash through tools/openrouter/bin/orx).
// The checker looks for contradictions, unsupported claims, new acceptability
// judgments, overstated certainty and (for the child edition) unsuitable text.
//
//   node scripts/check-editions.js --out <dir> [--ids a,b] [--editions-dir <dir>]
//        [--concurrency 6] [--write] [--provider openrouter|explabs] [--model <id>]
//
// Results go to <out>/<id>.json. With --write, each checked edition file gets a
// `checked` block: result pass (no high-severity issue) or flagged. Flagged files
// don't render on the site until fixed and rechecked.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const OUT = arg('--out');
if (!OUT) { console.error('--out <dir> is required'); process.exit(2); }
const EDDIR = path.resolve(arg('--editions-dir', path.join(ROOT, 'data/editions')));
const CONC = Number(arg('--concurrency', '6'));
const PROVIDER = arg('--provider', 'openrouter');
const MODEL = arg('--model', PROVIDER === 'explabs' ? 'glm-5.3' : 'z-ai/glm-5.3-flash');
const WRITE = argv.includes('--write');
// Cap the output: an uncapped request reserves the provider's maximum (131,072
// tokens) against the account, and parallel reservations exhaust the balance.
const MAX_TOKENS = arg('--max-tokens', '16000');
const ORX = path.resolve(ROOT, '../openrouter/bin/orx');
const ids = arg('--ids') ? arg('--ids').split(',') : fs.readdirSync(EDDIR).filter((f) => f.endsWith('.yaml')).map((f) => f.slice(0, -5)).sort();
fs.mkdirSync(OUT, { recursive: true });
const entryFileById = new Map();
for (const f of fs.readdirSync(path.join(ROOT, 'data/constructions')).filter((x) => x.endsWith('.yaml'))) {
  const id = (yaml.load(fs.readFileSync(path.join(ROOT, 'data/constructions', f), 'utf8')) || {}).id;
  if (id) entryFileById.set(id, f);
}

const SYSTEM = 'You check plain-language reader editions of a linguistics dictionary entry against the entry itself. Be adversarial: your job is to find real problems, not to approve. Report only problems you can point to with an exact quotation.';
const INSTRUCTION = `Below are (1) a dictionary entry for an English construction, in YAML, and (2) reader editions derived from it: "curious" for interested adults, "teacher" for language teachers and, if present, "child" for readers aged 8 to 11.

List every statement in the editions that:
- contradicts the entry (kind: contradiction);
- states something the entry doesn't support: a grammatical claim it doesn't make, or history, frequency, region, statistics or a named scholar it doesn't mention (kind: unsupported);
- presents an example as unacceptable, odd or wrong when the entry doesn't (kind: new_judgment);
- presents an analysis as settled when the entry calls it provisional, debated or open (kind: overstated);
- in the child edition, is unsuitable for a child aged 8 to 11 or too hard to follow (kind: child_unsuitable).

Do not report: leaving things out, plain-language paraphrase that keeps the meaning, ordinary constructed example sentences that are clearly acceptable English, or matters of style.

Severity: "high" for a contradiction, an invented fact, a new judgment or unsuitable child content; "low" for a borderline wording.

Reply with JSON only, no prose:
{"verdict": "pass" or "fail", "issues": [{"edition": "curious|teacher|child", "field": "...", "quote": "exact words from the edition", "kind": "...", "severity": "high|low", "explanation": "one sentence"}]}
Use "fail" if and only if there is at least one high-severity issue.`;

function runOrx(promptFile, outFile) {
  return new Promise((resolve) => {
    const p = spawn(ORX, ['ask', '-p', PROVIDER, '-m', MODEL, '--no-fallback', '--no-stream', '--max-tokens', MAX_TOKENS, '--timeout', '900', '-s', SYSTEM, '-f', promptFile, '-o', outFile, INSTRUCTION], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (code) => resolve({ code, err }));
  });
}

function parseReply(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

async function checkOne(id) {
  const entryText = fs.readFileSync(path.join(ROOT, 'data/constructions', entryFileById.get(id) || `${id}.yaml`), 'utf8');
  const edFile = path.join(EDDIR, `${id}.yaml`);
  const edText = fs.readFileSync(edFile, 'utf8');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cx-check-'));
  const promptFile = path.join(tmp, 'input.txt');
  fs.writeFileSync(promptFile, `=== ENTRY (${id}) ===\n${entryText}\n\n=== READER EDITIONS ===\n${edText}\n`);
  const outFile = path.join(tmp, 'reply.txt');
  let result = null;
  let lastErr = '';
  for (let attempt = 0; attempt < 2 && !result; attempt += 1) {
    const { code, err } = await runOrx(promptFile, outFile);
    lastErr = err.slice(-400);
    if (code === 0 && fs.existsSync(outFile)) result = parseReply(fs.readFileSync(outFile, 'utf8'));
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  const cost = (lastErr.match(/cost ([0-9.e-]+)/) || [])[1];
  const record = { id, provider: PROVIDER, model: MODEL, date: new Date().toISOString(), cost: cost ? Number(cost) : undefined, result, error: result ? undefined : lastErr || 'unparseable reply' };
  fs.writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify(record, null, 2));
  if (WRITE && result) {
    const high = (result.issues || []).filter((i) => i.severity === 'high');
    const verdict = high.length ? 'flagged' : 'pass';
    const ed = yaml.load(edText);
    ed.checked = { date: record.date.slice(0, 10), model: MODEL, result: verdict };
    if (high.length) ed.checked.note = high.map((i) => `${i.edition}.${i.field}: ${i.kind}: ${i.explanation}`).join(' | ').slice(0, 900);
    fs.writeFileSync(edFile, yaml.dump(ed, { lineWidth: -1, noRefs: true }));
  }
  const n = result ? (result.issues || []).length : -1;
  console.log(`${id}: ${result ? `${result.verdict} (${n} issue${n === 1 ? '' : 's'})` : 'ERROR'}`);
  return record;
}

(async () => {
  const queue = [...ids];
  const workers = Array.from({ length: Math.min(CONC, queue.length) }, async () => {
    while (queue.length) await checkOne(queue.shift());
  });
  await Promise.all(workers);
})();

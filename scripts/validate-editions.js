// Validates data/editions/*.yaml: the curious-reader, teacher and child
// editions of construction entries. Beyond the JSON Schema, it enforces the
// grounding rules for plain-language editions:
//   - an example marked `from: entry` must match an example in the entry;
//   - an example marked unacceptable must come from the entry, starred there;
//   - curious and child texts use no star notation, and state no numbers,
//     dates or history the entry doesn't contain;
//   - teacher `watch_for` items make no frequency or first-language claims;
//   - child texts avoid crude or violent words;
//   - no em-dashes or double hyphens anywhere.
// Usage: node scripts/validate-editions.js [id ...]   (no ids: all files)
// Exit status 1 on any error. Warnings (style tics) don't fail.

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');

const root = path.join(__dirname, '..');
const editionsDir = path.join(root, 'data/editions');
const constructionsDir = path.join(root, 'data/constructions');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'data/schemas/edition.json'), 'utf8'));
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
// Entries are keyed by their id field; a few file names differ from the id.
const entryFileById = new Map();
for (const f of fs.readdirSync(constructionsDir).filter((x) => x.endsWith('.yaml'))) {
  const id = (yaml.load(fs.readFileSync(path.join(constructionsDir, f), 'utf8')) || {}).id;
  if (id) entryFileById.set(id, f);
}

const STAR = /[∗*]/;
const norm = (s) => String(s)
  .replace(/[\[\]“”"‘’'`]/g, '')
  .replace(/^[\s∗*?#%]+/, '')
  .replace(/\s+/g, ' ')
  .replace(/[.?!,;:]+$/g, '')
  .trim()
  .toLowerCase();

function walkStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => walkStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => walkStrings(v, out));
  return out;
}

function entryExamples(entry) {
  const forms = [];
  for (const m of Object.values(entry.meanings || {})) {
    for (const ex of m.examples || []) if (ex && ex.form) forms.push(String(ex.form));
  }
  return forms;
}

// Starred fragments anywhere in the entry text, e.g. "not ∗much enough money".
function starredFragments(entry) {
  const frags = [];
  for (const s of walkStrings(entry)) {
    const re = /[∗*]\s*([^.;,()\]]+)/g;
    let m;
    while ((m = re.exec(s))) frags.push(norm(m[1]));
  }
  return frags.filter((f) => f.length >= 3);
}

function matches(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  const words = short.split(' ').length;
  return long.includes(short) && (words >= 4 || short.length >= long.length * 0.5);
}

const HISTORY = /\b(centur(?:y|ies)|invented|originally|etymolog\w*|old english|middle english|latin|greek|shakespeare|medieval|ancient|first (?:used|recorded|appeared))\b/gi;
const FREQUENCY = /\b(often|usually|commonly|frequently|typically|tends? to|most|many|speakers of|first language|l1|mother tongue|native language|always|never)\b/i;
const CRUDE = /\b(fuck\w*|shit\w*|damn\w*|hell|bloody|bastard|piss\w*|arse|ass|crap|sex\w*|kill\w*|die[ds]?|dead|blood\w*|gun\w*)\b/i;
const TICS = /\b(delve\w*|fascinating|tapestry|showcas\w*|testament|pivotal|vibrant|crucial|nuanced|in short|it'?s worth noting|intricate)\b/i;

function checkFile(file) {
  const errors = [];
  const warnings = [];
  let ed;
  try {
    ed = yaml.load(fs.readFileSync(path.join(editionsDir, file), 'utf8'));
  } catch (e) {
    return { errors: [`YAML parse error: ${e.message}`], warnings };
  }
  if (!validate(ed)) {
    for (const e of validate.errors) errors.push(`schema ${e.instancePath || '/'} ${e.message}`);
    return { errors, warnings };
  }
  if (`${ed.id}.yaml` !== file) errors.push(`id ${ed.id} doesn't match file name`);
  const entryPath = path.join(constructionsDir, entryFileById.get(ed.id) || `${ed.id}.yaml`);
  if (!fs.existsSync(entryPath)) return { errors: [...errors, `no construction entry ${ed.id}`], warnings };
  const entry = yaml.load(fs.readFileSync(entryPath, 'utf8'));
  const entryText = walkStrings(entry).join('\n').toLowerCase();
  const entryNorm = walkStrings(entry).map(norm).join(' | ');
  const entryNumbers = new Set(entryText.match(/\d+(?:[.,:]\d+)*/g) || []);
  const exForms = entryExamples(entry).map(norm);
  const starred = starredFragments(entry);
  const starredForms = entryExamples(entry).filter((f) => STAR.test(f.trim()[0] || '')).map(norm);

  const checkExamples = (list, where) => {
    (list || []).forEach((ex, i) => {
      const n = norm(ex.text);
      const quoted = n.split(' ').length >= 4 && entryNorm.includes(n);
      if (ex.from === 'entry' && !quoted && !exForms.some((f) => matches(n, f)) && !starred.some((f) => matches(n, f))) {
        errors.push(`${where}[${i}] marked from: entry but matches no entry example: "${ex.text}"`);
      }
      if (ex.acceptable === false) {
        if (ex.from !== 'entry') errors.push(`${where}[${i}] unacceptable example must come from the entry: "${ex.text}"`);
        else if (![...starred, ...starredForms].some((f) => matches(n, f))) errors.push(`${where}[${i}] unacceptable example isn't starred in the entry: "${ex.text}"`);
      }
      if (ex.from === 'constructed' && STAR.test(ex.text)) errors.push(`${where}[${i}] constructed example carries a star: "${ex.text}"`);
    });
  };

  checkExamples(ed.curious.examples, 'curious.examples');
  checkExamples(ed.teacher.examples, 'teacher.examples');
  checkExamples(ed.teacher.contrasts, 'teacher.contrasts');
  if (ed.child) checkExamples(ed.child.examples, 'child.examples');

  const plain = [['curious', ed.curious]];
  if (ed.child) plain.push(['child', ed.child]);
  for (const [name, block] of plain) {
    for (const s of walkStrings(block)) {
      if (STAR.test(s)) errors.push(`${name}: star notation in a plain edition: "${s.slice(0, 60)}"`);
    }
    // Prose only: constructed examples may contain ordinary numbers (Gate 12).
    const prose = Object.entries(block).filter(([k]) => k !== 'examples').map(([, v]) => v);
    for (const s of walkStrings(prose)) {
      for (const d of s.match(/\d+(?:[.,:]\d+)*/g) || []) if (!entryNumbers.has(d)) errors.push(`${name}: number ${d} isn't in the entry`);
      const f = s.match(FREQUENCY);
      if (f) warnings.push(`${name}: check frequency word "${f[0]}"`);
      let m;
      HISTORY.lastIndex = 0;
      while ((m = HISTORY.exec(s))) if (!entryText.includes(m[1].toLowerCase())) errors.push(`${name}: history claim "${m[1]}" isn't in the entry`);
    }
  }
  if (ed.child) {
    for (const s of walkStrings(ed.child)) {
      const m = s.match(CRUDE);
      if (m) errors.push(`child: unsuitable word "${m[0]}"`);
    }
    if (ed.child.explain.split(/\s+/).length > 70) errors.push('child.explain is over 70 words');
  }
  for (const s of walkStrings([ed.teacher.summary, ed.teacher.explain, ed.teacher.activity || ''])) {
    const f = s.match(FREQUENCY);
    if (f) warnings.push(`teacher: check frequency word "${f[0]}"`);
  }
  (ed.teacher.watch_for || []).forEach((w, i) => {
    const m = w.match(FREQUENCY);
    if (m) errors.push(`teacher.watch_for[${i}] makes a frequency or first-language claim ("${m[0]}")`);
  });
  for (const s of walkStrings(ed)) {
    if (/—|--/.test(s)) errors.push(`em-dash or double hyphen: "${s.slice(0, 60)}"`);
    const t = s.match(TICS);
    if (t) warnings.push(`style tic "${t[0]}"`);
  }
  const words = (s) => String(s || '').split(/\s+/).filter(Boolean).length;
  if (words(ed.curious.body) > 200) errors.push('curious.body is over 200 words');
  if (words(ed.curious.summary) > 40) errors.push('curious.summary is over 40 words');
  if (words(ed.teacher.explain) > 200) errors.push('teacher.explain is over 200 words');
  if (!ed.curious.examples.length) errors.push('curious.examples is empty');
  return { errors, warnings };
}

if (!fs.existsSync(editionsDir)) {
  console.log('No editions directory.');
  process.exit(0);
}
const wanted = process.argv.slice(2);
const files = fs.readdirSync(editionsDir)
  .filter((f) => f.endsWith('.yaml'))
  .filter((f) => !wanted.length || wanted.includes(f.replace(/\.yaml$/, '')))
  .sort();
let errorCount = 0;
for (const file of files) {
  const { errors, warnings } = checkFile(file);
  if (errors.length) {
    errorCount += errors.length;
    console.error(`\n${file}:`);
    errors.forEach((e) => console.error(`  - ${e}`));
  }
  if (warnings.length) console.warn(`${file}: warnings: ${warnings.join('; ')}`);
}
if (wanted.length) {
  const missing = wanted.filter((id) => !files.includes(`${id}.yaml`));
  if (missing.length) console.warn(`No edition file yet for: ${missing.join(', ')}`);
}
if (errorCount) {
  console.error(`\n${errorCount} edition error(s) in ${files.length} file(s).`);
  process.exit(1);
}
console.log(`Editions valid: ${files.length} file(s).`);

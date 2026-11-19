const fs = require('fs');
const path = require('path');
const { parseArgs } = require('node:util');
const yaml = require('js-yaml');

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    form: { type: 'string' },
    meaning: { type: 'string' },
    contrast: { type: 'string' },
    help: { type: 'boolean' }
  }
});
if (values.help || positionals.length !== 1) {
  console.log('Usage: npm run relations -- ENTRY-ID [--form REGEX] [--meaning REGEX] [--contrast REGEX]');
  process.exit(values.help ? 0 : 1);
}

const directory = path.join(__dirname, '../data/constructions');
const entries = fs.readdirSync(directory).filter((file) => file.endsWith('.yaml')).map((file) =>
  yaml.load(fs.readFileSync(path.join(directory, file), 'utf8'))
);
const entry = entries.find((candidate) => candidate.id === positionals[0]);
if (!entry) {
  console.error(`Unknown construction ${positionals[0]}`);
  process.exit(1);
}

const matchers = Object.entries(values).map(([field, expression]) => [field, new RegExp(expression, 'i')]);
const relations = (doc) => doc.relatedConstructions || [];
const parents = (doc) => relations(doc)
  .filter(({ relationship }) => relationship === 'specialization-of')
  .map(({ id }) => id);
const entryParents = parents(entry);
const indexFields = ['formRefs', 'semanticRefs', 'syntacticRefs'];

const searchable = (doc) => {
  const { form, meaning, function: fn, distribution } = doc.dimensions || {};
  const senses = Object.values(doc.meanings || {});
  const formText = [doc.id, doc.name, doc.pattern, form, fn].filter(Boolean).join('\n');
  const meaningText = [doc.name, meaning, ...senses.flatMap((sense) => [sense.definition, sense.details])]
    .filter(Boolean).join('\n');
  const examples = senses.flatMap((sense) => (sense.examples || []).flatMap((example) => [example.form, example.note]));
  const constraints = (doc.constraints || []).map(({ description }) => description);
  const contrastText = [formText, meaningText, distribution, ...examples, ...constraints].filter(Boolean).join('\n');
  return { form: formText, meaning: meaningText, contrast: contrastText };
};

const candidates = [];
for (const candidate of entries) {
  if (candidate.id === entry.id) continue;
  const reasons = [];
  const direct = relations(entry).filter((rel) => rel.id === candidate.id);
  const reverse = relations(candidate).filter((rel) => rel.id === entry.id);
  direct.forEach((rel) => reasons.push(`existing ${rel.relationship}`));
  reverse.forEach((rel) => reasons.push(`incoming ${rel.relationship}`));
  const sharedParents = parents(candidate).filter((id) => entryParents.includes(id));
  if (sharedParents.length) reasons.push(`shared parent ${sharedParents.join(', ')}`);
  for (const field of indexFields) {
    const shared = (candidate[field] || []).filter((id) => (entry[field] || []).includes(id));
    if (shared.length) reasons.push(`shared ${field}: ${shared.join(', ')}`);
  }
  const fields = searchable(candidate);
  for (const [field, matcher] of matchers) {
    const match = matcher.exec(fields[field]);
    if (match) reasons.push(`${field} match: ${match[0]}`);
  }
  if (reasons.length) candidates.push({ candidate, reasons, linked: direct.length + reverse.length > 0 });
}

candidates.sort((a, b) => Number(a.linked) - Number(b.linked)
  || b.reasons.length - a.reasons.length || a.candidate.id.localeCompare(b.candidate.id));
console.log(`${entry.id}: ${candidates.length} candidates across ${entries.length - 1} other entries`);
for (const { candidate, reasons } of candidates) {
  console.log(`${candidate.id} — ${candidate.name} — ${reasons.join(' | ')}`);
}

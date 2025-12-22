const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const constructionsDir = path.join(__dirname, '../data/constructions');
const files = fs.readdirSync(constructionsDir).filter((file) => file.endsWith('.yaml')).sort();

const issues = [];
const idPattern = /^[a-z-]+[0-9]{3}$/;

const record = (file, message) => {
  issues.push(`${file}: ${message}`);
};

const checkTrim = (file, value, label) => {
  if (typeof value === 'string' && value !== value.trim()) {
    record(file, `${label} has leading/trailing whitespace`);
  }
};

for (const file of files) {
  const filePath = path.join(constructionsDir, file);
  let doc;

  try {
    doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    record(file, `YAML parse error: ${error.message.split('\n')[0]}`);
    continue;
  }

  if (!doc || typeof doc !== 'object') {
    record(file, 'Content is not a YAML object');
    continue;
  }

  checkTrim(file, doc.id, 'id');
  checkTrim(file, doc.name, 'name');
  checkTrim(file, doc.pattern, 'pattern');

  const meanings = doc.meanings || {};
  const meaningKeys = Object.keys(meanings)
    .map((key) => Number(key))
    .filter((key) => Number.isInteger(key))
    .sort((a, b) => a - b);

  if (meaningKeys.length > 0) {
    const expected = Array.from({ length: meaningKeys.length }, (_, i) => i + 1);
    const sequential = meaningKeys.every((value, index) => value === expected[index]);
    if (!sequential) {
      record(file, `meanings keys are not sequential: ${meaningKeys.join(', ')}`);
    }
  }

  const relationKeys = doc.relations && typeof doc.relations === 'object' && !Array.isArray(doc.relations)
    ? new Set(Object.keys(doc.relations))
    : new Set();

  for (const [key, meaning] of Object.entries(meanings)) {
    if (!meaning || typeof meaning !== 'object') continue;

    checkTrim(file, meaning.definition, `meanings.${key}.definition`);
    checkTrim(file, meaning.specialization, `meanings.${key}.specialization`);
    checkTrim(file, meaning.details, `meanings.${key}.details`);

    if (Array.isArray(meaning.examples)) {
      meaning.examples.forEach((example, index) => {
        if (!example || typeof example !== 'object') return;
        checkTrim(file, example.form, `meanings.${key}.examples[${index}].form`);
        checkTrim(file, example.note, `meanings.${key}.examples[${index}].note`);
      });
    }

    if (Array.isArray(meaning.relations)) {
      meaning.relations.forEach((relationId) => {
        const relKey = String(relationId);
        if (relationKeys.size > 0 && !relationKeys.has(relKey)) {
          record(file, `meanings.${key}.relations references missing relation ${relKey}`);
        }
      });
    }
  }

  if (Array.isArray(doc.relatedConstructions)) {
    doc.relatedConstructions.forEach((rel, index) => {
      if (!rel || typeof rel !== 'object') return;
      if (rel.id && !idPattern.test(rel.id)) {
        record(file, `relatedConstructions[${index}].id does not match id pattern`);
      }
      checkTrim(file, rel.notes, `relatedConstructions[${index}].notes`);
    });
  }
}

if (issues.length > 0) {
  console.error('Lint issues found:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
} else {
  console.log('Lint checks passed.');
}

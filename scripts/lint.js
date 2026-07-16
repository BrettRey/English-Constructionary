const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const constructionsDir = path.join(__dirname, '../data/constructions');
const files = fs.readdirSync(constructionsDir).filter((file) => file.endsWith('.yaml')).sort();

const issues = [];
const warnings = [];
const idPattern = /^[a-z-]+[0-9]{3}$/;
const knownStabilisers = new Set([
  'acquisition',
  'entrenchment',
  'alignment',
  'transmission',
  'functional-pressure',
  'processing-economy',
  'social-indexing'
]);

const record = (file, message) => {
  issues.push(`${file}: ${message}`);
};

const warn = (file, message) => {
  warnings.push(`${file}: ${message}`);
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

  if (doc.kind && typeof doc.kind === 'object') {
    const kind = doc.kind;

    if (Array.isArray(kind.stabilisers)) {
      kind.stabilisers.forEach((stabiliser, index) => {
        if (!stabiliser || typeof stabiliser !== 'object') return;
        const type = stabiliser.type;
        if (typeof type === 'string' && type.trim().length > 0 && !knownStabilisers.has(type)) {
          warn(
            file,
            `kind.stabilisers[${index}].type '${type}' is not in the recommended list`
          );
        }
      });
    }

    // Securing-ladder discipline: each tier needs its own evidence field.
    if (!kind.projection || !kind.projection.target) {
      warn(file, 'kind block has no projection.target (declare what the category licenses us to project)');
    }
    if (kind.secured === 'networked' && !kind.network) {
      warn(file, "kind.secured is 'networked' but no network ordering is recorded");
    }
    if (kind.secured === 'maintained' && !Array.isArray(kind.stabilisers)) {
      warn(file, "kind.secured is 'maintained' but no stabilisers are recorded");
    }
    if (kind.secured === 'controlled') {
      const control = kind.control || {};
      const marks = ['perturbation', 'coupled-relation', 'response', 'preserved-relation'];
      const missing = marks.filter((mark) => !control[mark]);
      if (missing.length > 0) {
        record(file, `kind.secured is 'controlled' but control is missing: ${missing.join(', ')} (all four marks required)`);
      }
    }
  }
}

if (warnings.length > 0) {
  console.warn('Lint warnings:');
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (issues.length > 0) {
  console.error('Lint issues found:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
} else {
  console.log('Lint checks passed.');
}

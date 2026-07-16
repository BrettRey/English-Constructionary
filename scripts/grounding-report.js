const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const sourcesPath = path.join(__dirname, '../data/sources.yaml');
const constructionsDir = path.join(__dirname, '../data/constructions');
const overridesPath = path.join(__dirname, '../data/lexicon/overrides.yaml');

const jsonMode = process.argv.includes('--json');

// Map kind.secured tiers to the grounds bears-on value that secures them.
const TIER_BEARS_ON = {
  stable: 'stability',
  networked: 'network',
  maintained: 'maintenance',
  controlled: 'control',
};

// Recursively collect every grounds[] array found anywhere under a node,
// mirroring scripts/validate.js's collectGrounds walk.
const collectGrounds = (node, found) => {
  if (Array.isArray(node)) {
    node.forEach((child) => collectGrounds(child, found));
  } else if (node && typeof node === 'object') {
    if (Array.isArray(node.grounds)) {
      node.grounds.forEach((g) => found.push(g));
    }
    Object.entries(node).forEach(([key, child]) => {
      if (key !== 'grounds') collectGrounds(child, found);
    });
  }
};

// Collect grounds attached specifically to example entries (examples[].grounds),
// separately from the general walk, so attestation counts stay honest.
const collectExampleGrounds = (meanings, examplesTotal, examplesAttested) => {
  if (!meanings || typeof meanings !== 'object') return;
  Object.values(meanings).forEach((meaning) => {
    const examples = meaning && meaning.examples;
    if (!Array.isArray(examples)) return;
    examples.forEach((example) => {
      examplesTotal.count += 1;
      const grounds = (example && example.grounds) || [];
      if (grounds.some((g) => g && g.relation === 'attests')) {
        examplesAttested.count += 1;
      }
    });
  });
};

const registry = yaml.load(fs.readFileSync(sourcesPath, 'utf8'));
const sourceIds = Object.keys((registry && registry.sources) || {});

const files = fs.readdirSync(constructionsDir).filter((f) => f.endsWith('.yaml')).sort();

const withGrounds = [];
const withoutGrounds = [];
const rungIssues = [];
const sourceUses = {}; // sourceId -> Map(label -> Set(relations))
sourceIds.forEach((id) => { sourceUses[id] = new Map(); });

const examplesTotal = { count: 0 };
const examplesAttested = { count: 0 };
let securedCount = 0;

const recordSourceUse = (label, grounds) => {
  (grounds || []).forEach((g) => {
    if (!g || !g.source) return;
    if (!sourceUses[g.source]) sourceUses[g.source] = new Map();
    const map = sourceUses[g.source];
    if (!map.has(label)) map.set(label, new Set());
    map.get(label).add(g.relation);
  });
};

files.forEach((file) => {
  const id = file.replace(/\.yaml$/, '');
  let doc;
  try {
    doc = yaml.load(fs.readFileSync(path.join(constructionsDir, file), 'utf8'));
  } catch (parseError) {
    return; // validate.js is the place to report parse errors
  }
  if (!doc) return;

  const found = [];
  collectGrounds(doc, found);
  if (found.length > 0) {
    withGrounds.push(id);
  } else {
    withoutGrounds.push(id);
  }
  recordSourceUse(id, found);

  collectExampleGrounds(doc.meanings, examplesTotal, examplesAttested);

  const secured = doc.kind && doc.kind.secured;
  if (secured) {
    securedCount += 1;
    const neededBearsOn = TIER_BEARS_ON[secured];
    const hasMatch = found.some((g) => g && g.source && g['bears-on'] === neededBearsOn);
    if (!hasMatch) {
      rungIssues.push({ id, secured, needs: neededBearsOn });
    }
  }
});

// Lexicon override layer
let overrideWith = [];
let overrideWithout = [];
if (fs.existsSync(overridesPath)) {
  let overridesDoc;
  try {
    overridesDoc = yaml.load(fs.readFileSync(overridesPath, 'utf8'));
  } catch (parseError) {
    overridesDoc = null;
  }
  const records = (overridesDoc && overridesDoc.records) || [];
  records.forEach((record) => {
    const label = record.lemma;
    const grounds = record.grounds || [];
    if (grounds.length > 0) {
      overrideWith.push(label);
    } else {
      overrideWithout.push(label);
    }
    recordSourceUse(label, grounds);
  });
}

const unusedSources = sourceIds.filter((id) => sourceUses[id].size === 0);

const sourceReport = sourceIds.map((id) => {
  const uses = Array.from(sourceUses[id].entries()).map(([label, relations]) => (
    `${label} (${Array.from(relations).sort().join(', ')})`
  ));
  return { id, uses };
});

const report = {
  totals: {
    constructions: {
      withGrounds: withGrounds.length,
      withoutGrounds: withoutGrounds.length,
      withoutGroundsList: withoutGrounds,
    },
    overrides: {
      withGrounds: overrideWith.length,
      withoutGrounds: overrideWithout.length,
      withoutGroundsList: overrideWithout,
    },
  },
  rungGrounding: {
    checked: securedCount,
    issues: rungIssues,
  },
  sourceDependencies: sourceReport,
  unusedSources,
  exampleAttestation: {
    total: examplesTotal.count,
    attested: examplesAttested.count,
  },
};

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const section = (title) => console.log(`\n${title}\n${'-'.repeat(title.length)}`);

console.log('Grounding coverage report');
console.log('==========================');

section('1. Totals');
console.log(`Constructions with grounds:    ${report.totals.constructions.withGrounds}`);
console.log(`Constructions without grounds: ${report.totals.constructions.withoutGrounds}`);
console.log(`Override records with grounds:    ${report.totals.overrides.withGrounds}`);
console.log(`Override records without grounds: ${report.totals.overrides.withoutGrounds}`);

section('2. Rung grounding (kind.secured vs matching bears-on)');
console.log(`Constructions with kind.secured: ${report.rungGrounding.checked}`);
if (rungIssues.length === 0) {
  console.log('All secured tiers have at least one matching grounds link.');
} else {
  console.log(`${rungIssues.length} construction(s) missing a matching grounds link:`);
  rungIssues.forEach((issue) => {
    console.log(`- ${issue.id}: secured=${issue.secured}, no grounds with bears-on=${issue.needs}`);
  });
}

section('3. Per-source dependency list');
sourceReport.forEach(({ id, uses }) => {
  console.log(uses.length === 0 ? `${id}: (unused)` : `${id}: ${uses.join(', ')}`);
});
console.log(unusedSources.length > 0
  ? `\nRegistry sources with no grounds links: ${unusedSources.join(', ')}`
  : '\nEvery registry source has at least one grounds link.');

section('4. Example attestation');
console.log(`Examples with an attests grounds link: ${report.exampleAttestation.attested} / ${report.exampleAttestation.total}`);

process.exit(0);

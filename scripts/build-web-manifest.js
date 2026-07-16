const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = path.join(__dirname, '..');
const webDir = path.join(root, 'web');

const readYamlMeta = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    if (data && typeof data === 'object') {
      return {
        id: data.id || null,
        name: data.name || null,
        pattern: data.pattern || null,
        relatedConstructions: Array.isArray(data.relatedConstructions)
          ? data.relatedConstructions
          : []
      };
    }
  } catch (err) {
    return null;
  }
  return null;
};

const listFiles = (dir, exts) => {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => exts.includes(path.extname(file)))
    .sort();
};

const kindForExt = (ext) => {
  if (ext === '.yaml' || ext === '.yml') return 'yaml';
  if (ext === '.md') return 'markdown';
  if (ext === '.pdf') return 'pdf';
  return 'text';
};

const buildSection = ({ id, label, dir, exts, includeMeta }) => {
  const fullDir = path.join(root, dir);
  const files = listFiles(fullDir, exts);
  const items = files.map((file) => {
    const fullPath = path.join(fullDir, file);
    const relPath = `/${dir}/${file}`;
    let title = file;
    let subtitle = '';
    let metaId = null;
    let relations = [];
    const kind = kindForExt(path.extname(file));
    if (includeMeta) {
      const meta = readYamlMeta(fullPath);
      if (meta) {
        title = meta.id || file;
        subtitle = meta.name || '';
        metaId = meta.id || null;
        relations = meta.relatedConstructions || [];
      }
    }
    return {
      id: metaId,
      title,
      subtitle,
      path: relPath,
      kind,
      relations,
      incomingRelations: []
    };
  });
  return { id, label, items };
};

// Explode the lexicon layer into per-lexeme items so lemmas are searchable.
const buildLexemeSection = () => {
  const items = [];
  const goldDir = path.join(root, 'data/lexicon/gold');
  const loadYaml = (p) => {
    try { return yaml.load(fs.readFileSync(p, 'utf8')); } catch (err) { return null; }
  };

  // Deitality statuses join on exact lemma match
  const deitality = new Map();
  const deitalityDoc = loadYaml(path.join(root, 'data/indices/deitality-status.yaml'));
  if (deitalityDoc && deitalityDoc.statuses) {
    Object.entries(deitalityDoc.statuses).forEach(([status, lemmas]) => {
      (lemmas || []).forEach((lemma) => deitality.set(String(lemma), status));
    });
  }

  // Glosses extracted from the Simple English dump (scripts/extract-glosses.py)
  const glossMap = new Map();
  const glossDoc = loadYaml(path.join(root, 'data/lexicon/glosses.yaml'));
  if (glossDoc && Array.isArray(glossDoc.glosses)) {
    glossDoc.glosses.forEach((g) => glossMap.set(`${g.lemma}|${g.pos}`, g.senses));
  }
  const posForGoldFile = {
    'determinatives.yaml': 'det',
    'prepositions.yaml': 'prep',
    'pronouns.yaml': 'pron',
    'conjunctions.yaml': 'conj'
  };

  const pushLexeme = (lemma, category, sourceFile, extra = {}) => {
    const lexeme = {
      lemma,
      category: category || 'to adjudicate',
      source: sourceFile,
      ...extra
    };
    const deitalityStatus = deitality.get(lemma);
    if (deitalityStatus) lexeme.deitality = deitalityStatus;
    items.push({
      id: null,
      title: lemma,
      subtitle: lexeme.category,
      path: `/data/lexicon/${sourceFile}`,
      kind: 'lexeme',
      lexeme,
      relations: [],
      incomingRelations: []
    });
  };

  if (fs.existsSync(goldDir)) {
    listFiles(goldDir, ['.yaml']).forEach((file) => {
      const doc = loadYaml(path.join(goldDir, file));
      if (!doc) return;
      const constructions = doc.constructions || [];
      const posCode = posForGoldFile[file];
      const withGloss = (lemma) => {
        const senses = glossMap.get(`${lemma}|${posCode}`);
        return senses ? { status: doc.status || 'seed', constructions, senses } : { status: doc.status || 'seed', constructions };
      };
      if (Array.isArray(doc.items)) {
        doc.items.forEach((lemma) => pushLexeme(String(lemma), doc['cgel-category'], `gold/${file}`, withGloss(String(lemma))));
      }
      if (doc.split) {
        Object.entries(doc.split).forEach(([bucket, lemmas]) => {
          const category = bucket === 'to-adjudicate' ? null : bucket;
          (lemmas || []).forEach((lemma) => pushLexeme(String(lemma), category, `gold/${file}`, withGloss(String(lemma))));
        });
      }
    });
  }

  // Override records enrich matching gold lexemes, or stand alone
  const overrides = loadYaml(path.join(root, 'data/lexicon/overrides.yaml'));
  if (overrides && Array.isArray(overrides.records)) {
    overrides.records.forEach((record) => {
      const category = record.cgel && record.cgel.category;
      const match = items.find((item) => item.lexeme.lemma === record.lemma
        && (!category || item.lexeme.category.startsWith(category)));
      const detail = {
        'source-pos': record['source-pos'],
        provenance: record.provenance,
        confidence: record.confidence,
        tests: record.tests || [],
        references: record.references || [],
        notes: record.cgel && record.cgel.notes,
        subclass: record.cgel && record.cgel.subclass,
        grounds: record.grounds || []
      };
      if (match) {
        Object.assign(match.lexeme, { override: detail });
        if (record.cgel && record.cgel.subclass) {
          match.subtitle = `${match.lexeme.category} (${record.cgel.subclass})`;
        }
      } else {
        const senses = glossMap.get(`${record.lemma}|${record['source-pos']}`);
        pushLexeme(record.lemma, category, 'overrides.yaml',
          senses ? { override: detail, status: 'adjudicated', senses } : { override: detail, status: 'adjudicated' });
      }
    });
  }

  items.sort((a, b) => a.title.localeCompare(b.title));
  return { id: 'lexemes', label: 'Lexemes', items };
};

// Build the ground-source registry section plus a reverse index of what each
// source grounds. `grounds` arrays can sit anywhere in a construction (top
// level, inside kind subfields, on override records), so walk recursively.
const buildSourcesSection = () => {
  const loadYaml = (p) => {
    try { return yaml.load(fs.readFileSync(p, 'utf8')); } catch (err) { return null; }
  };

  const sourcesDoc = loadYaml(path.join(root, 'data/sources.yaml'));
  const registry = (sourcesDoc && sourcesDoc.sources) || {};

  // Collect every distinct source id referenced by a `grounds` array anywhere
  // in the given object.
  const collectGroundSources = (node, sourceIds) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((el) => collectGroundSources(el, sourceIds));
      return;
    }
    Object.entries(node).forEach(([key, value]) => {
      if (key === 'grounds' && Array.isArray(value)) {
        value.forEach((link) => {
          if (link && typeof link === 'object' && link.source) sourceIds.add(link.source);
        });
      }
      collectGroundSources(value, sourceIds);
    });
  };

  // reverse index: source id -> [{ id, name }]
  const grounded = new Map();
  const record = (sourceId, ref) => {
    if (!grounded.has(sourceId)) grounded.set(sourceId, []);
    const list = grounded.get(sourceId);
    if (!list.some((r) => r.id === ref.id)) list.push(ref);
  };

  const constructionsDir = path.join(root, 'data/constructions');
  listFiles(constructionsDir, ['.yaml']).forEach((file) => {
    const doc = loadYaml(path.join(constructionsDir, file));
    if (!doc || typeof doc !== 'object') return;
    const sourceIds = new Set();
    collectGroundSources(doc, sourceIds);
    if (sourceIds.size === 0) return;
    const ref = { id: doc.id || file, name: doc.name || null };
    sourceIds.forEach((sid) => record(sid, ref));
  });

  const overrides = loadYaml(path.join(root, 'data/lexicon/overrides.yaml'));
  if (overrides && Array.isArray(overrides.records)) {
    overrides.records.forEach((rec) => {
      const sourceIds = new Set();
      collectGroundSources(rec, sourceIds);
      if (sourceIds.size === 0) return;
      const ref = { id: rec.lemma, name: rec.lemma };
      sourceIds.forEach((sid) => record(sid, ref));
    });
  }

  const items = Object.entries(registry).map(([id, entry]) => ({
    id: null,
    title: id,
    subtitle: entry.type || '',
    path: '/data/sources.yaml',
    kind: 'source',
    source: { id, ...entry, grounded: grounded.get(id) || [] },
    relations: [],
    incomingRelations: []
  }));

  return { section: { id: 'sources', label: 'Sources', items }, registry };
};

const sourcesData = buildSourcesSection();

const projectFiles = ['README.md', 'STATUS.md', 'LICENSE', 'AGENTS.md', 'CLAUDE.md']
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => ({
    title: file,
    subtitle: 'Project file',
    path: `/${file}`,
    kind: path.extname(file) === '.md' ? 'markdown' : 'text'
  }));

const manifest = {
  generatedAt: new Date().toISOString(),
  sources: sourcesData.registry,
  sections: [
    {
      id: 'project',
      label: 'Project',
      items: projectFiles
    },
    buildSection({
      id: 'constructions',
      label: 'Constructions',
      dir: 'data/constructions',
      exts: ['.yaml'],
      includeMeta: true
    }),
    buildSection({
      id: 'indices',
      label: 'Indices',
      dir: 'data/indices',
      exts: ['.yaml'],
      includeMeta: false
    }),
    buildSection({
      id: 'lexicon',
      label: 'Lexicon',
      dir: 'data/lexicon',
      exts: ['.yaml', '.md'],
      includeMeta: false
    }),
    buildSection({
      id: 'lexicon-gold',
      label: 'Lexicon: gold lists',
      dir: 'data/lexicon/gold',
      exts: ['.yaml'],
      includeMeta: false
    }),
    buildLexemeSection(),
    sourcesData.section,
    buildSection({
      id: 'schemas',
      label: 'Schemas',
      dir: 'data/schemas',
      exts: ['.json'],
      includeMeta: false
    }),
    buildSection({
      id: 'docs',
      label: 'Docs',
      dir: 'docs',
      exts: ['.md'],
      includeMeta: false
    }),
    buildSection({
      id: 'literature',
      label: 'Literature',
      dir: 'literature',
      exts: ['.pdf', '.tex', '.md'],
      includeMeta: false
    })
  ]
};

const constructionSection = manifest.sections.find((section) => section.id === 'constructions');
if (constructionSection) {
  const byId = new Map();
  constructionSection.items.forEach((item) => {
    if (item.id) byId.set(item.id, item);
  });
  constructionSection.items.forEach((item) => {
    item.relations.forEach((rel) => {
      const target = byId.get(rel.id);
      if (target) {
        target.incomingRelations.push({
          id: item.id,
          title: item.title,
          relationship: rel.relationship || rel.type || 'related-to'
        });
      }
    });
  });

  // Keep all incoming relations for symmetric mereological display
}

// Drop sections with no files (e.g. literature/ is untracked and absent in CI)
manifest.sections = manifest.sections.filter((section) => section.items.length > 0);

fs.writeFileSync(path.join(webDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Wrote web/manifest.json with ${manifest.sections.reduce((sum, section) => sum + section.items.length, 0)} items.`);

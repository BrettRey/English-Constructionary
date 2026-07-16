// Exports web/graph.json: a typed graph over the whole resource (constructions,
// sources, lexemes, diagnostics, and the gold lists that connect them).
//
// Node kinds: construction, source, lexeme, diagnostic, gold-list
// Edge types: relatedConstructions' relationship values; grounds' relation
// values (cites/attests/...); 'diagnosed-by'; 'lexicon-members'; 'listed-in'.
//
// Plain node + js-yaml, no new dependencies (see scripts/build-web-manifest.js).

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const webDir = path.join(root, 'web');

const loadYaml = (filePath) => {
  try {
    return yaml.load(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Skipping unparsable YAML: ${path.relative(root, filePath)} (${err.message})`);
    return null;
  }
};

const listYamlFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))
    .sort();
};

// Recursively find every `grounds` array anywhere under a node (meanings'
// examples, kind.projection, kind.stabilisers[], top-level grounds, etc.)
// and invoke callback once per grounds entry. Mirrors the walk in
// scripts/grounding-report.js.
const walkGrounds = (node, callback) => {
  if (Array.isArray(node)) {
    node.forEach((child) => walkGrounds(child, callback));
  } else if (node && typeof node === 'object') {
    Object.entries(node).forEach(([key, value]) => {
      if (key === 'grounds' && Array.isArray(value)) {
        value.forEach((g) => {
          if (g && typeof g === 'object') callback(g);
        });
      } else {
        walkGrounds(value, callback);
      }
    });
  }
};

const nodes = new Map(); // id -> node
let danglingCount = 0;

const addNode = (id, kind, label, extra) => {
  if (nodes.has(id)) return;
  const node = { id, kind, label };
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node[key] = value;
    });
  }
  nodes.set(id, node);
};

const edges = [];
const addEdge = (from, to, type, extra) => {
  const edge = { from, to, type };
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== null) edge[key] = value;
    });
  }
  edges.push(edge);
};

// --- Sources ---------------------------------------------------------

const sourcesDoc = loadYaml(path.join(dataDir, 'sources.yaml')) || {};
const sourcesMap = (sourcesDoc && sourcesDoc.sources) || {};
const sourceIds = new Set(Object.keys(sourcesMap));

Object.keys(sourcesMap)
  .sort()
  .forEach((id) => {
    const entry = sourcesMap[id] || {};
    addNode(id, 'source', entry.citation || id, { type: entry.type });
  });

// --- Constructions -----------------------------------------------------

const constructionsDir = path.join(dataDir, 'constructions');
const constructionFiles = listYamlFiles(constructionsDir);
const constructionDocs = [];
const seenConstructionIds = new Set();

constructionFiles.forEach((file) => {
  const data = loadYaml(path.join(constructionsDir, file));
  if (!data || typeof data !== 'object') return;
  const id = data.id || path.basename(file, path.extname(file));
  if (seenConstructionIds.has(id)) {
    console.error(`Duplicate construction id "${id}" (from ${file}); keeping first occurrence.`);
    return;
  }
  seenConstructionIds.add(id);
  constructionDocs.push({ file, id, data });
});

const constructionIds = new Set(constructionDocs.map((doc) => doc.id));

constructionDocs.forEach(({ id, data }) => {
  const extra = {};
  if (data.type) extra.type = data.type;
  if (data.kind && data.kind.secured) extra.secured = data.kind.secured;
  addNode(id, 'construction', data.name || id, extra);
});

// --- Diagnostics ---------------------------------------------------------

const diagnosticsDoc = loadYaml(path.join(dataDir, 'indices', 'syntactic-diagnostics.yaml')) || {};
const diagnosticsMap = (diagnosticsDoc && diagnosticsDoc.syntactic_diagnostics) || {};
const diagnosticIds = new Set(Object.keys(diagnosticsMap));

Object.keys(diagnosticsMap)
  .sort()
  .forEach((id) => addNode(id, 'diagnostic', id));

// --- Lexemes and gold lists ------------------------------------------------

const goldDir = path.join(dataDir, 'lexicon', 'gold');
const goldFiles = listYamlFiles(goldDir);
const goldListNames = new Set(); // basename without extension, e.g. 'determinatives'

goldFiles.forEach((file) => {
  const base = path.basename(file, path.extname(file));
  const data = loadYaml(path.join(goldDir, file)) || {};
  goldListNames.add(base);

  const goldNodeId = `gold:${base}`;
  addNode(goldNodeId, 'gold-list', base);

  const lemmas = [];
  if (Array.isArray(data.items)) {
    data.items.forEach((lemma) => lemmas.push(String(lemma)));
  }
  if (data.split && typeof data.split === 'object') {
    Object.keys(data.split)
      .sort()
      .forEach((bucket) => {
        const bucketLemmas = data.split[bucket];
        if (Array.isArray(bucketLemmas)) {
          bucketLemmas.forEach((lemma) => lemmas.push(String(lemma)));
        }
      });
  }

  lemmas.forEach((lemma) => {
    const lexId = `lex:${lemma}`;
    addNode(lexId, 'lexeme', lemma);
    addEdge(lexId, goldNodeId, 'listed-in');
  });
});

// --- Construction edges: relatedConstructions, syntacticRefs, lexiconRefs, grounds ---

const goldRefPattern = /^gold\/(.+)$/;

constructionDocs.forEach(({ id, data }) => {
  // relatedConstructions -> other constructions
  if (Array.isArray(data.relatedConstructions)) {
    data.relatedConstructions.forEach((rel) => {
      if (!rel || !rel.id || !rel.relationship) return;
      if (!constructionIds.has(rel.id)) {
        danglingCount += 1;
        return;
      }
      const extra = {};
      if (rel.parthood) extra.parthood = rel.parthood;
      if (rel['overlap-dimension']) extra['overlap-dimension'] = rel['overlap-dimension'];
      addEdge(id, rel.id, rel.relationship, extra);
    });
  }

  // syntacticRefs -> diagnostics
  if (Array.isArray(data.syntacticRefs)) {
    data.syntacticRefs.forEach((diagId) => {
      if (!diagnosticIds.has(diagId)) {
        danglingCount += 1;
        return;
      }
      addEdge(id, diagId, 'diagnosed-by');
    });
  }

  // lexiconRefs -> gold-list nodes
  if (Array.isArray(data.lexiconRefs)) {
    data.lexiconRefs.forEach((ref) => {
      const match = typeof ref === 'string' ? goldRefPattern.exec(ref) : null;
      const goldName = match ? match[1] : null;
      if (!goldName || !goldListNames.has(goldName)) {
        danglingCount += 1;
        return;
      }
      addEdge(id, `gold:${goldName}`, 'lexicon-members');
    });
  }

  // grounds, wherever nested -> sources
  walkGrounds(data, (g) => {
    if (!g.source || !g.relation) return;
    if (!sourceIds.has(g.source)) {
      danglingCount += 1;
      return;
    }
    const extra = {};
    if (g.locator) extra.locator = g.locator;
    if (g['bears-on']) extra['bears-on'] = g['bears-on'];
    addEdge(id, g.source, g.relation, extra);
  });
});

// --- Override records: grounds -> sources, from lex:<lemma> -----------------

const overridesDoc = loadYaml(path.join(dataDir, 'lexicon', 'overrides.yaml')) || {};
const overrideRecords = Array.isArray(overridesDoc.records) ? overridesDoc.records : [];

overrideRecords.forEach((record) => {
  if (!record || !record.lemma) return;
  const lexId = `lex:${record.lemma}`;
  const lexemeExists = nodes.has(lexId);
  walkGrounds(record, (g) => {
    if (!g.source || !g.relation) return;
    if (!lexemeExists || !sourceIds.has(g.source)) {
      danglingCount += 1;
      return;
    }
    const extra = {};
    if (g.locator) extra.locator = g.locator;
    if (g['bears-on']) extra['bears-on'] = g['bears-on'];
    addEdge(lexId, g.source, g.relation, extra);
  });
});

// --- Sort for deterministic output ------------------------------------------

const sortedNodes = Array.from(nodes.values()).sort((a, b) => a.id.localeCompare(b.id));
const sortedEdges = edges.slice().sort((a, b) => {
  if (a.from !== b.from) return a.from.localeCompare(b.from);
  if (a.to !== b.to) return a.to.localeCompare(b.to);
  if (a.type !== b.type) return a.type.localeCompare(b.type);
  return JSON.stringify(a).localeCompare(JSON.stringify(b));
});

const graph = { nodes: sortedNodes, edges: sortedEdges };

if (!fs.existsSync(webDir)) fs.mkdirSync(webDir, { recursive: true });
fs.writeFileSync(path.join(webDir, 'graph.json'), JSON.stringify(graph, null, 2));

// --- Summary ------------------------------------------------------------

const countBy = (items, keyFn) => {
  const counts = {};
  items.forEach((item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
};

const formatCounts = (counts) => Object.keys(counts)
  .sort()
  .map((key) => `${key}=${counts[key]}`)
  .join(', ');

const nodeCounts = countBy(sortedNodes, (n) => n.kind);
const edgeCounts = countBy(sortedEdges, (e) => e.type);

console.log(
  `Wrote web/graph.json — nodes: ${formatCounts(nodeCounts)} (${sortedNodes.length} total); `
  + `edges: ${formatCounts(edgeCounts)} (${sortedEdges.length} total); `
  + `dangling references: ${danglingCount}`
);

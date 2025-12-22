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

  constructionSection.items.forEach((item) => {
    item.incomingRelations = item.incomingRelations.filter(
      (incoming) => incoming.relationship === 'contains'
    );
  });
}

fs.writeFileSync(path.join(webDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Wrote web/manifest.json with ${manifest.sections.reduce((sum, section) => sum + section.items.length, 0)} items.`);

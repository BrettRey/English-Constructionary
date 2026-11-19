#!/usr/bin/env node
// Builds the static English Constructionary for brettreynolds.ca/constructionary/.
//
//   node scripts/build-site.js --out <dir> [--include-unchecked]
//
// Four human editions from one dataset:
//   curious  (default, at the root)   from data/editions/<id>.yaml `curious`
//   teacher  (/teacher/)              from data/editions/<id>.yaml `teacher`
//   linguist (/linguist/)             the construction entry itself
//   child    (/child/)                from data/editions/<id>.yaml `child`, where written
// and an interface for machines: /api/ (JSON, Markdown, JSONL, schemas, graph)
// plus /llms.txt. Edition texts render only once their check passed, unless
// --include-unchecked is given (for local previews).
//
// Every page works without JavaScript. Type and theme come from the website's
// /style-v3.css and /theme.js; site/cx.css lays out the dictionary.

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : fallback;
};
const OUT = arg('--out');
if (!OUT) {
  console.error('Usage: node scripts/build-site.js --out <dir> [--include-unchecked]');
  process.exit(2);
}
const BASE = '/constructionary/';
const ORIGIN = 'https://brettreynolds.ca';
const REPO = 'https://github.com/BrettRey/English-Constructionary';
const INCLUDE_UNCHECKED = argv.includes('--include-unchecked');

// ---------------------------------------------------------------- data

const load = (p) => yaml.load(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const listYaml = (dir) => fs.existsSync(path.join(ROOT, dir))
  ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.yaml')).sort()
  : [];

const entries = new Map();
const fileOf = new Map();
for (const f of listYaml('data/constructions')) {
  const e = load(`data/constructions/${f}`);
  entries.set(e.id, e);
  fileOf.set(e.id, f);
}
const editions = new Map();
for (const f of listYaml('data/editions')) {
  const ed = load(`data/editions/${f}`);
  if (!entries.has(ed.id)) continue;
  const ok = INCLUDE_UNCHECKED || (ed.checked && ['pass', 'fixed'].includes(ed.checked.result));
  if (ok) editions.set(ed.id, ed);
}
const sources = (load('data/sources.yaml') || {}).sources || {};
const families = (load('data/indices/families.yaml') || {}).families || {};
const indexDescriptions = {};
for (const [file, key] of [['semantic-features', 'semantic_features'], ['form-features', 'form_features'], ['syntactic-diagnostics', 'syntactic_diagnostics']]) {
  const d = (load(`data/indices/${file}.yaml`) || {})[key] || {};
  for (const [k, v] of Object.entries(d)) indexDescriptions[k] = v && v.description;
}
const goldLists = listYaml('data/lexicon/gold').map((f) => ({ name: f.replace(/\.yaml$/, ''), data: load(`data/lexicon/gold/${f}`) }));
const glosses = new Map();
for (const g of ((load('data/lexicon/glosses.yaml') || {}).glosses || [])) {
  const k = g.lemma.toLowerCase();
  if (!glosses.has(k)) glosses.set(k, g.senses && g.senses[0] && g.senses[0].gloss);
}
const profiles = ((load('data/lexicon/profiles.yaml') || {}).records) || [];

let commit = 'unknown';
let dirty = false;
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
  dirty = execSync('git status --porcelain -- data', { cwd: ROOT }).toString().trim() !== '';
} catch { /* not a git checkout */ }
const today = new Date().toISOString().slice(0, 10);
const SNAPSHOT = { date: today, commit, dirty_data: dirty };

// ---------------------------------------------------------------- editions

const ED = {
  curious: { label: 'Curious reader', dir: '' },
  teacher: { label: 'Teacher', dir: 'teacher/' },
  linguist: { label: 'Linguist', dir: 'linguist/' },
  child: { label: 'Child', dir: 'child/' },
};
const ED_ORDER = ['curious', 'teacher', 'linguist', 'child'];
const has = (id, ed) => ed === 'linguist' ? entries.has(id) : Boolean(editions.get(id) && editions.get(id)[ed]);
const entryUrl = (id, ed) => `${BASE}${ED[ed].dir}${id}/`;
const landingUrl = (ed) => `${BASE}${ED[ed].dir}`;
const titleFor = (id, ed) => {
  const e = entries.get(id);
  const t = editions.get(id);
  if ((ed === 'curious' || ed === 'child') && t && t.curious) return t.curious.title;
  return e.name;
};

// ---------------------------------------------------------------- html helpers

// Text fields may mark mentioned forms with <i>...</i> (house style: mentions in
// italics, titles included). esc() escapes everything else and keeps those tags;
// plain() drops them for <title>, meta descriptions, JSON-LD and search.
const plain = (s) => String(s == null ? '' : s).replace(/<\/?i>/g, '');
const escRaw = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const esc = (s) => escRaw(s).replace(/&lt;(\/?)i&gt;/g, '<$1i>');
const mdItalics = (s) => String(s == null ? '' : s).replace(/<\/?i>/g, '*');
const target = (s) => esc(s).replace(/\[([^\[\]]+)\]/g, '<b>$1</b>');
const paras = (s) => String(s || '').trim().split(/\n\s*\n/).filter(Boolean).map((p) => `<p>${esc(p.trim())}</p>`).join('\n');
const human = (k) => String(k).replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const plainText = (s) => String(s || '').replace(/[\[\]]/g, '');

function exampleItem(ex, { mode }) {
  let text = String(ex.text != null ? ex.text : ex.form || '').trim();
  let judg = '';
  const m = text.match(/^([∗*?#%]+)\s*/);
  if (m) { judg = m[1].replace(/\*/g, '∗'); text = text.slice(m[0].length); }
  if (ex.acceptable === false && !judg) judg = '∗';
  const bad = judg && judg.includes('∗');
  let mark = '';
  if (judg) {
    mark = mode === 'teacher' && bad
      ? '<span class="judg" aria-hidden="true">✗</span><span class="vh">Not acceptable: </span>'
      : `<span class="judg">${esc(judg)}</span>`;
  }
  const note = ex.note ? `<span class="ex-note">${esc(ex.note)}</span>` : '';
  let src = '';
  if (mode === 'linguist' && Array.isArray(ex.grounds) && ex.grounds.length) {
    src = `<span class="ex-note">${ex.grounds.map((g) => groundShort(g)).join('; ')}</span>`;
  }
  return `<li${bad ? ' class="bad"' : ''}>${mark}<span class="ex">${target(text)}</span>${note}${src}</li>`;
}
const exampleList = (list, opts) => (list && list.length)
  ? `<ul class="examples">\n${list.map((ex) => exampleItem(ex, opts)).join('\n')}\n</ul>` : '';

function sourceLink(key) {
  const s = sources[key];
  if (!s) return { text: key, url: null };
  const url = s.url || (s.doi ? `https://doi.org/${s.doi}` : null);
  return { text: s.citation || key, url };
}
const GROUND_REL = { cites: 'cited', attests: 'attestation', adjudicates: 'adjudicates', 'derives-from': 'derived from', contradicts: 'contradicts', discusses: 'discussed' };
function groundShort(g) {
  const s = sourceLink(g.source);
  const name = s.url ? `<a href="${esc(s.url)}">${esc(s.text)}</a>` : esc(s.text);
  return `${name}${g.locator ? `, ${esc(g.locator)}` : ''}`;
}
function groundItem(g) {
  const tags = [GROUND_REL[g.relation] || g.relation, g['bears-on'] ? `bears on ${String(g['bears-on']).replace(/-/g, ' ')}` : null].filter(Boolean);
  return `<li>${groundShort(g)}. <span class="tag">${esc(tags.join(' · '))}</span>${g.note ? ` ${esc(g.note)}` : ''}</li>`;
}

function renderValue(v) {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return esc(String(v));
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x !== 'object')) return esc(v.join(', '));
    return `<ul class="bullets">${v.map((x) => `<li>${renderValue(x)}</li>`).join('')}</ul>`;
  }
  return `<dl class="facts">${Object.entries(v).map(([k, x]) => `<dt>${esc(human(k))}</dt><dd>${renderValue(x)}</dd>`).join('')}</dl>`;
}

// ---------------------------------------------------------------- relations

const REL = {
  'specialization-of': ['A kind of', 'Kinds of this'],
  'inherits-from': ['Inherits from', 'Inherited by'],
  implements: ['Implements', 'Implemented by'],
  contains: ['Contains', 'Part of'],
  'can-manifest-as': ['Can appear as', 'Can be how this appears'],
  'often-contains': ['Often contains', 'Often part of'],
  'interfaces-with': ['Interacts with', 'Interacts with'],
  'overlaps-with': ['Overlaps with', 'Overlaps with'],
  'alternates-with': ['Alternates with', 'Alternates with'],
  'related-to': ['Compare', 'Compare'],
  'see-also': ['See also', 'See also'],
};
const REL_ORDER = ['A kind of', 'Kinds of this', 'Implements', 'Implemented by', 'Inherits from', 'Inherited by', 'Contains', 'Part of', 'Can appear as', 'Can be how this appears', 'Often contains', 'Often part of', 'Overlaps with', 'Interacts with', 'Alternates with', 'Compare', 'See also'];
const relations = new Map(); // id -> [{label, id, notes}]
const addRel = (from, label, to, notes) => {
  if (!entries.has(to) || from === to) return;
  const list = relations.get(from) || [];
  if (!list.some((r) => r.label === label && r.id === to)) list.push({ label, id: to, notes });
  relations.set(from, list);
};
for (const e of entries.values()) {
  const out = [...(e.relatedConstructions || []).map((r) => ({ id: r.id, type: r.relationship, notes: r.notes }))];
  for (const r of Object.values(e.relations || {})) if (r && r.construction) out.push({ id: r.construction, type: r.type, notes: r.notes });
  for (const r of out) {
    const pair = REL[r.type] || [human(r.type), human(r.type)];
    addRel(e.id, pair[0], r.id, r.notes);
    addRel(r.id, pair[1], e.id, null);
  }
}
// An entry is an early sketch when it has at most one example and only the
// generic evidence line. Brett chose (2026-11-19) to publish these with a label.
const SKETCH_EVIDENCE = /see the cited discussion/i;
const isSketch = (id) => {
  const e = entries.get(id);
  const exs = Object.values(e.meanings || {}).flatMap((m) => m.examples || []);
  const ev = String((e.kind && e.kind.projection && e.kind.projection.evidence) || '');
  return exs.length <= 1 && SKETCH_EVIDENCE.test(ev);
};
const SKETCH_NOTE = {
  curious: 'Early sketch. The full entry for this pattern has one example so far and its evidence isn’t written up yet, so treat this page as a starting point.',
  teacher: 'Early sketch. The linguist entry has one example so far and its evidence isn’t written up yet. Use this page as a starting point, not a settled account.',
  child: 'This page is an early sketch, so there’s more still to find out about this pattern.',
  linguist: 'Early sketch: one example so far, and the evidence for the analysis isn’t written up yet.',
};
const sketchNote = (id, ed) => (isSketch(id) ? `<p class="sketch">${SKETCH_NOTE[ed]}</p>` : '');
const parentsOf = (id) => (relations.get(id) || []).filter((r) => r.label === 'A kind of').map((r) => r.id);

// ---------------------------------------------------------------- layout

function editionNav(ed, id) {
  const items = ED_ORDER.map((k) => {
    const available = id ? has(id, k) : true;
    const href = id ? entryUrl(id, k) : landingUrl(k);
    if (k === ed) return `<a href="${href}" aria-current="page" data-edition="${k}">${ED[k].label}</a>`;
    if (!available) return `<span class="absent" title="Not written for this edition yet">${ED[k].label}</span>`;
    return `<a href="${href}" data-edition="${k}">${ED[k].label}</a>`;
  });
  return `<nav class="editions" aria-label="Edition"><span class="label">Edition</span>${items.join('')}</nav>`;
}

function footer() {
  return `<footer>
<p>English Constructionary, edited by Brett Reynolds. Snapshot ${esc(SNAPSHOT.date)} (<a href="${REPO}/tree/${esc(commit)}">${esc(commit)}</a>).</p>
<p>Text and data: <a href="${BASE}content-license.txt">CC BY 4.0</a>. Site code: <a href="${BASE}code-license.txt">MIT</a>. Word lists and glosses from Simple English Wiktionary: CC BY-SA 4.0.</p>
<p><a href="${BASE}about/">About and how to cite</a> · <a href="${BASE}llms.txt">For AI systems</a> · <a href="${BASE}api/">Data</a> · <a href="${REPO}">Source</a></p>
</footer>`;
}

function page({ ed, kind, title, description, canonical, crumbs = [], body, id, jsonld, alternates = '' }) {
  const crumbHtml = [`<a href="/">Brett Reynolds</a>`, `<a href="${BASE}">Constructionary</a>`, ...crumbs].join('<span aria-hidden="true"> / </span>');
  return `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escRaw(plain(title))}</title>
<meta name="description" content="${escRaw(plain(description))}">
<link rel="canonical" href="${ORIGIN}${canonical}">
${alternates}<script src="/theme.js"></script><link rel="stylesheet" href="/style-v3.css"><link rel="stylesheet" href="${BASE}cx.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>\n` : ''}<script src="${BASE}cx.js" defer></script>
</head>
<body class="cx cx-${ed}" data-edition="${ed}" data-page="${kind}" data-base="${BASE}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">${crumbHtml}</header>
${editionNav(ed, id)}
<main id="main">
${body}
</main>
${footer()}
</body></html>
`;
}

const written = [];
function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  written.push(rel);
}

const DRAFT_NOTE = (id) => `<p class="draft">Draft. This edition was written with AI assistance from the <a href="${entryUrl(id, 'linguist')}">linguist entry</a> and hasn't been reviewed yet. If something here disagrees with that entry, the entry is the reference.</p>`;

function relatedList(id, ed, { limit = Infinity, notes = false } = {}) {
  const rels = (relations.get(id) || []).filter((r) => ed === 'linguist' || has(r.id, ed));
  if (!rels.length) return '';
  const groups = new Map();
  for (const r of rels) {
    if (!groups.has(r.label)) groups.set(r.label, []);
    groups.get(r.label).push(r);
  }
  const ordered = [...groups.keys()].sort((a, b) => (REL_ORDER.indexOf(a) + 99) % 199 - (REL_ORDER.indexOf(b) + 99) % 199);
  let count = 0;
  const parts = [];
  for (const label of ordered) {
    const items = [];
    for (const r of groups.get(label)) {
      if (count >= limit) break;
      count += 1;
      items.push(`<li><a href="${entryUrl(r.id, ed)}">${esc(titleFor(r.id, ed))}</a>${notes && r.notes ? `<span class="rel-note">${esc(r.notes)}</span>` : ''}</li>`);
    }
    if (items.length) parts.push(`<h3>${esc(label)}</h3><ul class="plain">${items.join('')}</ul>`);
  }
  return parts.length ? `<section class="related"><h2>Related constructions</h2>${parts.join('\n')}</section>` : '';
}

const apiLinks = (id) => `<link rel="alternate" type="application/json" href="${BASE}api/${id}.json">\n<link rel="alternate" type="text/markdown" href="${BASE}api/${id}.md">\n`;
const jsonldFor = (id, ed, description) => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: plain(entries.get(id).name),
  alternateName: plain(titleFor(id, 'curious')) !== plain(entries.get(id).name) ? plain(titleFor(id, 'curious')) : undefined,
  termCode: id,
  description: plain(description),
  url: `${ORIGIN}${entryUrl(id, ed)}`,
  inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'English Constructionary', url: `${ORIGIN}${BASE}` },
  license: 'https://creativecommons.org/licenses/by/4.0/',
});

// ---------------------------------------------------------------- entry pages

function curiousPage(id) {
  const c = editions.get(id).curious;
  const body = `<p class="eyebrow">Curious reader</p>
<h1>${esc(c.title)}</h1>
<p class="deck">${esc(c.summary)}</p>
${sketchNote(id, 'curious')}
${paras(c.body)}
<h2>Examples</h2>
${exampleList(c.examples, { mode: 'curious' })}
${c.try ? `<h2>Try it</h2>\n${paras(c.try)}` : ''}
${relatedList(id, 'curious', { limit: 8 })}
${DRAFT_NOTE(id)}
<p class="meta">Technical name: ${esc(entries.get(id).name)}. <a href="${entryUrl(id, 'linguist')}">Read the full analysis</a>.</p>`;
  return page({ ed: 'curious', kind: 'entry', id, title: `${c.title} · English Constructionary`, description: c.summary, canonical: entryUrl(id, 'curious'), crumbs: [esc(c.title)], body, alternates: apiLinks(id), jsonld: jsonldFor(id, 'curious', c.summary) });
}

function teacherPage(id) {
  const t = editions.get(id).teacher;
  const e = entries.get(id);
  const body = `<p class="eyebrow">Teacher</p>
<h1>${esc(e.name)}</h1>
<p class="deck">${esc(t.summary)}</p>
${sketchNote(id, 'teacher')}
<h2>How to explain it</h2>
${paras(t.explain)}
${t.terms ? `<h2>Terms</h2>\n${paras(t.terms)}` : ''}
<h2>Examples</h2>
${exampleList(t.examples, { mode: 'teacher' })}
${t.contrasts && t.contrasts.length ? `<h2>Contrasts to teach</h2>\n${exampleList(t.contrasts, { mode: 'teacher' })}` : ''}
${t.watch_for && t.watch_for.length ? `<h2>Watch for</h2>\n<ul class="bullets">${t.watch_for.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}
${t.activity ? `<h2>In class</h2>\n${paras(t.activity)}` : ''}
${relatedList(id, 'teacher', { limit: 8 })}
<p class="meta">For the grammar terms used here, see the glossary in the <a href="/language-landscapes/companion/">Language Landscapes companion</a>.</p>
${DRAFT_NOTE(id)}`;
  return page({ ed: 'teacher', kind: 'entry', id, title: `${e.name} · Teacher edition · English Constructionary`, description: t.summary, canonical: entryUrl(id, 'teacher'), crumbs: [`<a href="${landingUrl('teacher')}">Teacher</a>`, esc(e.name)], body, alternates: apiLinks(id), jsonld: jsonldFor(id, 'teacher', t.summary) });
}

function childPage(id) {
  const k = editions.get(id).child;
  const title = editions.get(id).curious.title;
  const body = `<p class="eyebrow">For young readers</p>
<h1>${esc(k.hook)}</h1>
${sketchNote(id, 'child')}
${paras(k.explain)}
<h2>Examples</h2>
${exampleList(k.examples, { mode: 'child' })}
<h2>Play</h2>
${paras(k.play)}
${relatedList(id, 'child', { limit: 6 })}
${DRAFT_NOTE(id)}`;
  return page({ ed: 'child', kind: 'entry', id, title: `${title} · For young readers · English Constructionary`, description: k.hook, canonical: entryUrl(id, 'child'), crumbs: [`<a href="${landingUrl('child')}">Child</a>`, esc(title)], body, alternates: apiLinks(id), jsonld: jsonldFor(id, 'child', k.hook) });
}

const SECURED = {
  stable: 'Stable: the profile recurs.',
  networked: 'Networked: its properties are linked to one another, not merely co-occurring.',
  maintained: 'Maintained: a named process keeps the profile in place.',
  controlled: 'Controlled: a process registers departures and corrects them.',
};

function kindSection(e) {
  const k = e.kind;
  if (!k) return '';
  const parts = [];
  if (k.projection) {
    parts.push(`<h3>What recognizing it lets you predict</h3>${paras(k.projection.target)}`);
    if (k.projection.evidence) parts.push(`<h3>Evidence for the projection</h3>${paras(k.projection.evidence)}`);
    if (k.projection.confidence) parts.push(`<p class="meta">Confidence: ${esc(k.projection.confidence)}.</p>`);
    if (k.projection.grounds && k.projection.grounds.length) parts.push(`<ul class="plain grounds">${k.projection.grounds.map(groundItem).join('')}</ul>`);
  }
  parts.push(`<p class="meta">${esc(k.secured ? (SECURED[k.secured] || `Secured: ${k.secured}.`) : 'Evidence level: not yet assessed (stable, networked, maintained or controlled).')}${k.provisional ? ' Provisional.' : ''}</p>`);
  if (k.profile) {
    for (const tier of ['core', 'peripheral']) {
      const list = k.profile[tier];
      if (!list || !list.length) continue;
      parts.push(`<h3>${tier === 'core' ? 'Core properties' : 'Peripheral properties'}</h3><ul class="bullets">${list.map((p) => `<li>${esc(p.property)}${p.diagnostics ? ` <span class="meta">(${esc([].concat(p.diagnostics).join('; '))})</span>` : ''}</li>`).join('')}</ul>`);
    }
  }
  if (k.boundaries && k.boundaries.known_boundary_items) {
    parts.push(`<h3>Boundary cases</h3><ul class="bullets">${k.boundaries.known_boundary_items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`);
  }
  const rest = Object.fromEntries(Object.entries(k).filter(([key]) => !['projection', 'secured', 'provisional', 'profile', 'boundaries'].includes(key)));
  if (k.boundaries) {
    const extra = Object.fromEntries(Object.entries(k.boundaries).filter(([key]) => key !== 'known_boundary_items'));
    if (Object.keys(extra).length) rest.boundaries = extra;
  }
  if (Object.keys(rest).length) parts.push(renderValue(rest));
  return `<section><h2>Kind and projectibility</h2>${parts.join('\n')}</section>`;
}

function linguistPage(id) {
  const e = entries.get(id);
  const meanings = Object.entries(e.meanings || {});
  const meaningHtml = meanings.map(([key, m]) => {
    const head = meanings.length > 1 ? `<h3>Meaning ${esc(key)}</h3>` : '';
    let impl = '';
    if (m.implements) {
      const mm = String(m.implements).match(/^(.*?-\d{3})(?:[.#](\w+))?$/) || [null, m.implements, null];
      const [implId, implMeaning] = [mm[1], mm[2]];
      const label = entries.has(implId) ? `${entries.get(implId).name}${implMeaning ? `, meaning ${implMeaning}` : ''}` : m.implements;
      impl = entries.has(implId)
        ? `<p>Implements <a href="${entryUrl(implId, 'linguist')}${implMeaning ? `#meaning-${esc(implMeaning)}` : ''}">${esc(label)}</a>${m.specialization ? `: ${esc(m.specialization)}` : ''}</p>`
        : `<p>Implements ${esc(label)}${m.specialization ? `: ${esc(m.specialization)}` : ''}</p>`;
    }
    return `<div id="meaning-${esc(key)}">${head}${m.definition ? `<p>${esc(m.definition)}</p>` : ''}${impl}${m.details ? paras(m.details) : ''}${exampleList((m.examples || []).map((x) => ({ ...x, text: x.form })), { mode: 'linguist' })}</div>`;
  }).join('\n');
  const constraints = (e.constraints || []).length
    ? `<section><h2>Constraints</h2><ul class="bullets">${e.constraints.map((c) => `<li>${c.type ? `<span class="tag">${esc(c.type)}</span> ` : ''}${esc(c.description || '')}</li>`).join('')}</ul></section>` : '';
  const dims = e.dimensions ? `<section><h2>Dimensions</h2>${renderValue(e.dimensions)}</section>` : '';
  const refKeys = [['semanticRefs', 'Semantic features'], ['formRefs', 'Form features'], ['syntacticRefs', 'Syntactic diagnostics'], ['lexiconRefs', 'Lexicon lists']];
  const refs = refKeys.filter(([k]) => e[k] && e[k].length).map(([k, label]) => `<dt>${label}</dt><dd>${e[k].map((r) => indexDescriptions[r] ? `<abbr title="${escRaw(plain(indexDescriptions[r]))}">${esc(r)}</abbr>` : esc(r)).join(', ')}</dd>`).join('');
  const refsHtml = refs ? `<section><h2>Index terms</h2><dl class="facts">${refs}</dl></section>` : '';
  const grounds = (e.grounds || []).length ? `<section><h2>Sources</h2><ul class="plain grounds">${e.grounds.map(groundItem).join('')}</ul></section>` : '';
  const other = ED_ORDER.filter((k) => k !== 'linguist' && has(id, k)).map((k) => `<a href="${entryUrl(id, k)}">${ED[k].label}</a>`).join(' · ');
  const cite = `Reynolds, Brett, ed. ${SNAPSHOT.date.slice(0, 4)}. “${e.name}.” <cite>English Constructionary</cite>, linguist edition. ${ORIGIN}${entryUrl(id, 'linguist')} (snapshot ${SNAPSHOT.date}, ${commit}).`;
  const description = (meanings[0] && meanings[0][1].definition) || e.name;
  const body = `<p class="eyebrow">Linguist</p>
<h1>${esc(e.name)}</h1>
<p class="meta">${esc(id)}${e.type ? ` · ${esc(e.type)}` : ''}${e.semanticType ? ` · ${esc(e.semanticType)}` : ''}${e.kind && e.kind.provisional ? ' · provisional' : ''}</p>
<p class="pattern">${esc(e.pattern)}</p>
${sketchNote(id, 'linguist')}
<section><h2>Meaning</h2>${meaningHtml}</section>
${constraints}
${dims}
${relatedList(id, 'linguist', { notes: true })}
${refsHtml}
${grounds}
${kindSection(e)}
<section><h2>Use this entry</h2>
${other ? `<p>Other editions: ${other}.</p>` : ''}
<p>Data: <a href="${BASE}api/${id}.json">JSON</a> · <a href="${BASE}api/${id}.md">Markdown</a> · <a href="${REPO}/blob/${esc(commit)}/data/constructions/${esc(fileOf.get(id))}">YAML source</a></p>
<p class="meta">Cite as: ${cite}</p>
</section>`;
  return page({ ed: 'linguist', kind: 'entry', id, title: `${e.name} · Linguist edition · English Constructionary`, description, canonical: entryUrl(id, 'linguist'), crumbs: [`<a href="${landingUrl('linguist')}">Linguist</a>`, esc(e.name)], body, alternates: apiLinks(id), jsonld: jsonldFor(id, 'linguist', description) });
}

// ---------------------------------------------------------------- landing pages

const LANDING = {
  curious: {
    h1: 'English Constructionary',
    deck: 'How English puts words together, one pattern at a time.',
    intro: `A construction is a pattern that pairs a form with a meaning. Some are tiny, like adding -s to make a plural. Others are whole sentence shapes, like <i>She baked him a cake</i>, where the pattern itself adds the idea of giving. This edition explains each pattern in everyday language, with examples you can try on your own speech.`,
  },
  teacher: {
    h1: 'English Constructionary for teachers',
    deck: 'What each pattern is, how to explain it, and what learners might find confusing.',
    intro: `Each entry gives a short explanation for the classroom, examples, contrasts that make the pattern visible, possible confusions to watch for and an activity. Terms follow the glossary of <a href="/language-landscapes/">Language Landscapes</a>; where textbooks use other names, the entry says so.`,
  },
  linguist: {
    h1: 'English Constructionary: linguist edition',
    deck: 'Form, meaning, constraints, relations and evidence for each construction.',
    intro: `Entries follow the categories and functions of <cite>The Cambridge Grammar of the English Language</cite> (Huddleston and Pullum 2002) and a projectibility-first view of kinds: each entry says what recognizing the construction lets you predict, and how far the evidence secures that. Analyses are provisional unless marked otherwise. See also the <a href="${BASE}linguist/words/">closed-class word lists</a>.`,
  },
  child: {
    h1: 'Word patterns to play with',
    deck: 'Little patterns in English that you use every day without noticing.',
    intro: 'Each page asks a question, shows some examples and gives you a game to play with the pattern.',
  },
};

function landingPage(ed) {
  const ids = [...entries.keys()].filter((id) => has(id, ed));
  const sorted = ids.sort((a, b) => plain(titleFor(a, ed)).localeCompare(plain(titleFor(b, ed)), 'en', { sensitivity: 'base' }));
  const L = LANDING[ed];
  const summary = (id) => {
    if (ed === 'linguist') return entries.get(id).pattern;
    if (ed === 'teacher') return editions.get(id).teacher.summary;
    if (ed === 'child') return editions.get(id).child.hook;
    return editions.get(id).curious.summary;
  };
  const fam = Object.entries(families).map(([key, f]) => {
    const members = (f.members || []).filter((id) => has(id, ed));
    if (!members.length) return '';
    return `<details class="family"><summary>${esc(human(key))} <span class="meta">(${members.length})</span></summary><ul>${members.map((id) => `<li><a href="${entryUrl(id, ed)}">${esc(titleFor(id, ed))}</a></li>`).join('')}</ul></details>`;
  }).join('\n');
  const letters = new Map();
  for (const id of sorted) {
    const ch = (plain(titleFor(id, ed)).replace(/^[^A-Za-z]+/, '')[0] || '#').toUpperCase();
    if (!letters.has(ch)) letters.set(ch, []);
    letters.get(ch).push(id);
  }
  const az = [...letters.keys()].map((ch) => `<a href="#letter-${ch}">${ch}</a>`).join('');
  const lists = [...letters.entries()].map(([ch, list]) => `<h3 class="letter" id="letter-${ch}">${ch}</h3><ul class="toc">${list.map((id) => `<li><a href="${entryUrl(id, ed)}">${esc(titleFor(id, ed))}</a>${isSketch(id) ? ' <span class="tag">sketch</span>' : ''}<span class="sum">${esc(plainText(summary(id)))}</span></li>`).join('')}</ul>`).join('\n');
  const drafts = ed === 'linguist' ? '' : `<p class="draft">The ${ED[ed].label.toLowerCase()} edition is a draft, written with AI assistance from the linguist entries and not yet reviewed. Each page links to its linguist entry.</p>`;
  const body = `<p class="eyebrow">${ED[ed].label} edition</p>
<h1>${L.h1}</h1>
<p class="deck">${esc(L.deck)}</p>
${ed === 'curious' ? '<p class="resume" hidden></p>' : ''}
<p>${L.intro}</p>
<p class="meta">${sorted.length} construction${sorted.length === 1 ? '' : 's'} in this edition. Other editions: ${ED_ORDER.filter((k) => k !== ed).map((k) => `<a href="${landingUrl(k)}">${ED[k].label}</a>`).join(' · ')}. <a href="${BASE}about/">About the editions</a>.</p>
<section><h2>Search</h2>
<form class="search" role="search" action="${landingUrl(ed)}"><label for="q">${ed === 'child' ? 'Find a pattern' : 'Search by name, word or example'}</label>
<div class="search-row"><input id="q" name="q" type="search" autocomplete="off" placeholder="${ed === 'child' ? 'a word, like room' : 'enough, room, give'}"><button type="submit">Search</button></div>
<noscript><p class="meta">Search needs JavaScript; the lists below work without it.</p></noscript></form>
<p id="search-status" class="meta" role="status"></p><ol id="search-results"></ol></section>
${fam ? `<section><h2>Browse by topic</h2>${fam}</section>` : ''}
<section><h2>All constructions</h2><div class="az">${az}</div>${lists}</section>
${drafts}`;
  const titles = { curious: 'English Constructionary', teacher: 'English Constructionary for teachers', linguist: 'English Constructionary: linguist edition', child: 'Word patterns to play with · English Constructionary' };
  return page({ ed, kind: 'landing', title: `${titles[ed]} · Brett Reynolds`, description: L.deck, canonical: landingUrl(ed), crumbs: ed === 'curious' ? [] : [ED[ed].label], body, jsonld: ed === 'curious' ? { '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: 'English Constructionary', url: `${ORIGIN}${BASE}`, description: L.deck, license: 'https://creativecommons.org/licenses/by/4.0/', creator: { '@type': 'Person', name: 'Brett Reynolds', url: `${ORIGIN}/` } } : null });
}

function wordsPage() {
  const lists = goldLists.map(({ name, data }) => {
    const groups = Array.isArray(data.items) ? { [data['cgel-category'] || name]: data.items } : Object.fromEntries(Object.entries(data).filter(([, v]) => Array.isArray(v)));
    return Object.entries(groups).map(([label, items]) => `<h3>${esc(human(label))} <span class="meta">(${items.length})</span></h3><ul class="plain">${items.map((w) => {
      const word = typeof w === 'string' ? w : (w.lemma || w.form || JSON.stringify(w));
      const g = glosses.get(String(word).toLowerCase());
      return `<li><i>${esc(word)}</i>${g ? ` <span class="meta">${esc(g)}</span>` : ''}</li>`;
    }).join('')}</ul>`).join('');
  }).join('\n');
  const prof = profiles.map((p) => `<h3><i>${esc(p.lemma)}</i> <span class="meta">${esc(p.category || p['source-pos'] || '')}</span></h3><ul class="plain">${(p.uses || []).map((u) => `<li>${esc(u.label)}${u.example ? `: <span class="ex">${esc(u.example)}</span>` : ''}${(u.links || []).filter((l) => entries.has(l.construction)).map((l) => ` · <a href="${entryUrl(l.construction, 'linguist')}">${esc(entries.get(l.construction).name)}</a>`).join('')}</li>`).join('')}</ul>`).join('\n');
  const body = `<p class="eyebrow">Linguist</p>
<h1>Words</h1>
<p class="deck">Closed-class word lists and words with several construction-specific uses.</p>
<p>The lists assign CGEL categories to words that dictionaries often label differently (many traditional adverbs are prepositions here, for example). They began as a seed from Simple English Wiktionary, curated by Brett Reynolds; the lists and glosses keep that source's CC BY-SA 4.0 licence.</p>
<section><h2>Words with several uses</h2>${prof}</section>
<section><h2>Closed-class lists</h2>${lists}</section>`;
  return page({ ed: 'linguist', kind: 'words', title: 'Words · Linguist edition · English Constructionary', description: 'Closed-class word lists with CGEL categories, and words with several construction-specific uses.', canonical: `${BASE}linguist/words/`, crumbs: [`<a href="${landingUrl('linguist')}">Linguist</a>`, 'Words'], body });
}

function aboutPage(counts) {
  const body = `<p class="eyebrow">About</p>
<h1>About the English Constructionary</h1>
<p class="deck">One dataset of English constructions, written up for four kinds of reader and for machines.</p>
<section><h2>What it is</h2>
<p>The English Constructionary describes English constructions: conventional pairings of form and meaning, from word-level patterns to clause types. Each entry records a pattern, what it means, the constraints on it, its relations to other constructions and the sources it rests on. It follows the categories and functions of <cite>The Cambridge Grammar of the English Language</cite> and asks of each construction what recognizing it lets a speaker or analyst predict.</p></section>
<section><h2>Editions</h2>
<dl class="facts">
<dt>Curious reader</dt><dd>Plain-language explanations for anyone interested in how English works (${counts.curious} entries).</dd>
<dt>Teacher</dt><dd>Explanations, contrasts, possible confusions and a classroom activity (${counts.teacher} entries).</dd>
<dt>Linguist</dt><dd>The full analysis with patterns, constraints, relations and evidence (${counts.linguist} entries). This is the reference edition.</dd>
<dt>Child</dt><dd>Questions, examples and games for readers aged about 8 to 11, for the patterns children notice (${counts.child} entries).</dd>
</dl>
<p>The curious, teacher and child editions are drafts. They were drafted with Claude from the linguist entries, checked against those entries by a second model family (OpenAI's Codex), corrected where the check found problems, and haven't yet been reviewed by the editor. Examples the drafts add are ordinary sentences written for the page; examples presented as unacceptable come from the linguist entries. Where an edition and its linguist entry disagree, the linguist entry is the reference.</p>
<p>${counts.sketch} entries are early sketches, with one example so far and their evidence not yet written up. Every edition of a sketch says so, and the lists mark them.</p></section>
<section><h2>For AI systems and other software</h2>
<p>Start with <a href="${BASE}llms.txt">llms.txt</a>. Every entry is available as <a href="${BASE}api/index.json">JSON and Markdown</a>, and the whole dataset as <a href="${BASE}api/constructions.jsonl">one JSONL file</a>, with the schemas and the relation graph. Entries keep their identifiers across snapshots.</p></section>
<section><h2>How to cite</h2>
<p>Reynolds, Brett, ed. ${SNAPSHOT.date.slice(0, 4)}. <cite>English Constructionary</cite>. ${ORIGIN}${BASE} (snapshot ${SNAPSHOT.date}, ${commit}).</p>
<p>Cite an entry by its linguist-edition address, which each entry page gives.</p></section>
<section><h2>Licences</h2>
<p>Text and data are licensed under <a href="${BASE}content-license.txt">CC BY 4.0</a>; the site code under the <a href="${BASE}code-license.txt">MIT licence</a>. The closed-class word lists and glosses derive from Simple English Wiktionary and keep its CC BY-SA 4.0 licence. Source and history: <a href="${REPO}">GitHub</a>.</p></section>`;
  return page({ ed: 'curious', kind: 'about', title: 'About · English Constructionary', description: 'What the English Constructionary is, its four editions, machine access, citation and licences.', canonical: `${BASE}about/`, crumbs: ['About'], body });
}

// ---------------------------------------------------------------- machine interface

function stripUndefined(o) { return JSON.parse(JSON.stringify(o)); }
function entryRecord(id) {
  const e = entries.get(id);
  const ed = editions.get(id);
  const urls = Object.fromEntries(ED_ORDER.filter((k) => has(id, k)).map((k) => [k, `${ORIGIN}${entryUrl(id, k)}`]));
  return stripUndefined({
    id,
    name: e.name,
    pattern: e.pattern,
    urls,
    entry: e,
    editions: ed ? { curious: ed.curious, teacher: ed.teacher, child: ed.child } : undefined,
    status: {
      entry: e.kind && e.kind.provisional ? 'provisional analysis' : 'analysis',
      secured: (e.kind && e.kind.secured) || 'unassessed',
      depth: isSketch(id) ? 'sketch' : 'entry',
      editions: ed ? { status: ed.status, drafted: ed.drafted, checked: ed.checked } : 'not written',
    },
    licence: 'CC-BY-4.0',
    cite: `Reynolds, Brett, ed. ${SNAPSHOT.date.slice(0, 4)}. "${e.name}." English Constructionary. ${ORIGIN}${entryUrl(id, 'linguist')} (snapshot ${SNAPSHOT.date}, ${commit}).`,
    snapshot: SNAPSHOT,
  });
}
function entryMarkdown(id) {
  const r = entryRecord(id);
  const e = r.entry;
  const lines = [`# ${e.name}`, '', `- id: \`${id}\``, `- pattern: ${e.pattern}`, `- status: ${r.status.entry}; evidence level: ${r.status.secured}${r.status.depth === 'sketch' ? '; early sketch (one example, evidence not yet written up)' : ''}`, `- linguist edition: ${r.urls.linguist}`, `- licence: CC BY 4.0; snapshot ${SNAPSHOT.date} (${commit})`, ''];
  for (const [key, m] of Object.entries(e.meanings || {})) {
    lines.push(`## Meaning ${key}`, '');
    if (m.definition) lines.push(m.definition, '');
    if (m.details) lines.push(m.details, '');
    for (const ex of m.examples || []) lines.push(`- *${ex.form}*${ex.note ? `: ${ex.note}` : ''}`);
    lines.push('');
  }
  if ((e.constraints || []).length) { lines.push('## Constraints', '', ...e.constraints.map((c) => `- ${c.type ? `(${c.type}) ` : ''}${c.description}`), ''); }
  const rels = relations.get(id) || [];
  if (rels.length) { lines.push('## Related constructions', '', ...rels.map((x) => `- ${x.label}: ${entries.get(x.id).name} (\`${x.id}\`)${x.notes ? `: ${x.notes}` : ''}`), ''); }
  if ((e.grounds || []).length) { lines.push('## Sources', '', ...e.grounds.map((g) => `- ${sourceLink(g.source).text}${g.locator ? `, ${g.locator}` : ''} (${g.relation}${g['bears-on'] ? `; bears on ${g['bears-on']}` : ''})${g.note ? `: ${g.note}` : ''}`), ''); }
  if (e.kind && e.kind.projection) { lines.push('## Projection', '', e.kind.projection.target, ''); }
  if (r.editions) {
    lines.push('## Reader editions (draft, AI-assisted, unreviewed; the linguist entry is the reference)', '');
    const c = r.editions.curious;
    if (c) lines.push(`### Curious reader: ${c.title}`, '', c.summary, '', c.body, '');
    const t = r.editions.teacher;
    if (t) lines.push('### Teacher', '', t.summary, '', t.explain, '');
    const k = r.editions.child;
    if (k) lines.push('### Child', '', k.hook, '', k.explain, '');
  }
  return mdItalics(lines.join('\n'));
}

function llmsTxt(counts) {
  return `# English Constructionary

> A dictionary of English constructions (form-meaning pairings, from word-level patterns to clause types), edited by Brett Reynolds. Categories and functions follow The Cambridge Grammar of the English Language (Huddleston and Pullum 2002). Each entry states what recognizing the construction lets you predict and how far the evidence secures that. ${counts.linguist} entries; snapshot ${SNAPSHOT.date} (${commit}).

## How to use this data

- The linguist edition is the reference. The curious-reader, teacher and child editions are drafts derived from it (written with Claude, checked against the entry by Codex, corrected, not yet reviewed by the editor); prefer the linguist entry when they differ. Each record's \`status.editions\` gives the drafting and checking models.
- \`kind.provisional: true\` means the analysis is a working proposal. Don't report it as settled grammar.
- \`status.depth: "sketch"\` marks an early sketch: one example so far and no written-up evidence. Treat its analysis, and every reader edition built on it, as a starting point.
- \`kind.secured\` is the highest evidence level reached: stable, networked, maintained or controlled. Absent means not yet assessed.
- \`grounds\` record what each claim rests on: the source, a locator, the relation (cites, attests, discusses, adjudicates, contradicts, derives-from) and what it bears on.
- Examples in the reader editions marked \`from: constructed\` were written for the page; \`from: entry\` examples come from the linguist entry.
- Text fields may contain <i>...</i> around mentioned forms (house style puts mentions in italics); the Markdown files render them as *...*.
- Cite entries by their linguist-edition URL and the snapshot date.

## Data

- [Entry index](${ORIGIN}${BASE}api/index.json): every entry with its URLs and data files.
- [All entries](${ORIGIN}${BASE}api/constructions.jsonl): one JSON object per line (entry, reader editions, status, citation).
- Per entry: \`${ORIGIN}${BASE}api/<id>.json\` and \`${ORIGIN}${BASE}api/<id>.md\`, for example [numerical-label-001](${ORIGIN}${BASE}api/numerical-label-001.json).
- [Construction schema](${ORIGIN}${BASE}api/schema/construction.json) and [edition schema](${ORIGIN}${BASE}api/schema/edition.json).
- [Relation graph](${ORIGIN}${BASE}api/graph.json): constructions, sources, lexemes and their typed links.
- [Sources](${ORIGIN}${BASE}api/sources.json) and [families](${ORIGIN}${BASE}api/families.json).
- [Snapshot](${ORIGIN}${BASE}api/snapshot.json): date, commit and counts.
- [Source repository](${REPO}): YAML source, validation and history.

## Human editions

- [Curious reader](${ORIGIN}${BASE}) (${counts.curious} entries), [Teacher](${ORIGIN}${BASE}teacher/) (${counts.teacher}), [Linguist](${ORIGIN}${BASE}linguist/) (${counts.linguist}), [Child](${ORIGIN}${BASE}child/) (${counts.child}).
- [About, citation and licences](${ORIGIN}${BASE}about/)

## Licence

Text and data: CC BY 4.0. Code: MIT. Word lists and glosses derived from Simple English Wiktionary: CC BY-SA 4.0.
`;
}

// ---------------------------------------------------------------- build

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const f of ['cx.css', 'cx.js', 'content-license.txt', 'code-license.txt']) {
  fs.copyFileSync(path.join(ROOT, 'site', f), path.join(OUT, f));
}

const counts = { linguist: entries.size, curious: 0, teacher: 0, child: 0, sketch: [...entries.keys()].filter(isSketch).length };
for (const id of entries.keys()) {
  write(`linguist/${id}/index.html`, linguistPage(id));
  if (has(id, 'curious')) { write(`${id}/index.html`, curiousPage(id)); counts.curious += 1; }
  if (has(id, 'teacher')) { write(`teacher/${id}/index.html`, teacherPage(id)); counts.teacher += 1; }
  if (has(id, 'child')) { write(`child/${id}/index.html`, childPage(id)); counts.child += 1; }
}
for (const ed of ED_ORDER) write(`${ED[ed].dir}index.html`, landingPage(ed));
write('linguist/words/index.html', wordsPage());
write('about/index.html', aboutPage(counts));

const search = [...entries.keys()].map((id) => {
  const e = entries.get(id);
  const ed = editions.get(id);
  const ex = [];
  for (const m of Object.values(e.meanings || {})) for (const x of m.examples || []) ex.push(plainText(x.form));
  if (ed) for (const k of ['curious', 'teacher', 'child']) for (const x of ((ed[k] && ed[k].examples) || [])) ex.push(plainText(x.text));
  const fams = Object.entries(families).filter(([, f]) => (f.members || []).includes(id)).map(([k]) => human(k));
  return stripUndefined({
    id,
    name: plain(e.name),
    t: { curious: has(id, 'curious') ? plain(ed.curious.title) : undefined, child: has(id, 'child') ? plain(ed.curious.title) : undefined },
    s: has(id, 'curious') ? plain(ed.curious.summary) : undefined,
    p: e.pattern,
    x: ex.slice(0, 12).join(' | '),
    f: fams.join(', '),
    u: Object.fromEntries(ED_ORDER.filter((k) => has(id, k)).map((k) => [k, entryUrl(id, k)])),
  });
});
write('search.json', JSON.stringify(search));

const records = [...entries.keys()].map(entryRecord);
for (const r of records) {
  write(`api/${r.id}.json`, JSON.stringify(r, null, 2));
  write(`api/${r.id}.md`, entryMarkdown(r.id));
}
write('api/constructions.jsonl', records.map((r) => JSON.stringify(r)).join('\n') + '\n');
write('api/index.json', JSON.stringify({
  name: 'English Constructionary',
  editor: 'Brett Reynolds',
  url: `${ORIGIN}${BASE}`,
  licence: 'CC-BY-4.0',
  snapshot: SNAPSHOT,
  counts,
  entries: records.map((r) => ({ id: r.id, name: r.name, pattern: r.pattern, urls: r.urls, json: `${ORIGIN}${BASE}api/${r.id}.json`, markdown: `${ORIGIN}${BASE}api/${r.id}.md` })),
}, null, 2));
write('api/index.html', page({ ed: 'linguist', kind: 'data', title: 'Data · English Constructionary', description: 'Machine-readable files for the English Constructionary.', canonical: `${BASE}api/`, crumbs: ['Data'], body: `<p class="eyebrow">Data</p><h1>Machine-readable files</h1><p class="deck">Every entry as JSON and Markdown, the whole dataset as JSONL, and the schemas.</p><ul class="bullets"><li><a href="${BASE}llms.txt">llms.txt</a>: how to use the data</li><li><a href="${BASE}api/index.json">index.json</a>: every entry with its URLs</li><li><a href="${BASE}api/constructions.jsonl">constructions.jsonl</a>: all entries, one per line</li><li><a href="${BASE}api/schema/construction.json">Construction schema</a> and <a href="${BASE}api/schema/edition.json">edition schema</a></li><li><a href="${BASE}api/graph.json">graph.json</a>, <a href="${BASE}api/sources.json">sources.json</a>, <a href="${BASE}api/families.json">families.json</a>, <a href="${BASE}api/snapshot.json">snapshot.json</a></li></ul>` }));
fs.mkdirSync(path.join(OUT, 'api/schema'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'data/schemas/construction.json'), path.join(OUT, 'api/schema/construction.json'));
fs.copyFileSync(path.join(ROOT, 'data/schemas/edition.json'), path.join(OUT, 'api/schema/edition.json'));
if (fs.existsSync(path.join(ROOT, 'web/graph.json'))) fs.copyFileSync(path.join(ROOT, 'web/graph.json'), path.join(OUT, 'api/graph.json'));
write('api/sources.json', JSON.stringify(sources, null, 2));
write('api/families.json', JSON.stringify(families, null, 2));
write('api/snapshot.json', JSON.stringify({ ...SNAPSHOT, counts }, null, 2));
write('llms.txt', llmsTxt(counts));

console.log(`Built ${written.length} files into ${OUT}: ${JSON.stringify(counts)}${INCLUDE_UNCHECKED ? ' (including unchecked editions)' : ''}`);

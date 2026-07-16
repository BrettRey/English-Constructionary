/* global jsyaml */
// Manifest paths are root-absolute (e.g. /data/constructions/np-001.yaml).
// Locally the server root is the repo root, so they resolve as-is. On GitHub
// Pages the site lives under /<repo>/, so prefix them with the site base.
const SITE_BASE = window.location.pathname.replace(/\/(?:web\/)?[^/]*$/, '');
const resolvePath = (p) => (p.startsWith('/') ? SITE_BASE + p : p);

const state = {
  manifest: null,
  items: [],
  filtered: [],
  active: null,
  history: [],
  cache: new Map(),
  viewMode: 'summary'
};

const statusEl = document.getElementById('status');
const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const filtersEl = document.getElementById('filters');
const detailTitle = document.getElementById('detail-title');
const detailSubtitle = document.getElementById('detail-subtitle');
const detailBody = document.getElementById('detail-body');
const breadcrumbsEl = document.getElementById('breadcrumbs');
const toggleViewBtn = document.getElementById('toggle-view');
const openLink = document.getElementById('open-link');
const backButton = document.getElementById('back-button');

const setStatus = (text) => {
  statusEl.textContent = text;
};

// Convert [target] brackets to <strong> for example highlighting
const highlightTarget = (text) => {
  return text.replace(/\[([^\]]+)\]/g, '<strong>$1</strong>');
};

const updateBackButton = () => {
  if (!backButton) return;
  const disabled = state.history.length === 0;
  backButton.disabled = disabled;
  backButton.setAttribute('aria-disabled', disabled ? 'true' : 'false');
};

const buildItems = (manifest) => {
  const items = [];
  manifest.sections.forEach((section) => {
    section.items.forEach((item) => {
      items.push({
        ...item,
        sectionId: section.id,
        sectionLabel: section.label
      });
    });
  });
  return items;
};

const renderFilters = (sections) => {
  filtersEl.innerHTML = '';
  sections.forEach((section) => {
    const label = document.createElement('label');
    label.className = 'filter';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    input.dataset.section = section.id;
    input.addEventListener('change', applyFilters);
    const span = document.createElement('span');
    span.textContent = section.label;
    label.appendChild(input);
    label.appendChild(span);
    filtersEl.appendChild(label);
  });
};

const applyFilters = () => {
  const query = searchEl.value.trim().toLowerCase();
  const enabledSections = new Set(
    Array.from(filtersEl.querySelectorAll('input[type="checkbox"]'))
      .filter((input) => input.checked)
      .map((input) => input.dataset.section)
  );

  state.filtered = state.items.filter((item) => {
    if (!enabledSections.has(item.sectionId)) {
      return false;
    }
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query))
    );
  });
  renderList();
};

const renderList = () => {
  listEl.innerHTML = '';
  if (state.filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No items match your search.';
    listEl.appendChild(empty);
    return;
  }
  state.filtered.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item';
    if (state.active && state.active.path === item.path) {
      card.classList.add('is-active');
    }
    const title = document.createElement('div');
    title.className = 'item__title';
    // Show name prominently, id in meta
    title.textContent = item.subtitle || item.title;
    const idMeta = document.createElement('div');
    idMeta.className = 'item__meta';
    idMeta.textContent = item.title;
    card.appendChild(title);
    card.appendChild(idMeta);
    card.addEventListener('click', () => selectItem(item));
    listEl.appendChild(card);
  });
};

const setActiveViewButton = () => {
  toggleViewBtn.textContent = state.viewMode === 'summary' ? 'Show raw' : 'Show summary';
};

const renderYamlSummary = (data, itemMeta = null) => {
  detailBody.innerHTML = '';
  if (!data || typeof data !== 'object') {
    detailBody.innerHTML = '<div class="empty">No structured data found.</div>';
    return;
  }

  const formBlock = document.createElement('div');
  formBlock.className = 'detail-block';
  const formTitle = document.createElement('h3');
  formTitle.textContent = 'Form';
  formBlock.appendChild(formTitle);
  const formGrid = document.createElement('div');
  formGrid.className = 'detail-grid';
  if (data.pattern) {
    const row = document.createElement('div');
    row.innerHTML = `<strong>pattern</strong>: ${data.pattern}`;
    formGrid.appendChild(row);
  }
  if (Array.isArray(data.constraints) && data.constraints.length > 0) {
    const row = document.createElement('div');
    const list = data.constraints
      .map((item) => `${item.type}: ${item.description}`)
      .join('; ');
    row.innerHTML = `<strong>constraints</strong>: ${list}`;
    formGrid.appendChild(row);
  }
  if (Array.isArray(data.formRefs) && data.formRefs.length > 0) {
    const row = document.createElement('div');
    row.innerHTML = `<strong>formRefs</strong>: ${data.formRefs.join(', ')}`;
    formGrid.appendChild(row);
  }
  if (formGrid.children.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No form details provided.';
    formGrid.appendChild(empty);
  }
  formBlock.appendChild(formGrid);
  detailBody.appendChild(formBlock);

  // Dimensions block (mereological bundle)
  if (data.dimensions && typeof data.dimensions === 'object') {
    const dimBlock = document.createElement('div');
    dimBlock.className = 'detail-block';
    const dimTitle = document.createElement('h3');
    dimTitle.textContent = 'Dimensions';
    dimBlock.appendChild(dimTitle);
    const dimGrid = document.createElement('div');
    dimGrid.className = 'detail-grid';
    const dimLabels = { form: 'Form', meaning: 'Meaning', function: 'Function', distribution: 'Distribution' };
    Object.entries(dimLabels).forEach(([key, label]) => {
      if (data.dimensions[key]) {
        const row = document.createElement('div');
        row.innerHTML = `<strong>${label}</strong>: ${data.dimensions[key]}`;
        dimGrid.appendChild(row);
      }
    });
    if (dimGrid.children.length > 0) {
      dimBlock.appendChild(dimGrid);
      detailBody.appendChild(dimBlock);
    }
  }

  if (data.meanings) {
    const meaningsBlock = document.createElement('div');
    meaningsBlock.className = 'detail-block';
    const meaningsTitle = document.createElement('h3');
    meaningsTitle.textContent = 'Meanings';
    meaningsBlock.appendChild(meaningsTitle);
    const meaningsList = document.createElement('div');
    meaningsList.className = 'detail-grid';
    Object.entries(data.meanings).forEach(([key, value]) => {
      if (!value || typeof value !== 'object') return;
      const entry = document.createElement('div');
      const definition = value.definition || value.specialization || value.implements || '—';
      entry.innerHTML = `<strong>${key}</strong>: ${definition}`;
      meaningsList.appendChild(entry);
    });
    meaningsBlock.appendChild(meaningsList);
    detailBody.appendChild(meaningsBlock);
  }

  if (data.meanings) {
    const examples = [];
    Object.entries(data.meanings).forEach(([key, value]) => {
      if (!value || typeof value !== 'object' || !Array.isArray(value.examples)) return;
      value.examples.forEach((example) => {
        if (!example || !example.form) return;
        examples.push({
          meaning: key,
          form: example.form,
          note: example.note || ''
        });
      });
    });

    const exampleBlock = document.createElement('div');
    exampleBlock.className = 'detail-block';
    const exampleTitle = document.createElement('h3');
    exampleTitle.textContent = 'Examples';
    exampleBlock.appendChild(exampleTitle);
    const exampleGrid = document.createElement('div');
    exampleGrid.className = 'detail-grid';

    if (examples.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No examples listed.';
      exampleGrid.appendChild(empty);
    } else {
      examples.forEach((example) => {
        const row = document.createElement('div');
        const note = example.note ? ` — ${example.note}` : '';
        const formDisplay = highlightTarget(example.form);
        row.innerHTML = `<strong>${example.meaning}</strong>: ${formDisplay}${note}`;
        exampleGrid.appendChild(row);
      });
    }
    exampleBlock.appendChild(exampleGrid);
    detailBody.appendChild(exampleBlock);
  }

  if (data.kind) {
    const kindBlock = document.createElement('div');
    kindBlock.className = 'detail-block';
    const kindTitle = document.createElement('h3');
    kindTitle.textContent = 'Kind';
    kindBlock.appendChild(kindTitle);
    const securedTag = document.createElement('span');
    securedTag.className = 'tag';
    securedTag.textContent = `secured: ${data.kind.secured || 'unassessed'}`;
    kindBlock.appendChild(securedTag);
    if (data.kind['failure-mode']) {
      const failureTag = document.createElement('span');
      failureTag.className = 'tag';
      failureTag.textContent = `failure-mode: ${data.kind['failure-mode']}`;
      kindBlock.appendChild(failureTag);
    }
    if (data.kind.projection && data.kind.projection.target) {
      const projection = document.createElement('p');
      projection.textContent = `Projects: ${data.kind.projection.target}`;
      kindBlock.appendChild(projection);
    }
    detailBody.appendChild(kindBlock);
  }

  if (itemMeta && (itemMeta.relations?.length || itemMeta.incomingRelations?.length)) {
    const relationBlock = document.createElement('div');
    relationBlock.className = 'detail-block';
    const relationTitle = document.createElement('h3');
    relationTitle.textContent = 'Relations';
    relationBlock.appendChild(relationTitle);
    const relationGrid = document.createElement('div');
    relationGrid.className = 'detail-grid';

    // Outgoing relations
    const instanceOf = (itemMeta.relations || []).filter((rel) =>
      ['specialization-of', 'implements', 'inherits-from'].includes(rel.relationship)
    );
    const contains = (itemMeta.relations || []).filter((rel) => rel.relationship === 'contains');
    const interfacesWith = (itemMeta.relations || []).filter(
      (rel) => rel.relationship === 'interfaces-with'
    );
    const alternatesWith = (itemMeta.relations || []).filter(
      (rel) => rel.relationship === 'alternates-with'
    );
    const related = (itemMeta.relations || []).filter(
      (rel) =>
        !['specialization-of', 'implements', 'inherits-from', 'contains', 'interfaces-with', 'alternates-with'].includes(rel.relationship)
    );

    // Incoming relations (inverse)
    const isPartOf = (itemMeta.incomingRelations || []).filter(
      (rel) => rel.relationship === 'contains'
    );
    const isSpecializedBy = (itemMeta.incomingRelations || []).filter(
      (rel) => rel.relationship === 'specialization-of'
    );
    const isImplementedBy = (itemMeta.incomingRelations || []).filter(
      (rel) => rel.relationship === 'implements'
    );
    const isInheritedBy = (itemMeta.incomingRelations || []).filter(
      (rel) => rel.relationship === 'inherits-from'
    );

    const renderRelationList = (label, rels, showParthood = false) => {
      if (!rels.length) return;
      const row = document.createElement('div');
      const items = rels
        .map((rel) => {
          const targetId = rel.id;
          let suffix = '';
          if (showParthood && rel.parthood) {
            suffix = ` (${rel.parthood})`;
          }
          return `<span class=\"tag\" data-rel=\"${targetId}\">${targetId}${suffix}</span>`;
        })
        .join(' ');
      row.innerHTML = `<strong>${label}</strong>: ${items}`;
      relationGrid.appendChild(row);
    };

    // Mereological hierarchy (part-whole)
    renderRelationList('Contains', contains, true);
    renderRelationList('Is part of', isPartOf, false);

    // Taxonomic hierarchy (type-subtype)
    renderRelationList('Is an instance of', instanceOf, true);
    renderRelationList('Is specialized by', isSpecializedBy, false);
    renderRelationList('Is implemented by', isImplementedBy, false);

    // Symmetric relations
    renderRelationList('Interfaces with', interfacesWith, true);
    renderRelationList('Alternates with', alternatesWith, false);

    // Other
    renderRelationList('Related to', related, true);

    if (relationGrid.children.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No relations listed.';
      relationGrid.appendChild(empty);
    }

    relationBlock.appendChild(relationGrid);
    detailBody.appendChild(relationBlock);

    relationBlock.querySelectorAll('.tag[data-rel]').forEach((tag) => {
      tag.addEventListener('click', () => {
        const relId = tag.dataset.rel;
        const target = state.byId?.get(relId);
        if (target) selectItem(target);
      });
    });
  }
};

const renderRaw = (text) => {
  detailBody.innerHTML = '';
  const pre = document.createElement('pre');
  pre.textContent = text;
  detailBody.appendChild(pre);
};

const renderBreadcrumbs = (item) => {
  if (!breadcrumbsEl) return;
  breadcrumbsEl.innerHTML = '';
  const crumbs = [];
  const sectionLabel = item.sectionLabel || 'Item';
  crumbs.push({ label: sectionLabel, item: null });

  const isConstruction = item.sectionId === 'constructions';
  if (isConstruction && item.id && state.byId) {
    const visited = new Set();
    let currentId = item.id;
    const ancestry = [];
    const parentPriority = ['specialization-of', 'inherits-from', 'implements'];
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const current = state.byId.get(currentId);
      if (!current) break;
      const relations = current.relations || [];
      let parentRel = null;
      for (const relType of parentPriority) {
        parentRel = relations.find((rel) => rel.relationship === relType);
        if (parentRel) break;
      }
      if (!parentRel) break;
      ancestry.unshift(parentRel.id);
      currentId = parentRel.id;
    }
    ancestry.forEach((ancestorId) => {
      const target = state.byId.get(ancestorId);
      crumbs.push({
        label: target ? target.title : ancestorId,
        item: target || null
      });
    });
  }

  crumbs.push({ label: item.title, item });

  crumbs.forEach((crumb, index) => {
    const span = document.createElement('span');
    span.className = 'breadcrumb';
    if (index === crumbs.length - 1) span.classList.add('is-current');
    span.textContent = crumb.label;
    if (crumb.item && index !== crumbs.length - 1) {
      span.addEventListener('click', () => selectItem(crumb.item));
    }
    breadcrumbsEl.appendChild(span);
    if (index < crumbs.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'breadcrumb-sep';
      sep.textContent = '/';
      breadcrumbsEl.appendChild(sep);
    }
  });
};

const pushHistory = (item) => {
  state.history.push(item);
  if (state.history.length > 50) {
    state.history.shift();
  }
};

const renderLexemeSummary = (lexeme) => {
  detailBody.innerHTML = '';
  const block = document.createElement('div');
  block.className = 'detail-block';
  const title = document.createElement('h3');
  title.textContent = 'Lexeme';
  block.appendChild(title);

  const addTag = (text) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = text;
    block.appendChild(tag);
  };
  addTag(`category: ${lexeme.category}${lexeme.override && lexeme.override.subclass ? ` (${lexeme.override.subclass})` : ''}`);
  if (lexeme.deitality) addTag(`deitality: ${lexeme.deitality}`);
  addTag(lexeme.override ? `provenance: ${lexeme.override.provenance}` : `status: ${lexeme.status || 'seed'}`);
  if (lexeme.override && lexeme.override.confidence) addTag(`confidence: ${lexeme.override.confidence}`);

  const grid = document.createElement('div');
  grid.className = 'detail-grid';
  const addRow = (html) => {
    const row = document.createElement('div');
    row.innerHTML = html;
    grid.appendChild(row);
  };
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boldLemma = (text) => {
    if (!text) return text;
    const lead = /^\w/.test(lexeme.lemma) ? '\\b' : '';
    const trail = /\w$/.test(lexeme.lemma) ? '\\b' : '';
    const re = new RegExp(`${lead}(${escapeRe(lexeme.lemma)})${trail}`, 'gi');
    return text.replace(re, '<strong>$1</strong>');
  };
  if (lexeme.senses && lexeme.senses.length) {
    lexeme.senses.forEach((sense, index) => {
      const example = sense.example ? ` <em>${boldLemma(sense.example)}</em>` : '';
      addRow(`<strong>${index + 1}.</strong> ${boldLemma(sense.gloss)}${example}`);
    });
  }
  const wikiSlug = encodeURIComponent(lexeme.lemma.replace(/ /g, '_'));
  addRow(`<strong>Source</strong>: data/lexicon/${lexeme.source}${lexeme.override && lexeme.override['source-pos'] ? ` (source POS: ${lexeme.override['source-pos']})` : ''} · <a href="https://en.wiktionary.org/wiki/${wikiSlug}#English" target="_blank" rel="noreferrer">Wiktionary</a> · <a href="https://simple.wiktionary.org/wiki/${wikiSlug}" target="_blank" rel="noreferrer">Simple</a>`);
  if (lexeme.override && lexeme.override.notes) addRow(`<strong>Notes</strong>: ${lexeme.override.notes}`);
  if (lexeme.override && lexeme.override.tests.length) {
    lexeme.override.tests.forEach((test) => {
      addRow(`<strong>Test</strong>: ${test.test} — ${test.result}${test.example ? ` (${test.example})` : ''}`);
    });
  }
  if (lexeme.override && lexeme.override.references.length) {
    addRow(`<strong>References</strong>: ${lexeme.override.references.join('; ')}`);
  }
  block.appendChild(grid);
  detailBody.appendChild(block);

  if (lexeme.constructions && lexeme.constructions.length) {
    const relBlock = document.createElement('div');
    relBlock.className = 'detail-block';
    const relTitle = document.createElement('h3');
    relTitle.textContent = 'Constructions';
    relBlock.appendChild(relTitle);
    const relGrid = document.createElement('div');
    relGrid.className = 'detail-grid';
    lexeme.constructions.forEach((cid) => {
      const row = document.createElement('div');
      const target = state.byId && state.byId.get(cid);
      if (target) {
        const link = document.createElement('span');
        link.className = 'breadcrumb';
        link.textContent = cid;
        link.addEventListener('click', () => selectItem(target));
        row.appendChild(link);
      } else {
        row.textContent = cid;
      }
      relGrid.appendChild(row);
    });
    relBlock.appendChild(relGrid);
    detailBody.appendChild(relBlock);
  }
};

const selectItem = async (item, options = {}) => {
  const { pushHistory: shouldPush = true } = options;
  if (shouldPush && state.active && state.active.path !== item.path) {
    pushHistory(state.active);
  }
  state.active = item;
  renderList();
  renderBreadcrumbs(item);
  // item.title = id, item.subtitle = name; display name prominently
  detailTitle.textContent = item.subtitle || item.title;
  detailSubtitle.textContent = item.title;
  toggleViewBtn.disabled = false;
  openLink.href = resolvePath(item.path);
  openLink.setAttribute('aria-disabled', 'false');

  if (item.kind === 'lexeme' && item.lexeme && state.viewMode === 'summary') {
    detailSubtitle.textContent = `Lexeme · ${item.lexeme.category}`;
    renderLexemeSummary(item.lexeme);
    setStatus('Ready');
    updateBackButton();
    return;
  }

  setStatus(`Loading ${item.title}…`);
  try {
    let text = state.cache.get(item.path);
    if (!text) {
      const response = await fetch(resolvePath(item.path));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      text = await response.text();
      state.cache.set(item.path, text);
    }

    if (item.kind === 'pdf') {
      detailBody.innerHTML = '<div class="empty">PDF preview not available. Use “Open file”.</div>';
      toggleViewBtn.disabled = true;
      setStatus('PDF ready.');
      return;
    }

    if (state.viewMode === 'summary' && item.kind === 'yaml') {
      try {
        const data = jsyaml.load(text);
        // Update subtitle to show type + id
        if (data.type) {
          const typeLabel = data.type.charAt(0).toUpperCase() + data.type.slice(1);
          detailSubtitle.textContent = `${typeLabel} · ${item.title}`;
        }
        renderYamlSummary(data, item);
      } catch (err) {
        renderRaw(text);
      }
    } else {
      renderRaw(text);
    }
    setStatus('Ready');
  } catch (error) {
    detailBody.innerHTML = `<div class="empty">Failed to load file: ${error.message}</div>`;
    setStatus('Failed to load file');
  }
  updateBackButton();
};

const init = async () => {
  try {
    const response = await fetch('./manifest.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    state.manifest = manifest;
    state.items = buildItems(manifest);
    state.byId = new Map(
      state.items
        .filter((item) => item.id)
        .map((item) => [item.id, item])
    );
    state.filtered = state.items;
    renderFilters(manifest.sections);
    renderList();
    setStatus(`Loaded ${state.items.length} items`);
  } catch (error) {
    setStatus('Failed to load manifest');
    detailBody.innerHTML = `<div class="empty">Could not load manifest.json: ${error.message}</div>`;
  }
};

searchEl.addEventListener('input', applyFilters);

toggleViewBtn.addEventListener('click', () => {
  state.viewMode = state.viewMode === 'summary' ? 'raw' : 'summary';
  setActiveViewButton();
  if (state.active) {
    selectItem(state.active, { pushHistory: false });
  }
});

if (backButton) {
  backButton.addEventListener('click', () => {
    const previous = state.history.pop();
    if (previous) {
      updateBackButton();
      selectItem(previous, { pushHistory: false });
    }
  });
}

setActiveViewButton();
init();

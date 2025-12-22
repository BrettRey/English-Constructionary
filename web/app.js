/* global jsyaml */
const state = {
  manifest: null,
  items: [],
  filtered: [],
  active: null,
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
const toggleViewBtn = document.getElementById('toggle-view');
const openLink = document.getElementById('open-link');

const setStatus = (text) => {
  statusEl.textContent = text;
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
    title.textContent = item.title;
    const meta = document.createElement('div');
    meta.className = 'item__meta';
    meta.textContent = `${item.sectionLabel} · ${item.path}`;
    card.appendChild(title);
    if (item.subtitle) {
      const subtitle = document.createElement('div');
      subtitle.className = 'item__meta';
      subtitle.textContent = item.subtitle;
      card.appendChild(subtitle);
    }
    card.appendChild(meta);
    card.addEventListener('click', () => selectItem(item));
    listEl.appendChild(card);
  });
};

const setActiveViewButton = () => {
  toggleViewBtn.textContent = state.viewMode === 'summary' ? 'Show raw' : 'Show summary';
};

const renderYamlSummary = (data) => {
  detailBody.innerHTML = '';
  if (!data || typeof data !== 'object') {
    detailBody.innerHTML = '<div class="empty">No structured data found.</div>';
    return;
  }

  const headerBlock = document.createElement('div');
  headerBlock.className = 'detail-block';
  const headerTitle = document.createElement('h3');
  headerTitle.textContent = 'Overview';
  headerBlock.appendChild(headerTitle);
  const grid = document.createElement('div');
  grid.className = 'detail-grid';
  ['id', 'name', 'pattern'].forEach((key) => {
    if (data[key]) {
      const row = document.createElement('div');
      row.innerHTML = `<strong>${key}</strong>: ${data[key]}`;
      grid.appendChild(row);
    }
  });
  headerBlock.appendChild(grid);
  detailBody.appendChild(headerBlock);

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

  if (data.hpc && data.hpc.status) {
    const hpcBlock = document.createElement('div');
    hpcBlock.className = 'detail-block';
    const hpcTitle = document.createElement('h3');
    hpcTitle.textContent = 'HPC';
    hpcBlock.appendChild(hpcTitle);
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = `status: ${data.hpc.status}`;
    hpcBlock.appendChild(tag);
    detailBody.appendChild(hpcBlock);
  }
};

const renderRaw = (text) => {
  detailBody.innerHTML = '';
  const pre = document.createElement('pre');
  pre.textContent = text;
  detailBody.appendChild(pre);
};

const selectItem = async (item) => {
  state.active = item;
  renderList();
  detailTitle.textContent = item.title;
  detailSubtitle.textContent = item.subtitle || item.path;
  toggleViewBtn.disabled = false;
  openLink.href = item.path;
  openLink.setAttribute('aria-disabled', 'false');

  setStatus(`Loading ${item.title}…`);
  try {
    let text = state.cache.get(item.path);
    if (!text) {
      const response = await fetch(item.path);
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
        renderYamlSummary(data);
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
};

const init = async () => {
  try {
    const response = await fetch('./manifest.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    state.manifest = manifest;
    state.items = buildItems(manifest);
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
    selectItem(state.active);
  }
});

setActiveViewButton();
init();

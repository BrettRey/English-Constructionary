// English Constructionary on brettreynolds.ca. MIT licence: see code-license.txt.
// Progressive enhancement only: every page works without this script.
// 1. Remembers the reader's edition and offers it back on the landing page.
// 2. Runs search over search.json on the edition landing pages.
(function () {
  const body = document.body;
  const base = body.dataset.base || '/constructionary/';
  const edition = body.dataset.edition || 'curious';
  const KEY = 'cx-edition';
  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const write = (v) => { try { localStorage.setItem(KEY, v); } catch { /* ignore */ } };

  document.querySelectorAll('.editions a[data-edition]').forEach((a) => {
    a.addEventListener('click', () => write(a.dataset.edition));
  });
  if (body.dataset.page === 'entry' || body.dataset.page === 'landing') {
    if (edition !== 'curious' || read()) write(edition);
  }

  // Landing page for curious readers: offer the edition chosen last time.
  const resume = document.querySelector('.resume');
  const saved = read();
  if (resume && saved && saved !== edition && body.dataset.page === 'landing') {
    const link = document.querySelector(`.editions a[data-edition="${saved}"]`);
    if (link) {
      resume.innerHTML = '';
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = `Continue in the ${link.textContent.trim()} edition →`;
      resume.appendChild(a);
      resume.hidden = false;
    }
  }

  // Search
  const form = document.querySelector('form.search');
  if (!form) return;
  const input = form.querySelector('input[type=search]');
  const status = document.getElementById('search-status');
  const results = document.getElementById('search-results');
  let index = null;

  const norm = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9' ]+/g, ' ');
  async function load() {
    if (index) return index;
    const res = await fetch(base + 'search.json');
    index = await res.json();
    index.forEach((r) => {
      r._title = norm([r.name, r.t && r.t[edition], r.t && r.t.curious].join(' '));
      r._text = norm([r.s, r.p, r.x, r.f, r.id].join(' '));
    });
    return index;
  }
  function score(r, terms) {
    let total = 0;
    for (const t of terms) {
      const inTitle = r._title.includes(t);
      const inText = r._text.includes(t);
      if (!inTitle && !inText) return 0;
      total += inTitle ? 3 : 1;
      if (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(r._title)) total += 2;
    }
    return total;
  }
  function render(list, q) {
    results.innerHTML = '';
    status.textContent = list.length
      ? `${list.length} construction${list.length === 1 ? '' : 's'} match “${q}”.`
      : `Nothing matches “${q}”. Try a single word from an example, such as “enough” or “room”.`;
    for (const r of list.slice(0, 40)) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const here = r.u[edition];
      a.href = here || r.u.linguist;
      a.textContent = (edition === 'curious' || edition === 'child') && r.t && r.t[edition] ? r.t[edition] : r.name;
      li.appendChild(a);
      if (!here) {
        const m = document.createElement('span');
        m.className = 'sum';
        m.textContent = 'Linguist edition only, so far.';
        li.appendChild(m);
      } else if (r.s && edition !== 'linguist') {
        const m = document.createElement('span');
        m.className = 'sum';
        m.textContent = r.s;
        li.appendChild(m);
      } else if (r.p) {
        const m = document.createElement('span');
        m.className = 'sum';
        m.textContent = r.p;
        li.appendChild(m);
      }
      results.appendChild(li);
    }
  }
  async function run(q) {
    const terms = norm(q).split(/\s+/).filter((t) => t.length > 1);
    if (!terms.length) { results.innerHTML = ''; status.textContent = ''; return; }
    status.textContent = 'Searching…';
    const idx = await load();
    // In the child edition, show only patterns that have a child page.
    const list = idx.filter((r) => edition !== 'child' || r.u.child).map((r) => [score(r, terms), r]).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name)).map(([, r]) => r);
    render(list, q);
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    const url = new URL(location.href);
    if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    run(q);
  });
  const q0 = new URL(location.href).searchParams.get('q');
  if (q0) { input.value = q0; run(q0); }
})();

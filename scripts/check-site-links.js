#!/usr/bin/env node
// Checks every internal link and asset in the built website edition.
//   node scripts/check-site-links.js <website-root> [/constructionary/]
// <website-root> is the website checkout (it must contain /style-v3.css and
// /theme.js, and the built /constructionary/ directory). Exit 1 on a broken link.

const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || '.');
const base = process.argv[3] || '/constructionary/';
const dir = path.join(root, base);
const pages = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.html')) pages.push(p);
  }
})(dir);

const exists = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  const target = path.join(root, clean);
  if (clean.endsWith('/')) return fs.existsSync(path.join(target, 'index.html'));
  return fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html'));
};

let broken = 0;
let checked = 0;
const anchorsByPage = new Map();
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  anchorsByPage.set(page, ids);
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|data:)/.test(url)) continue;
    checked += 1;
    if (url.startsWith('#')) {
      if (url.length > 1 && !ids.has(url.slice(1))) { broken += 1; console.error(`${path.relative(root, page)}: missing anchor ${url}`); }
      continue;
    }
    const abs = url.startsWith('/') ? url : path.posix.join(path.posix.dirname('/' + path.relative(root, page).split(path.sep).join('/')), url);
    if (!exists(abs)) { broken += 1; console.error(`${path.relative(root, page)}: broken ${url}`); }
  }
}
console.log(`${pages.length} pages, ${checked} internal links checked, ${broken} broken.`);
process.exit(broken ? 1 : 0);

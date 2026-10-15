// Wraps content fragments in src/pages/** with the shared page shell and writes static HTML to the site root.
// Run: node scripts/build-pages.mjs   (or `npm run build` to also rebuild tokens)
//
// Fragment format:
//   ---
//   title: Button
//   description: Triggers an action…
//   figma: 3769-50169          (optional, Figma node id for the "View in Figma" link)
//   scripts: foundations.js    (optional, extra scripts from /js, comma separated)
//   ---
//   <div class="doc-content">…</div>
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src/pages');

// Brand registry (written by build-brands.mjs) → tiny inline bootstrap that picks the brand before first paint
const reg = JSON.parse(readFileSync(join(root, 'js/brands-data.js'), 'utf8').replace(/^[\s\S]*?window\.DRS_BRANDS = /, '').replace(/;\s*$/, ''));
const boot = { ids: reg.brands.map(b => b.id), def: reg.default, fonts: Object.fromEntries(reg.brands.filter(b => b.google && !/DM\+Sans/.test(b.google)).map(b => [b.id, b.google])) };
const bootJS = `(function(d){var R=${JSON.stringify(boot)},h=d.documentElement,q,s,b;try{q=new URLSearchParams(location.search).get('brand')}catch(e){}try{s=localStorage.getItem('drs-brand')}catch(e){}b=[q,s,R.def].filter(function(x){return x&&R.ids.indexOf(x)>-1})[0];if(q&&q===b){try{localStorage.setItem('drs-brand',b)}catch(e){}}h.setAttribute('data-brand',b);var r=h.getAttribute('data-root')||'';d.write('<link rel="stylesheet" href="'+r+'css/brands/'+b+'.css" data-brand-css="'+b+'">'+(R.fonts[b]?'<link rel="stylesheet" href="'+R.fonts[b]+'" data-brand-font="'+b+'">':''))})(document);`;

const walk = d => readdirSync(d).flatMap(f => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
});

const shell = ({ title, description, figma, figmaFile, scripts, styles, body, base }) => `<!doctype html>
<html lang="en" data-root="${base}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · DRS Design System</title>
<meta name="description" content="${description}">
<meta name="theme-color" content="#262626">
<link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&display=swap">
<link rel="stylesheet" href="${base}css/tokens.css">
<script>${bootJS}</script>
<link rel="stylesheet" href="${base}css/components.css">
<link rel="stylesheet" href="${base}css/patterns.css">
<link rel="stylesheet" href="${base}css/brand-components.css">
<link rel="stylesheet" href="${base}css/docs.css">
${styles.map(s => `<link rel="stylesheet" href="${base}css/${s}">`).join('\n')}
</head>
<body>
<main${figma ? ` data-figma="${figma}"` : ''}${figmaFile ? ` data-figma-file="${figmaFile}"` : ''}>
${body.trim()}
</main>
<script src="${base}js/tokens-data.js"></script>
<script src="${base}js/brands-data.js"></script>
<script src="${base}js/main.js"></script>
<script src="${base}js/components.js"></script>
${scripts.map(s => `<script src="${base}js/${s}"></script>`).join('\n')}
</body>
</html>
`;

let n = 0;
for (const file of walk(src)) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Missing front matter: ${file}`);
  const fm = Object.fromEntries(m[1].split('\n').filter(Boolean).map(l => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  const rel = relative(src, file);
  const depth = rel.split(sep).length - 1;
  const out = join(root, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, shell({
    title: fm.title,
    description: (fm.description || '').replace(/"/g, '&quot;'),
    figma: fm.figma,
    figmaFile: fm.figmaFile,
    scripts: (fm.scripts || '').split(',').map(s => s.trim()).filter(Boolean),
    styles: (fm.styles || '').split(',').map(s => s.trim()).filter(Boolean),
    body: m[2],
    base: '../'.repeat(depth)
  }));
  n++;
}
// src/static/** is copied verbatim (pages that must not get the docs shell, e.g. the Theme builder preview frame)
const staticDir = join(root, 'src/static');
const copyAll = d => readdirSync(d).forEach(f => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) return copyAll(p);
  const outFile = join(root, relative(staticDir, p));
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, readFileSync(p));
});
try { copyAll(staticDir); } catch (e) { if (e.code !== 'ENOENT') throw e; }
console.log(`Built ${n} pages`);

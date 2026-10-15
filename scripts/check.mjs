// Checks every built page for broken local links/assets and duplicate ids.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['node_modules', 'src', 'specs', 'scripts', '.claude', '.git']);
const pages = (function walk(d) { return readdirSync(d).flatMap(f => { const p = join(d, f); if (skip.has(f)) return []; return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []; }); })(root);
let bad = 0;
for (const page of pages) {
  const html = readFileSync(page, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<pre[\s\S]*?<\/pre>/g, '');
  const refs = [...html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g), ...html.matchAll(/url\(([^)'"]+)\)/g)].map(m => m[1]);
  for (const r of refs) {
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(r) || r.includes("' +")) continue;
    const target = r.startsWith('/') ? join(root, r) : resolve(dirname(page), r);
    if (!existsSync(target)) { console.log(`MISSING  ${page.replace(root + '/', '')} -> ${r}`); bad++; }
  }
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) { console.log(`DUP IDS  ${page.replace(root + '/', '')}: ${[...new Set(dup)].join(', ')}`); bad++; }
  for (const m of html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) for (const id of m[1].split(' ')) if (!ids.includes(id)) { console.log(`BAD ARIA ${page.replace(root + '/', '')}: #${id}`); bad++; }
}
console.log(`${pages.length} pages checked, ${bad} problems`);
process.exit(bad ? 1 : 0);

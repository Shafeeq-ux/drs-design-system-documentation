// Packages the built site into _site/ for hosting under a sub-path (e.g. GitHub Pages project sites).
// Usage: node scripts/build-site.mjs /drs-design-system-documentation/
// Root-absolute asset URLs (url(/assets/…)) are prefixed with the base path; everything else is relative already.
// Local dev (npm run dev) and Vercel serve from the root and don't need this step.
import { readdirSync, statSync, mkdirSync, readFileSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { dirname, join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = ('/' + (process.argv[2] || '/').replace(/^\/+|\/+$/g, '') + '/').replace(/\/+/g, '/');
const out = join(root, '_site');
const skip = new Set(['_site', 'src', 'scripts', 'specs', 'node_modules', '.git', '.github', '.claude', '.vercel', 'package.json', 'package-lock.json', 'vercel.json', '.vercelignore', '.gitignore', '.DS_Store']);
const text = new Set(['.html', '.css', '.js', '.json', '.svg']);

rmSync(out, { recursive: true, force: true });
let files = 0, rewrites = 0;
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    if (skip.has(f)) continue;
    const p = join(dir, f), rel = relative(root, p), dest = join(out, rel);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    mkdirSync(dirname(dest), { recursive: true });
    if (base !== '/' && text.has(extname(f))) {
      const src = readFileSync(p, 'utf8');
      const res = src.replace(/url\(\/assets\//g, () => { rewrites++; return `url(${base}assets/`; });
      writeFileSync(dest, res);
    } else copyFileSync(p, dest);
    files++;
  }
})(root);
console.log(`Packaged ${files} files into _site/ for base ${base} (${rewrites} asset URLs rewritten)`);

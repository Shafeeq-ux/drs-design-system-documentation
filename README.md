# DRS Design System — multi-brand foundation

HTML/CSS implementation and documentation of the Figma libraries
**DR 2.0 – SC GM Chevrolet Design Foundation** ([Figma](https://www.figma.com/design/ilpJ5K66cGR85o287K4HDD)) — tokens and components —
and **DR 2.0 – SC GM Chevy Components** ([Figma](https://www.figma.com/design/g5hh34klkdaAOzyjoDRDgJ)) — patterns.

Multi-brand: DRS Base (default), Chevrolet, GMC, Buick, Cadillac and Car Bravo. They are driven by the token files in `tokens/brands/source/`.

Static site, no framework, no runtime build. Deployable to Vercel as-is.

## Structure

```
css/tokens.css          generated design tokens (--aec-*)           ← do not edit
css/brands/<id>.css     generated runtime brand tokens, scoped to [data-brand="<id>"]   ← do not edit
css/brand-components.css generated bridge: brand tokens → .aec-* components (from scripts/brand-bridge.mjs)
css/brand-tools.css     Brands section: compare grid, token explorer, Theme builder
css/components.css      component styles (.aec-*)
css/patterns.css        composite patterns (.aec-*): template, sheets, cards, mathbox …
css/docs.css            documentation-site chrome (.doc-*)
js/components.js        component behaviour (tabs, menu, modal, slider, …) — window.AEC
js/main.js              docs chrome: header, sidebar, search, copy, code toggles
js/foundations.js       renders swatches / type scale / spacing from js/tokens-data.js
tokens/chevrolet.json   original Figma foundation tokens (fallback :root values)
tokens/brands/brands.json   brand registry (id, name, file, font substitutes)
tokens/brands/source/   brand token files as delivered (.drp-* classes + --aec-* vars)
downloads/brands/       generated downloads per brand: .css, .vars.css, .json
js/brand-core.js        brand token engine (parse, tokens, serialise) shared by build + browser
js/theme-builder.js     Theme builder tool (brands/theme-builder.html, preview frame in src/static/brands/frame.html)
src/pages/**            page content fragments (front matter + HTML)
*.html, components/, foundations/, get-started/   generated pages      ← do not edit
assets/icons/           196 SVG icons (fallback) + icons.json
assets/iconfonts/<id>/  brand icon fonts (.woff/.ttf); sources in tokens/brands/icons/<id>/ (IcoMoon style.css + selection.json)
downloads/icons/        brand icon font zips (IcoMoon exports)
css/brand-icons.css     generated: @font-face per brand + .aec-icon glyph swap (scripts/brand-icons.mjs)
js/doc-kit.js           docs helpers: state matrix, live spec marks, live measurements, live contrast, do/don't
assets/illustrations/   20 illustrations + illustrations.json
assets/patterns/        generic pattern art (car-angle upload placeholders)
specs/                  per-component specs extracted from Figma (not deployed); specs/patterns/ for patterns
scripts/                build-tokens, build-pages, check
```

## Commands

```bash
npm run build     # tokens.json → tokens.css, brand files → css/brands + downloads, src/pages → *.html
npm run dev       # build + serve on http://localhost:4321
node scripts/check.mjs   # broken links, missing assets, duplicate ids, bad aria refs
```

## Deploy (Vercel)

Option A — CLI:

```bash
npx vercel@latest login
npx vercel@latest --prod
```

Option B — Git: push this folder to a GitHub repo, then **Vercel → Add New → Project → Import**.
Framework preset: *Other*. Build command: empty. Output directory: `.` (already set in `vercel.json`).
`src/`, `specs/` and `scripts/` are excluded from the upload by `.vercelignore`.

## Brands

- Add a brand: drop `<id>.css` into `tokens/brands/source/`, add it to `tokens/brands/brands.json` (plus a public
  font substitute for any new family), run `npm run build`. The header menu, Brand tokens page and Theme builder pick it up.
- Each brand is merged over the default brand, so a partial file still renders.
- Brand fonts are licensed and not served; `brands.json` maps each to a Google Fonts substitute used in the font stacks.
- Map a new component to brand tokens in `scripts/brand-bridge.mjs`.
- Icons: `<span class="aec-icon" data-icon="car">` (or the legacy `--aec-icon-src` SVG URL) renders the brand's icon-font glyph.
- Docs: use `.doc-state-matrix`, `.doc-spec`, `data-measure`, `data-contrast-table` and `.doc-dodont` (see js/doc-kit.js) — never hard-code brand values.

## Conventions

- Token names mirror Figma style names: `primary/default` → `--aec-color-primary-default`.
- Components use BEM-ish classes: block `.aec-btn`, modifiers `.aec-btn--outline`; states via native attributes
  (`disabled`, `aria-pressed`, `aria-selected`, `aria-expanded`, `aria-invalid`).
- Fonts: brand fonts fall back to public substitutes (Chevy Sans → DM Sans, StratumGMC → Barlow, Buick → Figtree/Lexend, Cadillac Gothic → Archivo).
- Each component page ends with **Figma notes** listing inconsistencies found in the library.

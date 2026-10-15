# Pattern spec extraction guide (for agents)

Figma file: **DR 2.0 – SC GM Chevy Components**, fileKey `g5hh34klkdaAOzyjoDRDgJ`. READ-ONLY — never modify the Figma file.
It consumes the foundation library "DR 2.0 - SC GM Chevrolet Design Foundation", whose tokens and atomic components are
already implemented in this repo. Read `specs/_spec-guide.md` for the token name list (colours, spacing, radius, shadows,
type styles) and map every value to those tokens. Atomic component classes that already exist in `css/components.css`:
`.aec-btn` (primary/secondary/neutral/inverse/destructive/standard; outline/plain/inline), `.aec-icon-btn`, `.aec-link`,
`.aec-field` (text field / select), `.aec-checkbox`, `.aec-radio`, `.aec-switch`, `.aec-control` + `.aec-form-label`,
`.aec-toggle`, `.aec-toggle-group`, `.aec-slider`, `.aec-menu`, `.aec-avatar`, `.aec-badge`, `.aec-chip` (info/plain/selectable/input),
`.aec-tooltip`, `.aec-table`, `.aec-alert`, `.aec-banner`, `.aec-progress`, `.aec-spinner`, `.aec-snackbar`, `.aec-modal`,
`.aec-accordion`, `.aec-breadcrumbs`, `.aec-pagination`, `.aec-header`, `.aec-tabs`. When a pattern is built from these
(e.g. an instance of "Button - Primary" or "Chip - Information"), SAY SO — the implementer will reuse them.

Tools (Figma MCP, load via ToolSearch if deferred): `use_figma` (always pass `skillNames: "resource:figma-use"`),
`get_screenshot`, `get_variable_defs`, `download_assets`.
use_figma rules: plain JS, top-level `await` + `return` (no IIFE, no console.log, no figma.notify). Switch page once per call:
`const p=await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(p);`. Return value must be < 20KB.
Some component sets throw on `variantGroupProperties` ("Component set has existing errors") — wrap in try/catch and fall back
to reading child variant names. Style names: `await figma.getStyleByIdAsync(id)` (guard `typeof id==='string'`).
For instances, `await inst.getMainComponentAsync()` then the parent set name tells you which atomic component it is.

## Scope
"Published" = component sets/components that are direct children of the page or inside a SECTION that is NOT named
"_Unpublished…"/"Unpublished…", and whose name does not start with `_` or `.`. Skip the unpublished/base ones
(mention them only if a published pattern is built from them). Skip loose frames/rectangles/instances.

## For each published pattern write `specs/patterns/<kebab-name>.md` containing
1. **Figma**: page, set name, node id, variant count, variant axes (+ non-variant props).
2. **Purpose** in one line (what it is used for in the Chevrolet digital-retail / secure-checkout flow).
3. **Anatomy**: layer tree of the main (desktop/default) variant 2–4 levels deep: part name, size, layout direction,
   padding, gap, radius, which atomic component each child instance is.
4. **Visual spec**: background, border, radius, shadow, text styles/colours for each region, mapped to tokens.
5. **Variants & states**: what changes between variants (selected/hover/disabled/loading/error/mobile …). Be concise.
6. **Content**: the real copy shown in the default variant (headings, labels, sample values) — the implementer will reuse it.
7. **Responsive**: how mobile/tablet differ (widths, stacking).
8. **Notes**: inconsistencies, raw hex with no token, missing states, typos.
9. Screenshot: `get_screenshot` (maxDimension 1400) of the set → curl to `specs/patterns/img/<kebab-name>.png`; reference it.

Very similar sets (e.g. several product cards sharing one anatomy) may share ONE md file — list each set inside it.
Do NOT export or copy third-party logos (banks, KBB, Black Book, JD Power) or vehicle photography; note them as image slots.
Generic illustrations/placeholder art (document-type illustrations, car-angle placeholders) MAY be exported as SVG with
`download_assets` + curl into `assets/patterns/` if they are needed to render the pattern; list what you exported.
Be concise and factual; don't invent states that aren't in Figma.

# Component spec extraction guide (for agents)

Figma fileKey: `ilpJ5K66cGR85o287K4HDD`. READ-ONLY — never modify the Figma file.

Tools (Figma MCP, load via ToolSearch if deferred): `use_figma` (always pass `skillNames: "resource:figma-use"`),
`get_screenshot`, `get_variable_defs`.

use_figma rules: plain JS, top-level `await` + `return` (no IIFE, no console.log, no figma.notify).
Switch page once per call: `const p=await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(p);`
Return value must be < 20KB — return compact strings, split into several calls if needed.
Style names: `await figma.getStyleByIdAsync(node.fillStyleId)` (guard `typeof id==='string'`). Colors are 0–1 floats.
`get_variable_defs` on a component-set node id returns the spacing/sizing variables used with resolved values.

## Token names (map every colour you find to one of these; Figma style name == token suffix)
Colour style `a/b/c` -> CSS var `--aec-color-a-b-c`. Values:
bg/default #ffffff, bg/variant #f2f2f2, bg/disabled #c3cfd9, bg/inverse #262626,
border/default #e6e6e6, border/variant #b3b3b3, border/disabled #c3cfd9,
text/default #262626, text/subtle #666666, text/variant #666666, text/disabled #b3b3b3, text/inverse #ffffff,
icon/default #262626, icon/variant #666666, icon/disabled #b3b3b3, icon/inverse #ffffff,
backdrop/default #000000@0.52, backdrop/inverse #ffffff@0.25,
primary/default #0077d9, primary/hover #005ba6, primary/subtle #ecf1fc, primary/on-default #ffffff, primary/on-subtle #0077d9,
action/bg/default #0077d9, action/bg/hover #005ba6, action/bg/disabled #c3cfd9, action/border/default #e6e6e6, action/border/hover #b3b3b3, action/border/active #0077d9,
action/inverse/bg/default #ffffff, action/inverse/bg/hover #e6e6e6, action/inverse/bg/disabled #666666,
secondary/default #262626, secondary/hover #1a1a1a, secondary/subtle #ecf1fc,
success/default #2d871b, success/subtle #e1eddc, warning/default #b3842d, warning/subtle #f6ecde, warning/on-default #1a1a1a,
error/default #d64022, error/subtle #ffe4db, info/default #2263e3, info/subtle #ebf2ff,
decoration/01 #f2bc18 … decoration/06 #27140c, inverse/bg/default #262626, inverse/bg/variant #1a1a1a, inverse/border/variant #8c8c8c,
inverse/text/variant #b3b3b3, dark-grey/base #666666, dark-grey/strong #343434, light-grey/weak #d8d8d8, light-grey/strong #8c8c8c, focus/default #0077d9.
Shadows: shadow/xs, s, m, l, xl, 2xl -> `--aec-box-shadow-*`.
Radius: 0 none, 4 rounded-rect, 8 default, 384 rounded -> `--aec-border-radius-*`. Border widths 1/1.5/2/3/4.
Spacing tokens: container padding s16 m24 l40; container gap xs4 s8 m16 l24; container stack xs8 s16 m24 l40 xl64;
selectable padding s8 m16 l24; selectable gap xs2 s4 m8 l16; selectable stack s8 m16 l24 -> `--aec-spacing-<group>-<prop>-<size>`.
Text styles (font is Chevy Sans in Figma; the site will use DM Sans): heading/1–6, body/1–3 × regular|medium|bold|link|all-caps|list,
display/1–2. Record the text style NAME used (e.g. `body/2/bold`); if no style, record size/weight.

## Per component, write `specs/<kebab-name>.md` containing
1. **Figma**: page name + page id, each component set name + node id + variant count.
2. **Description** (from component description, if any) and an inferred one-line purpose.
3. **Variant axes** (e.g. `size: large|medium|small; style: filled|outline|plain; state: default|hover|pressed; disabled`) and non-variant props (booleans/text/instance-swap).
4. **Anatomy**: the layer tree of the default variant, 2–3 levels (part name, size, layout direction, padding, gap, radius).
5. **Token table**: for each meaningful variant/state combination: background, border (colour/width), text colour + text style, icon colour/size, radius, height, padding, gap, shadow. Use token names, not hex (put hex only if no token matches, and say so).
6. **Notes**: anything surprising (e.g. sizes that don't differ, missing states, hidden base components, inconsistencies).
7. A screenshot: call `get_screenshot` (maxDimension 1200) on each component set (or the page's main frame) and download it with curl to
   `specs/img/<kebab-name>[-n].png`. Reference it from the md.

Be concise and factual; do not invent states that aren't in Figma. Skip hidden base components whose names start with `.` or `_` unless they are the only content (mention them in Notes).

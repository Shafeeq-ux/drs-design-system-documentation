/*
 * DRS brand token engine — shared by scripts/build-brands.mjs (Node) and the browser (Theme builder, Brand tokens page).
 *
 * A brand file (tokens/brands/source/<id>.css) has two layers:
 *   1. `.drp-*` classes with literal values (component metrics, typography, button/toggle colours)
 *   2. a `body { --aec-*: … }` block of CSS custom properties (semantic + component colours)
 * Both can sit inside `@media (min-width: …)` blocks.
 *
 * parse(css)            → model { header, blocks:[{ media, selector, decls:[{prop,value}] }] }
 * tokens(model)         → [{ key, name, value, media, layer:'var'|'class', group, type, ref }]
 * set(model, key, val)  → writes a token back into the model (font shorthand parts are recomposed)
 * toSource(model)       → CSS in the original drop-in format (.drp-* classes + body vars)
 * toVars(model, opts)   → CSS custom properties only, scoped (default :root)
 * toJSON(model, meta)   → { brand, tokens, components, media }
 * applyJSON(model,json) → writes JSON values onto a template model, returns keys not found
 *
 * Every .drp-* declaration becomes a custom property name:
 *   .drp-button-contained-color-primary-filled:hover .drp-icon { color } → --drp-button-contained-color-primary-filled-hover-icon-color
 *   .drp-typography-heading-1 { font: 700 26px/36px "Chevy Sans" }    → --drp-typography-heading-1-font-weight | -font-size | -line-height | -font-family
 */
(function (root) {
  'use strict';

  /* ---------------- Parsing ---------------- */
  function stripComments(css) {
    let header = '';
    const m = css.match(/^\s*\/\*[\s\S]*?\*\//);
    if (m) header = m[0].trim();
    return { header, body: css.replace(/\/\*[\s\S]*?\*\//g, '') };
  }

  function parseDecls(text) {
    const decls = [];
    let buf = '', depth = 0, quote = null;
    const flush = () => {
      const s = buf.trim(); buf = '';
      if (!s) return;
      const i = s.indexOf(':');
      if (i < 0) return;
      decls.push({ prop: s.slice(0, i).trim(), value: s.slice(i + 1).trim() });
    };
    for (const ch of text) {
      if (quote) { buf += ch; if (ch === quote) quote = null; continue; }
      if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ';' && depth === 0) { flush(); continue; }
      buf += ch;
    }
    flush();
    return decls;
  }

  function parse(css) {
    const { header, body } = stripComments(css);
    const blocks = [];
    let i = 0;
    const n = body.length;
    function readBlock(media) {
      // reads "selector { decls }" sequences until a closing brace at this level
      while (i < n) {
        // skip whitespace
        while (i < n && /\s/.test(body[i])) i++;
        if (i >= n) return;
        if (body[i] === '}') { i++; return; }
        const open = body.indexOf('{', i);
        if (open < 0) return;
        const prelude = body.slice(i, open).trim();
        i = open + 1;
        if (prelude.startsWith('@media')) {
          const q = prelude.replace(/^@media\s*/, '').trim();
          readBlock(normMedia(q));
          continue;
        }
        const close = body.indexOf('}', i);
        const inner = body.slice(i, close);
        i = close + 1;
        blocks.push({ media, selector: prelude.replace(/\s+/g, ' '), decls: parseDecls(inner) });
      }
    }
    readBlock(null);
    return { header, blocks };
  }

  function normMedia(q) {
    return q.replace(/\(\s*/g, '(').replace(/\s*\)/g, ')').replace(/\s*:\s*/g, ': ').trim();
  }

  /* ---------------- Naming ---------------- */
  function selectorSlug(sel) {
    return sel
      .replace(/^\./, '')
      .replace(/^drp-/, '')
      .replace(/:not\([^)]*\)/g, '')
      .replace(/::?before/g, '-before')
      .replace(/::?after/g, '-after')
      .replace(/:hover/g, '-hover')
      .replace(/:active/g, '-active')
      .replace(/:focus(-visible)?/g, '-focus')
      .replace(/\.drp-disabled/g, '-disabled')
      .replace(/\s+\.drp-icon/g, '-icon')
      .replace(/\s+\.drp-/g, '-')
      .replace(/\.drp-/g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/gi, '-')
      .replace(/-{3,}/g, '--')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

  const FONT_RE = /^(?:(italic|oblique|normal)\s+)?(\d{3}|bold|normal|lighter|bolder)\s+([\d.]+(?:px|rem|em))\s*\/\s*([\d.]+(?:px|rem|em|%)?)\s+(.+)$/;
  function splitFont(v) {
    const m = v.match(FONT_RE);
    if (!m) return null;
    return { style: m[1] || '', weight: m[2], size: m[3], lineHeight: m[4], family: m[5].trim() };
  }
  function joinFont(f) {
    return `${f.style ? f.style + ' ' : ''}${f.weight} ${f.size}/${f.lineHeight} ${f.family}`;
  }
  const FONT_PARTS = { weight: 'font-weight', size: 'font-size', lineHeight: 'line-height', family: 'font-family' };

  /* ---------------- Grouping ---------------- */
  const GROUPS = [
    'accordion', 'assistive-text', 'avatar', 'badge', 'banner', 'breadcrumb', 'button-contained', 'button-link', 'card',
    'checkbox', 'chip-selectable', 'chip-information', 'chip-plain', 'chip-dismissable', 'dialog', 'divider', 'drawer',
    'form-control', 'header', 'input-standard', 'input-material', 'input', 'link', 'list-item', 'list', 'notification', 'radio',
    'slider', 'snackbar', 'switch', 'tabbar', 'tab', 'toggle-button', 'toggle-group', 'tooltip', 'typography', 'weekly-calendar'
  ];
  const SEMANTIC = [
    ['color', 'Colour'], ['font', 'Font'], ['border', 'Border'], ['box-shadow', 'Elevation'], ['spacing', 'Spacing'],
    ['sizing', 'Sizing'], ['media-query', 'Layout'], ['paragraph', 'Font'], ['text', 'Font'], ['letter-spacing', 'Font'], ['opacity', 'Opacity']
  ];
  const LABELS = {
    'button-contained': 'Button', 'button-link': 'Button link', 'chip-selectable': 'Chip · selectable', 'chip-information': 'Chip · information',
    'chip-plain': 'Chip · plain', 'chip-dismissable': 'Chip · dismissable', 'input-standard': 'Input · standard', 'input-material': 'Input · material',
    'input': 'Input', 'tabbar': 'Tabs', 'tab': 'Tabs', 'toggle-button': 'Toggle button', 'toggle-group': 'Toggle group', 'list-item': 'List item',
    'assistive-text': 'Assistive text', 'form-control': 'Form control', 'weekly-calendar': 'Weekly calendar', 'typography': 'Typography'
  };
  function titleCase(s) { return s.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()); }
  function groupOf(name) {
    const s = name.replace(/^--(aec|drp)-/, '');
    for (const g of GROUPS) if (s === g || s.startsWith(g + '-')) return LABELS[g] || titleCase(g);
    for (const [p, label] of SEMANTIC) if (s === p || s.startsWith(p + '-')) return label;
    return 'Other';
  }

  /* ---------------- Value typing ---------------- */
  const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|transparent)$/i;
  function typeOf(prop, value) {
    if (COLOR_RE.test(value.trim())) return 'color';
    if (/font-family/.test(prop)) return 'font-family';
    if (/font-weight/.test(prop)) return 'font-weight';
    if (/text-transform|text-case/.test(prop)) return 'text-transform';
    if (/shadow/.test(prop)) return 'shadow';
    if (/^-?[\d.]+(px|rem|em|%)?$/.test(value.trim())) return 'dimension';
    return 'other';
  }

  /* ---------------- Tokens ---------------- */
  function tokens(model) {
    const out = [];
    const seen = new Map();
    model.blocks.forEach((b, bi) => {
      const isVarBlock = !/\.drp-/.test(b.selector);
      const slug = isVarBlock ? '' : selectorSlug(b.selector);
      b.decls.forEach((d, di) => {
        const push = (name, value, part) => {
          let key = b.media ? `${name}@${b.media}` : name;
          if (seen.has(key)) { // keep later declaration authoritative, mark the earlier one as shadowed
            const prev = out[seen.get(key)]; prev.shadowed = true;
          }
          const prop = part ? FONT_PARTS[part] : d.prop;
          const t = { key, name, value, media: b.media, layer: name.startsWith('--drp-') ? 'class' : 'var', group: groupOf(name), type: typeOf(prop, value), ref: { bi, di, part }, selector: b.selector, prop };
          seen.set(key, out.length);
          out.push(t);
        };
        if (d.prop.startsWith('--')) { push(d.prop, d.value); return; }
        if (isVarBlock) return; // plain props in a var block are not tokens
        if (d.prop === 'font') {
          const f = splitFont(d.value);
          if (f) { for (const p of ['weight', 'size', 'lineHeight', 'family']) push(`--drp-${slug}-${FONT_PARTS[p]}`, f[p], p); return; }
        }
        push(`--drp-${slug}-${d.prop}`, d.value);
      });
    });
    return out.filter(t => !t.shadowed);
  }

  function tokenMap(model) {
    const m = {};
    for (const t of tokens(model)) m[t.key] = t;
    return m;
  }

  function set(model, tokenOrKey, value, cache) {
    const t = typeof tokenOrKey === 'string' ? (cache || tokenMap(model))[tokenOrKey] : tokenOrKey;
    if (!t) return false;
    const d = model.blocks[t.ref.bi].decls[t.ref.di];
    if (t.ref.part) {
      const f = splitFont(d.value);
      f[t.ref.part] = value;
      d.value = joinFont(f);
    } else d.value = value;
    t.value = value;
    return true;
  }

  function clone(model) {
    return { header: model.header, blocks: model.blocks.map(b => ({ media: b.media, selector: b.selector, decls: b.decls.map(d => ({ ...d })) })) };
  }

  /* ---------------- Serialising ---------------- */
  function toSource(model, opts) {
    opts = opts || {};
    const lines = [];
    lines.push(opts.header || model.header || '/**\n * Do not edit directly\n */');
    lines.push('');
    let curMedia = null;
    const close = () => { if (curMedia) { lines.push('}'); lines.push(''); curMedia = null; } };
    for (const b of model.blocks) {
      if (b.media !== curMedia) { close(); if (b.media) { lines.push(`@media${b.media} {`); curMedia = b.media; } }
      const ind = b.media ? '  ' : '';
      lines.push(`${ind}${b.selector} {`);
      for (const d of b.decls) lines.push(`${ind}  ${d.prop}: ${d.value};`);
      lines.push(`${ind}}`);
      lines.push('');
    }
    close();
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  function toVars(model, opts) {
    opts = opts || {};
    const scope = opts.scope || ':root';
    const filter = opts.filter || (() => true);
    const map = opts.map || (t => t.value);
    const byMedia = new Map();
    for (const t of (opts.tokens || tokens(model))) {
      if (!filter(t)) continue;
      if (!byMedia.has(t.media)) byMedia.set(t.media, []);
      byMedia.get(t.media).push(`  ${t.name}: ${map(t)};`);
    }
    const extra = opts.extra || {};
    const out = [];
    if (opts.header) out.push(opts.header, '');
    const base = (byMedia.get(null) || []).concat(extra[''] || []);
    if (base.length) out.push(`${scope} {`, ...base, '}', '');
    const medias = [...byMedia.keys(), ...Object.keys(extra).filter(k => k)].filter((m, i, a) => m && a.indexOf(m) === i)
      .sort((a, b) => (parseInt(a.match(/\d+/)) || 0) - (parseInt(b.match(/\d+/)) || 0));
    for (const m of medias) {
      const rows = (byMedia.get(m) || []).concat(extra[m] || []);
      if (!rows.length) continue;
      out.push(`@media ${m} {`, `  ${scope} {`, ...rows.map(r => '  ' + r), '  }', '}', '');
    }
    return out.join('\n');
  }

  function toJSON(model, meta, list) {
    const json = { $schema: 'https://drs-design-system/brand-tokens/v1', brand: meta || {}, tokens: {}, components: {}, media: {} };
    for (const t of (list || tokens(model))) {
      let target;
      if (t.media) {
        json.media[t.media] = json.media[t.media] || { tokens: {}, components: {} };
        target = t.layer === 'var' ? json.media[t.media].tokens : json.media[t.media].components;
      } else target = t.layer === 'var' ? json.tokens : json.components;
      target[t.name] = t.value;
    }
    return json;
  }

  // Flatten a JSON brand file into { key: value } using the same keys as tokens()
  function flattenJSON(json) {
    const flat = {};
    const put = (obj, media) => { for (const [k, v] of Object.entries(obj || {})) flat[media ? `${k}@${normMedia(media)}` : k] = String(v); };
    put(json.tokens); put(json.components);
    for (const [m, o] of Object.entries(json.media || {})) { put(o.tokens, m); put(o.components, m); }
    return flat;
  }

  function applyJSON(model, json) {
    const flat = flattenJSON(json);
    const map = tokenMap(model);
    const missing = [];
    for (const [k, v] of Object.entries(flat)) { if (!set(model, map[k] || k, v, map)) missing.push(k); }
    return missing;
  }

  /* ---------------- Colour helpers ---------------- */
  function parseColor(v) {
    if (!v) return null;
    v = String(v).trim().toLowerCase();
    if (v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    let m = v.match(/^#([0-9a-f]{3,8})$/);
    if (m) {
      let h = m[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
      const n = parseInt(h.slice(0, 6), 16);
      return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255, a: h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1 };
    }
    m = v.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    return null;
  }
  const hex2 = n => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  function toHex(c) { return c ? `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${c.a < 1 ? hex2(c.a * 255) : ''}` : ''; }
  function mix(a, b, t) { const A = parseColor(a), B = parseColor(b); return toHex({ r: A.r + (B.r - A.r) * t, g: A.g + (B.g - A.g) * t, b: A.b + (B.b - A.b) * t, a: 1 }); }
  function luminance(c) {
    c = typeof c === 'string' ? parseColor(c) : c;
    const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function contrast(fg, bg) {
    let F = parseColor(fg), B = parseColor(bg);
    if (!F || !B) return null;
    if (B.a < 1) B = { ...B, r: 255 * (1 - B.a) + B.r * B.a, g: 255 * (1 - B.a) + B.g * B.a, b: 255 * (1 - B.a) + B.b * B.a, a: 1 };
    if (F.a < 1) F = { r: B.r * (1 - F.a) + F.r * F.a, g: B.g * (1 - F.a) + F.g * F.a, b: B.b * (1 - F.a) + F.b * F.a, a: 1 };
    const l1 = luminance(F), l2 = luminance(B);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function normColor(v) { const c = parseColor(v); return c ? (c.a === 0 ? 'transparent' : toHex(c)) : String(v).trim().toLowerCase(); }

  /* ---------------- Fonts ---------------- */
  // First family of a font-family value: '"DM Sans", sans-serif' → 'DM Sans'
  function firstFamily(v) { return String(v || '').split(',')[0].trim().replace(/^["']|["']$/g, ''); }
  // Wrap a brand family name ("Chevy Sans" or Chevy Sans) in a stack with its public substitute.
  function fontStack(family, fonts) {
    const name = firstFamily(family);
    const sub = fonts && fonts[name] && fonts[name].substitute;
    const parts = [`"${name}"`];
    if (sub && sub !== name) parts.push(`"${sub}"`);
    parts.push('system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif');
    return parts.join(', ');
  }

  /* ---------------- Runtime (site) CSS ---------------- */
  // Turns a token list into the CSS the docs site consumes: font families become stacks with the public substitute,
  // "none" colours become transparent, and the .drp-typography-* classes are mapped onto --aec-typography-<style>-*.
  const TYPE_STYLES = ['display-1', 'display-2', 'heading-1', 'heading-2', 'heading-3', 'heading-4', 'heading-5', 'heading-6', 'body-1', 'body-2', 'body-3'];
  const TYPE_PARTS = ['font-size', 'line-height', 'font-weight', 'letter-spacing', 'font-family', 'text-transform'];
  function runtimeValue(t, fonts) {
    const v = t.value;
    if (/font-family/.test(t.name)) return fontStack(v, fonts);
    if (v === 'none' && /color/.test(t.name) && !/shadow/.test(t.name)) return 'transparent';
    if (/shadow/.test(t.name) && /^0(px)?$/.test(v)) return 'none';
    return v;
  }
  function typographyVars(map, fonts) {
    const extra = {};
    const add = (media, name, p, value) => { (extra[media] = extra[media] || []).push(`  --aec-typography-${name}-${p}: ${p === 'font-family' ? fontStack(value, fonts) : value};`); };
    for (const s of TYPE_STYLES) {
      const isBody = s.startsWith('body');
      const baseCls = isBody ? `${s}-regular` : (map[`--drp-typography-mobile-${s}-font-size`] ? `mobile-${s}` : s);
      for (const p of TYPE_PARTS) { const t = map[`--drp-typography-${baseCls}-${p}`]; if (t) add('', s, p, t.value); }
      if (isBody) continue;
      for (const media of Object.keys(map).map(k => k.split('@')[1]).filter((m, i, a) => m && a.indexOf(m) === i)) {
        for (const p of TYPE_PARTS) { const t = map[`--drp-typography-${s}-${p}@${media}`]; if (t) add(media, s, p, t.value); }
      }
    }
    const fam = map['--aec-font-family-body'];
    if (fam) (extra[''] = extra[''] || []).push(`  --aec-font-family-base: ${fontStack(fam.value, fonts)};`);
    return extra;
  }
  function runtimeCSS(list, opts) {
    opts = opts || {};
    const map = {};
    for (const t of list) map[t.key] = t;
    return toVars(null, { tokens: list, scope: opts.scope || ':root', filter: opts.filter, header: opts.header, map: t => runtimeValue(t, opts.fonts), extra: typographyVars(map, opts.fonts) });
  }

  const api = { firstFamily, runtimeCSS, runtimeValue, parse, tokens, tokenMap, set, clone, toSource, toVars, toJSON, flattenJSON, applyJSON, selectorSlug, splitFont, joinFont, groupOf, typeOf, parseColor, toHex, mix, contrast, luminance, normColor, fontStack, normMedia };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.DRSBrand = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

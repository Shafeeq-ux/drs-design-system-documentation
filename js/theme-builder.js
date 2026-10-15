/* DRS Theme builder — edit a brand's tokens, preview live in iframes, check contrast, export CSS / JSON.
 * Model handling comes from js/brand-core.js (window.DRSBrand). Specimens from js/brand-specimens.js. */
(function () {
  'use strict';
  var B = window.DRSBrand, D = window.DRS, R = window.DRS_BRANDS, SP = window.DRS_SPECIMENS;
  var root = document.querySelector('[data-theme-builder]');
  if (!root || !B || !D || !R) return;
  var esc = D.esc, ROOT = D.ROOT;
  var $ = function (id) { return document.getElementById(id); };

  /* ------------------------------------------------------------------ Fonts */
  var GOOGLE = [
    ['DM Sans', 'DM+Sans:opsz,wght@9..40,100..1000'], ['Inter', 'Inter:wght@100..900'], ['Roboto', 'Roboto:wght@100..900'],
    ['Open Sans', 'Open+Sans:wght@300..800'], ['Lato', 'Lato:wght@300;400;700;900'], ['Montserrat', 'Montserrat:wght@100..900'],
    ['Poppins', 'Poppins:wght@300;400;500;600;700;800;900'], ['Nunito Sans', 'Nunito+Sans:opsz,wght@6..12,200..1000'],
    ['Source Sans 3', 'Source+Sans+3:wght@200..900'], ['Work Sans', 'Work+Sans:wght@100..900'], ['Barlow', 'Barlow:wght@300;400;500;600;700;800;900'],
    ['Barlow Condensed', 'Barlow+Condensed:wght@300;400;500;600;700;800;900'], ['Figtree', 'Figtree:wght@300..900'], ['Lexend', 'Lexend:wght@100..900'],
    ['Archivo', 'Archivo:wght@100..900'], ['Archivo Narrow', 'Archivo+Narrow:wght@400..700'], ['Manrope', 'Manrope:wght@200..800'],
    ['Plus Jakarta Sans', 'Plus+Jakarta+Sans:wght@200..800'], ['Rubik', 'Rubik:wght@300..900'], ['IBM Plex Sans', 'IBM+Plex+Sans:wght@300;400;500;600;700'],
    ['Outfit', 'Outfit:wght@100..900'], ['Sora', 'Sora:wght@100..800'], ['Space Grotesk', 'Space+Grotesk:wght@300..700'], ['Oswald', 'Oswald:wght@200..700'],
    ['Raleway', 'Raleway:wght@100..900'], ['Mulish', 'Mulish:wght@200..1000'], ['Libre Franklin', 'Libre+Franklin:wght@100..900'], ['Playfair Display', 'Playfair+Display:wght@400..900']
  ];
  var FONTS = Object.assign({}, R.fonts);
  GOOGLE.forEach(function (g) { if (!FONTS[g[0]]) FONTS[g[0]] = { substitute: g[0], google: g[1] }; });
  function famName(v) { return B.firstFamily(v); }

  /* ------------------------------------------------------------------ State */
  var S = { from: R.default, original: null, work: null, list: [], map: {}, origMap: {}, name: '', id: '', undo: [], redo: [], scope: 'changes', fmt: 'vars', spec: '', width: '' };
  var sources = {};

  function loadSource(id) {
    if (sources[id]) return Promise.resolve(sources[id]);
    return fetch(ROOT + 'downloads/brands/' + id + '.css').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }).then(function (t) { sources[id] = t; return t; });
  }
  function reindex() {
    S.list = B.tokens(S.work);
    S.map = {}; S.list.forEach(function (t) { S.map[t.key] = t; });
  }
  function changes() {
    var c = {};
    S.list.forEach(function (t) { var o = S.origMap[t.key]; if (!o || o.value !== t.value) c[t.key] = t.value; });
    return c;
  }
  function val(key) { var t = S.map[key]; return t ? t.value : ''; }

  function start(fromId, model, applied) {
    S.from = fromId;
    S.original = model;
    S.origMap = {}; B.tokens(model).forEach(function (t) { S.origMap[t.key] = t; });
    S.work = B.clone(model);
    reindex();
    if (applied) applyChanges(applied, true);
    S.undo = []; S.redo = [];
    buildQuick(); buildGroupFilter();
    refresh(true);
  }

  /* Apply { key: value } to the work model */
  function applyChanges(obj, silent) {
    if (!silent) { S.undo.push(changes()); if (S.undo.length > 80) S.undo.shift(); S.redo = []; }
    Object.keys(obj).forEach(function (k) { if (S.map[k]) B.set(S.work, S.map[k], obj[k]); });
    reindex();
    if (!silent) refresh();
  }
  function restore(snapshot) {
    S.work = B.clone(S.original); reindex();
    Object.keys(snapshot).forEach(function (k) { if (S.map[k]) B.set(S.work, S.map[k], snapshot[k]); });
    reindex(); buildQuick(); refresh(true);
  }

  /* Bulk helpers */
  function replaceColor(oldV, newV) {
    var o = B.normColor(oldV), out = {};
    if (!o || o === 'transparent') return out;
    S.list.forEach(function (t) { if (t.type === 'color' && B.normColor(t.value) === o) out[t.key] = newV; });
    return out;
  }
  function matching(re) { return S.list.filter(function (t) { return re.test(t.name); }); }
  function setAll(re, value) { var o = {}; matching(re).forEach(function (t) { o[t.key] = value; }); return o; }
  function usage(v) { var n = B.normColor(v), c = 0; S.list.forEach(function (t) { if (t.type === 'color' && B.normColor(t.value) === n) c++; }); return c; }

  /* ------------------------------------------------------------------ Quick controls */
  var COLORS = [
    { k: 'primary', label: 'Primary', token: '--aec-color-primary-default', hover: '--aec-color-primary-hover', subtle: '--aec-color-primary-subtle', help: 'Main buttons, links, selected states' },
    { k: 'secondary', label: 'Secondary', token: '--aec-color-secondary-default', hover: '--aec-color-secondary-hover', help: 'Secondary buttons, switches' },
    { k: 'action', label: 'Action', token: '--aec-color-action-bg-default', hover: '--aec-color-action-bg-hover', help: 'Dark call-to-action surfaces' },
    { k: 'text', label: 'Text', token: '--aec-color-text-default', help: 'Body text and icons' },
    { k: 'subtle', label: 'Subtle text', token: '--aec-color-text-subtle', help: 'Descriptions, helper text' },
    { k: 'surface', label: 'Surface', token: '--aec-color-bg-variant', help: 'Hover fills, panels' },
    { k: 'border', label: 'Border', token: '--aec-color-border-default', help: 'Dividers, input outlines' },
    { k: 'error', label: 'Error', token: '--aec-color-error-default' },
    { k: 'success', label: 'Success', token: '--aec-color-success-default' },
    { k: 'warning', label: 'Warning', token: '--aec-color-warning-default' },
    { k: 'info', label: 'Info', token: '--aec-color-info-default' }
  ];
  var RE = {
    rBtn: /^--drp-(button-contained-container|button-contained-icon-container-rect|toggle-button-container|button-link-container)-.*border-radius$/,
    rInput: /^--drp-input-.*-container-bg-(large|small)-border-radius$/,
    rChip: /^--drp-chip-[a-z]+-container-(xs|small|medium)-border-radius$/,
    rSurface: /^--drp-(card-container|dialog-container|banner-container|tab-contained|tab-stacked|tooltip-container|snackbar-container)[a-z-]*-border-radius$|^--aec-border-radius-default$/,
    bwBtn: /^--drp-button-contained-(container|icon-container-rect)-bg-[a-z]+-border-width$/,
    hBtn: /^--drp-button-contained-container-bg-large-height$/,
    hInput: /^--drp-input-[a-z-]+-container-bg-(large|small)-height$/,
    famHeading: /^--drp-typography-(mobile-)?heading-\d(-regular)?-font-family$|^--aec-font-family-heading$/,
    famDisplay: /^--drp-typography-(mobile-)?display-\d(-regular)?-font-family$|^--aec-font-family-display$/,
    famButton: /^--drp-(button-contained-typography|button-link-typography|typography-button)-[a-z]+-font-family$|^--aec-font-family-button$/,
    caseBtn: /^--drp-(button-contained-typography|button-link-typography|typography-button|toggle-button-typography)-[a-z]+-text-transform$/,
    caseHeading: /^--drp-typography-(mobile-)?heading-\d-text-transform$/,
    wHeading: /^--drp-typography-(mobile-)?heading-\d-font-weight$|^--aec-font-weight-heading-\d$/
  };
  function isBodyFam(t) { return /font-family$/.test(t.name) && !RE.famHeading.test(t.name) && !RE.famDisplay.test(t.name) && !RE.famButton.test(t.name); }
  function first(re) { var m = matching(re); return m.length ? m[0].value : ''; }
  function px(v) { return parseFloat(v) || 0; }

  function colorField(c) {
    var v = B.normColor(val(c.token)); var hex = /^#[0-9a-f]{6}$/.test(v) ? v : '#000000';
    return '<div class="tb-color" data-role="' + c.k + '">' +
      '<input type="color" value="' + hex + '" aria-label="' + esc(c.label) + ' colour" data-color-role="' + c.k + '">' +
      '<div class="tb-color-text"><label for="tb-c-' + c.k + '">' + esc(c.label) + '</label><input id="tb-c-' + c.k + '" class="tb-hex" value="' + esc(val(c.token)) + '" data-hex-role="' + c.k + '" spellcheck="false" autocomplete="off"><span class="doc-small doc-muted">' + (c.help ? esc(c.help) + ' · ' : '') + usage(val(c.token)) + ' tokens</span></div></div>';
  }
  function fontOptions(cur) {
    var fams = {};
    R.brands.forEach(function (b) { (b.families || []).forEach(function (f) { fams[f] = 1; }); });
    var curName = famName(cur);
    var opts = '<optgroup label="Brand fonts">' + Object.keys(fams).map(function (f) { return '<option value="' + esc(f) + '"' + (f === curName ? ' selected' : '') + '>' + esc(f) + ((FONTS[f] || {}).substitute && FONTS[f].substitute !== f ? ' (shown as ' + esc(FONTS[f].substitute) + ')' : '') + '</option>'; }).join('') + '</optgroup>';
    opts += '<optgroup label="Google Fonts">' + GOOGLE.filter(function (g) { return !fams[g[0]]; }).map(function (g) { return '<option value="' + esc(g[0]) + '"' + (g[0] === curName ? ' selected' : '') + '>' + esc(g[0]) + '</option>'; }).join('') + '</optgroup>';
    if (curName && !fams[curName] && !GOOGLE.some(function (g) { return g[0] === curName; })) opts += '<option value="' + esc(curName) + '" selected>' + esc(curName) + '</option>';
    return opts + '<option value="__custom">Custom font name…</option>';
  }
  function select(id, label, options, help) {
    return '<label class="bt-control"><span>' + label + '</span><select id="' + id + '">' + options + '</select>' + (help ? '<small class="doc-small doc-muted">' + help + '</small>' : '') + '</label>';
  }
  function opt(list, cur) { return list.map(function (o) { var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(cur) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join(''); }
  function range(id, label, value) {
    var pill = value >= 100;
    return '<div class="tb-range"><label for="' + id + '">' + label + '</label><input type="range" id="' + id + '" min="0" max="24" step="1" value="' + (pill ? 24 : value) + '"' + (pill ? ' disabled' : '') + '><output for="' + id + '">' + (pill ? 'pill' : value + 'px') + '</output>' +
      '<label class="bt-check"><input type="checkbox" data-pill="' + id + '"' + (pill ? ' checked' : '') + '> Pill</label></div>';
  }

  function buildQuick() {
    var heading = first(RE.famHeading), body = (S.list.filter(isBodyFam)[0] || {}).value, display = first(RE.famDisplay), button = first(RE.famButton);
    var bodySize = px(val('--drp-typography-body-1-regular-font-size'));
    var html = '<fieldset class="tb-group"><legend>Colour</legend><label class="bt-check tb-derive"><input type="checkbox" id="tb-derive" checked> Generate hover and subtle shades for primary, secondary and action colours</label>' + COLORS.map(colorField).join('') + '</fieldset>';
    html += '<fieldset class="tb-group"><legend>Shape</legend>' +
      range('tb-r-btn', 'Buttons', px(first(RE.rBtn))) + range('tb-r-input', 'Inputs', px(first(RE.rInput))) + range('tb-r-chip', 'Chips', px(first(RE.rChip))) + range('tb-r-surface', 'Cards &amp; surfaces', px(first(RE.rSurface))) +
      select('tb-bw', 'Button border width', opt([['1px', '1px'], ['1.5px', '1.5px'], ['2px', '2px']], first(RE.bwBtn))) +
      '</fieldset>';
    html += '<fieldset class="tb-group"><legend>Typography</legend>' +
      select('tb-f-body', 'Body font', fontOptions(body)) + select('tb-f-heading', 'Heading font', fontOptions(heading)) +
      select('tb-f-display', 'Display font', fontOptions(display)) + select('tb-f-button', 'Button font', fontOptions(button)) +
      select('tb-case-btn', 'Button text case', opt([['none', 'As typed'], ['uppercase', 'UPPERCASE'], ['capitalize', 'Capitalize']], first(RE.caseBtn))) +
      select('tb-case-h', 'Heading case', opt([['none', 'As typed'], ['uppercase', 'UPPERCASE']], first(RE.caseHeading))) +
      select('tb-w-h', 'Heading weight', opt(['300', '400', '500', '600', '700', '800', '900'], first(RE.wHeading))) +
      select('tb-body-size', 'Body text size', opt([['16', '16 / 14 / 12 px'], ['18', '18 / 16 / 14 px']], bodySize >= 17 ? '18' : '16')) +
      '</fieldset>';
    html += '<fieldset class="tb-group"><legend>Size</legend>' +
      select('tb-h-btn', 'Large button height', opt(['40', '44', '48', '52', '56'].map(function (x) { return [x + 'px', x + 'px']; }), first(RE.hBtn))) +
      select('tb-h-input', 'Input height', opt(['40', '44', '48', '56'].map(function (x) { return [x + 'px', x + 'px']; }), first(RE.hInput))) +
      '</fieldset>';
    $('tb-p-quick').innerHTML = html;
  }
  function refreshQuickValues() {
    COLORS.forEach(function (c) {
      var el = root.querySelector('[data-role="' + c.k + '"]'); if (!el) return;
      var v = val(c.token), n = B.normColor(v);
      var ci = el.querySelector('input[type=color]'), ti = el.querySelector('.tb-hex');
      if (/^#[0-9a-f]{6}$/.test(n)) ci.value = n;
      if (document.activeElement !== ti) ti.value = v;
      el.querySelector('.doc-muted').textContent = (c.help ? c.help + ' · ' : '') + usage(v) + ' tokens';
    });
  }

  $('tb-p-quick').addEventListener('input', function (e) {
    var t = e.target;
    if (t.matches('[data-color-role]')) colorRole(t.getAttribute('data-color-role'), t.value);
    if (t.type === 'range') {
      t.nextElementSibling.textContent = t.value + 'px';
      var re = { 'tb-r-btn': RE.rBtn, 'tb-r-input': RE.rInput, 'tb-r-chip': RE.rChip, 'tb-r-surface': RE.rSurface }[t.id];
      throttle(t.id, function () { applyChanges(setAll(re, t.value + 'px')); });
    }
  });
  $('tb-p-quick').addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('[data-hex-role]')) { var v = t.value.trim(); if (B.parseColor(v)) colorRole(t.getAttribute('data-hex-role'), v); else { D.toast('Not a colour: ' + v); t.value = val(COLORS.filter(function (c) { return c.k === t.getAttribute('data-hex-role'); })[0].token); } return; }
    if (t.matches('[data-pill]')) {
      var r = $(t.getAttribute('data-pill')); r.disabled = t.checked;
      var re = { 'tb-r-btn': RE.rBtn, 'tb-r-input': RE.rInput, 'tb-r-chip': RE.rChip, 'tb-r-surface': RE.rSurface }[r.id];
      r.nextElementSibling.textContent = t.checked ? 'pill' : r.value + 'px';
      applyChanges(setAll(re, t.checked ? '384px' : r.value + 'px')); return;
    }
    var fam = { 'tb-f-heading': RE.famHeading, 'tb-f-display': RE.famDisplay, 'tb-f-button': RE.famButton }[t.id];
    if (t.id === 'tb-f-body' || fam) {
      var name = t.value;
      if (name === '__custom') { name = (prompt('Font family name (as installed or loaded by your app)') || '').trim(); if (!name) { buildQuick(); return; } if (!FONTS[name]) FONTS[name] = { substitute: 'DM Sans' }; buildQuick(); }
      var o = {};
      (t.id === 'tb-f-body' ? S.list.filter(isBodyFam) : matching(fam)).forEach(function (tok) { o[tok.key] = /^["']/.test(tok.value) ? '"' + name + '"' : name; });
      applyChanges(o); return;
    }
    if (t.id === 'tb-bw') return applyChanges(setAll(RE.bwBtn, t.value));
    if (t.id === 'tb-case-btn') return applyChanges(setAll(RE.caseBtn, t.value));
    if (t.id === 'tb-case-h') return applyChanges(setAll(RE.caseHeading, t.value));
    if (t.id === 'tb-w-h') return applyChanges(setAll(RE.wHeading, t.value));
    if (t.id === 'tb-h-btn') return applyChanges(setAll(RE.hBtn, t.value));
    if (t.id === 'tb-h-input') return applyChanges(setAll(RE.hInput, t.value));
    if (t.id === 'tb-body-size') {
      var big = t.value === '18', o2 = {};
      var size = big ? { 1: ['18px', '25px'], 2: ['16px', '22px'], 3: ['14px', '20px'] } : { 1: ['16px', '24px'], 2: ['14px', '22px'], 3: ['12px', '20px'] };
      S.list.forEach(function (tok) { var m = tok.name.match(/^--drp-typography-body-(\d)-[a-z-]+-(font-size|line-height)$/); if (m && size[m[1]]) o2[tok.key] = size[m[1]][m[2] === 'font-size' ? 0 : 1]; });
      return applyChanges(o2);
    }
  });

  function colorRole(k, v) {
    var c = COLORS.filter(function (x) { return x.k === k; })[0];
    var oldD = val(c.token), o = replaceColor(oldD, v);
    o[c.token] = v;
    var derive = $('tb-derive') && $('tb-derive').checked;
    var skip = function (x) { var n = B.normColor(x); return !n || n === '#ffffff' || n === '#000000' || n === 'transparent' || n === B.normColor(oldD); };
    if (derive && c.hover && !skip(val(c.hover))) { var h = B.mix(v, '#000000', 0.22); Object.assign(o, replaceColor(val(c.hover), h)); o[c.hover] = h; }
    if (derive && c.subtle && !skip(val(c.subtle))) { var s = B.mix(v, '#ffffff', 0.9); Object.assign(o, replaceColor(val(c.subtle), s)); o[c.subtle] = s; }
    throttle('c-' + k, function () { applyChanges(o); });
  }
  var throttles = {};
  function throttle(id, fn) { clearTimeout(throttles[id]); throttles[id] = setTimeout(fn, 40); }

  /* ------------------------------------------------------------------ Palette */
  function drawPalette() {
    var counts = {}, names = {};
    S.list.forEach(function (t) { if (t.type !== 'color') return; var n = B.normColor(t.value); if (n === 'transparent') return; counts[n] = (counts[n] || 0) + 1; (names[n] = names[n] || []).push(t.name); });
    var keys = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    $('tb-palette').innerHTML = keys.map(function (k, i) {
      var hex = /^#[0-9a-f]{6}$/.test(k) ? k : '#000000';
      var uniq = names[k].filter(function (x, j, a) { return a.indexOf(x) === j; });
      return '<details class="tb-pal"><summary><span class="bt-dot bt-dot--lg" style="background:' + esc(k) + '"></span><code>' + esc(k) + '</code><span class="doc-small doc-muted">' + counts[k] + '</span></summary>' +
        '<div class="tb-pal-edit"><input type="color" value="' + hex + '" data-pal="' + esc(k) + '" aria-label="Replace ' + esc(k) + '"><input class="tb-hex" value="' + esc(k) + '" data-pal-text="' + esc(k) + '" aria-label="Replace ' + esc(k) + ' with" spellcheck="false">' +
        '<p class="doc-small doc-muted">Used by ' + uniq.slice(0, 6).map(function (n) { return '<code>' + esc(n) + '</code>'; }).join(', ') + (uniq.length > 6 ? ' and ' + (uniq.length - 6) + ' more' : '') + '</p></div></details>';
    }).join('');
  }
  $('tb-palette').addEventListener('change', function (e) {
    var t = e.target, old = t.getAttribute('data-pal') || t.getAttribute('data-pal-text');
    if (!old) return;
    var v = t.value.trim();
    if (!B.parseColor(v)) { D.toast('Not a colour: ' + v); return; }
    applyChanges(replaceColor(old, v));
  });

  /* ------------------------------------------------------------------ All tokens */
  var tokLimit = 150;
  function buildGroupFilter() {
    var g = {}; S.list.forEach(function (t) { g[t.group] = 1; });
    $('tb-tok-g').innerHTML = '<option value="">All groups</option>' + Object.keys(g).sort().map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
  }
  function drawTokens() {
    if ($('tb-p-tokens').hidden) return;
    var q = $('tb-tok-q').value.trim().toLowerCase(), g = $('tb-tok-g').value, only = $('tb-tok-changed').checked;
    var ch = changes();
    var list = S.list.filter(function (t) {
      if (g && t.group !== g) return false;
      if (only && !(t.key in ch)) return false;
      if (q && (t.key + ' ' + t.value).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    $('tb-tok-count').textContent = list.length.toLocaleString() + ' tokens' + (list.length > tokLimit ? ' · showing ' + tokLimit : '');
    $('tb-tok-list').innerHTML = list.slice(0, tokLimit).map(function (t) {
      var isC = t.type === 'color', n = B.normColor(t.value), changed = t.key in ch;
      return '<div class="tb-tok' + (changed ? ' is-changed' : '') + '" data-key="' + esc(t.key) + '">' +
        '<div class="tb-tok-name"><code>' + esc(t.name) + '</code>' + (t.media ? '<span class="bt-media">' + esc(t.media) + '</span>' : '') + '</div>' +
        '<div class="tb-tok-val">' + (isC ? '<input type="color" value="' + (/^#[0-9a-f]{6}$/.test(n) ? n : '#000000') + '" aria-label="Colour for ' + esc(t.name) + '">' : '') +
        '<input class="tb-hex" value="' + esc(t.value) + '" aria-label="Value for ' + esc(t.name) + '" spellcheck="false">' +
        (changed ? '<button type="button" class="doc-btn" data-reset-tok title="Was ' + esc((S.origMap[t.key] || {}).value || '') + '">Reset</button>' : '') + '</div></div>';
    }).join('') || '<p class="doc-muted doc-small">No tokens match.</p>';
    $('tb-tok-more').hidden = list.length <= tokLimit;
  }
  $('tb-tok-list').addEventListener('change', function (e) {
    var row = e.target.closest('[data-key]'); if (!row) return;
    var k = row.getAttribute('data-key'), o = {}; o[k] = e.target.value.trim();
    applyChanges(o);
  });
  $('tb-tok-list').addEventListener('click', function (e) {
    if (!e.target.matches('[data-reset-tok]')) return;
    var k = e.target.closest('[data-key]').getAttribute('data-key'), o = {}; o[k] = S.origMap[k].value; applyChanges(o);
  });
  ['tb-tok-q', 'tb-tok-g', 'tb-tok-changed'].forEach(function (id) { $(id).addEventListener(id === 'tb-tok-q' ? 'input' : 'change', function () { tokLimit = 150; throttle('tok', drawTokens); }); });
  $('tb-tok-more').addEventListener('click', function () { tokLimit += 300; drawTokens(); });

  // Panel tabs
  var ptabs = [].slice.call(root.querySelectorAll('.tb-tabs [role="tab"]'));
  function selectTab(tab) {
    ptabs.forEach(function (t) { var on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; $(t.getAttribute('aria-controls')).hidden = !on; });
    if (tab.id === 'tb-t-palette') drawPalette();
    if (tab.id === 'tb-t-tokens') drawTokens();
  }
  ptabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { var n = ptabs[(i + d + ptabs.length) % ptabs.length]; n.focus(); selectTab(n); } });
  });

  /* ------------------------------------------------------------------ Preview frames */
  var frames = { work: $('tb-frame-work'), orig: $('tb-frame-orig') };
  var ready = { work: false, orig: false };
  function frameDoc(k) { try { return frames[k].contentDocument; } catch (e) { return null; } }
  function fontLinks(doc, list) {
    var fams = {};
    list.forEach(function (t) { if (/font-family/.test(t.name)) fams[famName(t.value)] = 1; });
    Object.keys(fams).forEach(function (f) {
      var spec = (FONTS[f] || {}).google; if (!spec) return;
      var href = 'https://fonts.googleapis.com/css2?family=' + spec + '&display=swap';
      if (!doc.querySelector('link[href="' + href + '"]')) { var l = doc.createElement('link'); l.rel = 'stylesheet'; l.href = href; doc.head.appendChild(l); }
    });
  }
  function paintFrame(k, model, list) {
    var doc = frameDoc(k); if (!doc || !ready[k]) return;
    doc.getElementById('tb-theme').textContent = B.runtimeCSS(list || B.tokens(model), { scope: '[data-brand="tb"]', fonts: FONTS });
    fontLinks(doc, list || B.tokens(model));
    var main = doc.getElementById('specimen');
    if (!main.hasAttribute('data-filled')) {
      main.innerHTML = SP.all(); main.setAttribute('data-filled', '');
      if (frames[k].contentWindow.AEC) frames[k].contentWindow.AEC.init(main);
    }
    [].forEach.call(main.querySelectorAll('[data-specimen]'), function (s) { s.hidden = !!S.spec && s.getAttribute('data-specimen') !== S.spec; });
    fit(k);
  }
  function fit(k) {
    var doc = frameDoc(k); if (!doc || !doc.body) return;
    requestAnimationFrame(function () { frames[k].style.height = Math.max(320, doc.documentElement.scrollHeight) + 'px'; });
  }
  ['work', 'orig'].forEach(function (k) {
    var onload = function () { ready[k] = true; if (S.work) { if (k === 'work') paintFrame('work', S.work, S.list); else if (!$('tb-frame-orig-wrap').hidden) paintFrame('orig', S.original); } };
    frames[k].addEventListener('load', onload);
    if (frames[k].contentDocument && frames[k].contentDocument.readyState === 'complete' && frames[k].contentDocument.getElementById('tb-theme')) onload();
  });
  window.addEventListener('resize', function () { throttle('fit', function () { fit('work'); fit('orig'); }); });

  // Stage controls
  $('tb-spec').innerHTML = '<option value="">All components</option>' + Object.keys(SP.list).map(function (k) { return '<option value="' + k + '">' + esc(SP.list[k].label) + '</option>'; }).join('');
  $('tb-spec').addEventListener('change', function () { S.spec = this.value; paintFrame('work', S.work, S.list); if (!$('tb-frame-orig-wrap').hidden) paintFrame('orig', S.original); });
  segmented($('tb-vp'), function (b) { S.width = b.getAttribute('data-w'); $('tb-frames').style.setProperty('--tb-w', S.width ? S.width + 'px' : '100%'); $('tb-frames').classList.toggle('is-fixed', !!S.width); setTimeout(function () { fit('work'); fit('orig'); }, 50); });
  $('tb-compare').addEventListener('change', function () {
    $('tb-frame-orig-wrap').hidden = !this.checked;
    $('tb-frames').classList.toggle('is-compare', this.checked);
    if (this.checked) paintFrame('orig', S.original);
    setTimeout(function () { fit('work'); fit('orig'); }, 50);
  });
  function segmented(group, onPick) {
    var btns = [].slice.call(group.querySelectorAll('[role="radio"]'));
    btns.forEach(function (b, i) {
      b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
      b.addEventListener('click', function () { btns.forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); x.tabIndex = x === b ? 0 : -1; }); onPick(b); });
      b.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0; if (d) { e.preventDefault(); var n = btns[(i + d + btns.length) % btns.length]; n.focus(); n.click(); } });
    });
  }

  /* ------------------------------------------------------------------ Contrast */
  var PAIRS = [
    ['Body text on page', '--aec-color-text-default', '--aec-color-bg-default', 4.5],
    ['Subtle text on page', '--aec-color-text-subtle', '--aec-color-bg-default', 4.5],
    ['Primary button', '--drp-button-contained-color-primary-filled-color', '--drp-button-contained-color-primary-filled-background-color', 4.5],
    ['Primary button, hover', '--drp-button-contained-color-primary-filled-hover-color', '--drp-button-contained-color-primary-filled-hover-background-color', 4.5],
    ['Secondary button', '--drp-button-contained-color-secondary-filled-color', '--drp-button-contained-color-secondary-filled-background-color', 4.5],
    ['Outlined button text', '--drp-button-contained-color-primary-outlined-color', '--aec-color-bg-default', 4.5],
    ['Link', '--aec-link-color-primary-text-default', '--aec-color-bg-default', 4.5],
    ['Selected chip', '--aec-chip-selectable-color-text-selected-default', '--aec-chip-selectable-color-bg-selected-default', 4.5],
    ['Selected toggle', '--drp-toggle-button-color-option-1-selected-color', '--drp-toggle-button-color-option-1-selected-background-color', 4.5],
    ['Primary on subtle', '--aec-color-primary-on-subtle', '--aec-color-primary-subtle', 4.5],
    ['Warning chip text', '--aec-chip-information-color-warning-subtle-text', '--aec-chip-information-color-warning-subtle-bg', 4.5],
    ['Error text on page', '--aec-color-error-default', '--aec-color-bg-default', 4.5],
    ['Focus ring on page', '--aec-color-focus-default', '--aec-color-bg-default', 3],
    ['Input border on page', '--aec-input-standard-outlined-color-border-default', '--aec-color-bg-default', 3]
  ];
  function drawA11y() {
    var page = val('--aec-color-bg-default') || '#ffffff';
    var rows = PAIRS.map(function (p) {
      var fg = val(p[1]), bg = val(p[2]);
      if (!fg || !bg) return '';
      if (B.normColor(bg) === 'transparent') bg = page;
      var r = B.contrast(fg, bg);
      if (r == null) return '';
      var pass = r >= p[3];
      return '<tr><td><span class="tb-aa" style="color:' + esc(fg) + ';background:' + esc(bg) + '">Aa</span></td><td>' + esc(p[0]) + '<br><span class="doc-small doc-muted">' + esc(fg) + ' on ' + esc(bg) + '</span></td><td>' + r.toFixed(2) + ':1</td><td><span class="doc-contrast ' + (pass ? 'is-pass' : 'is-fail') + '">' + (pass ? 'Pass' : 'Fail') + ' ' + p[3] + ':1</span></td></tr>';
    }).join('');
    $('tb-a11y').innerHTML = '<table class="doc-table"><thead><tr><th scope="col"><span class="aec-visually-hidden">Sample</span></th><th scope="col">Pair</th><th scope="col">Ratio</th><th scope="col">AA</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  /* ------------------------------------------------------------------ Export */
  function meta() {
    var fams = {}; S.list.forEach(function (t) { if (/font-family/.test(t.name)) { var f = famName(t.value); fams[f] = (FONTS[f] || {}).google ? 'Google Fonts: ' + FONTS[f].google.split(':')[0].replace(/\+/g, ' ') : ((FONTS[f] || {}).substitute ? 'Substitute: ' + FONTS[f].substitute : 'Provided by the app'); } });
    return { id: S.id, name: S.name, extends: S.from, generated: new Date().toISOString().slice(0, 10), tool: 'DRS Theme builder', fonts: fams };
  }
  function header(kind) {
    var ch = Object.keys(changes()).length;
    return '/**\n * ' + S.name + ' — DRS brand tokens (' + kind + ')\n * Generated by the DRS Theme builder on ' + new Date().toISOString().slice(0, 10) + ', starting from "' + S.from + '"' + (S.scope === 'changes' ? '\n * Contains only the ' + ch + ' changed tokens.' : '') + '\n */';
  }
  function changedList() { var c = changes(); return S.list.filter(function (t) { return t.key in c; }); }
  function sourceDelta() {
    var c = changes(), m = { header: '', blocks: [] }, hit = {};
    S.list.forEach(function (t) { if (t.key in c) hit[t.ref.bi + ':' + t.ref.di] = 1; });
    S.work.blocks.forEach(function (b, bi) {
      var keep = b.decls.filter(function (d, di) { return hit[bi + ':' + di]; });
      if (keep.length) m.blocks.push({ media: b.media, selector: b.selector, decls: keep });
    });
    return m;
  }
  function output(fmt) {
    var full = S.scope === 'full';
    if (fmt === 'source') return B.toSource(full ? S.work : sourceDelta(), { header: header('drop-in classes') });
    if (fmt === 'vars') return B.toVars(null, { tokens: full ? S.list : changedList(), header: header('CSS custom properties') });
    return JSON.stringify(B.toJSON(S.work, meta(), full ? null : changedList()), null, 2) + '\n';
  }
  function ext(fmt) { return fmt === 'source' ? '.css' : fmt === 'vars' ? '.vars.css' : '.json'; }
  function drawCode() {
    var text = output(S.fmt), lines = text.split('\n');
    $('tb-code').textContent = lines.length > 400 ? lines.slice(0, 400).join('\n') + '\n\n/* … ' + (lines.length - 400).toLocaleString() + ' more lines. Download the file for the full output. */' : text;
  }
  root.querySelectorAll('[data-dl]').forEach(function (b) {
    b.addEventListener('click', function () {
      var fmt = b.getAttribute('data-dl');
      var blob = new Blob([output(fmt)], { type: fmt === 'json' ? 'application/json' : 'text/css' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = (S.id || 'brand') + (S.scope === 'changes' ? '.changes' : '') + ext(fmt);
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      D.toast('Downloaded ' + a.download);
    });
  });
  segmented($('tb-scope'), function (b) { S.scope = b.getAttribute('data-scope'); drawCode(); });
  var ctabs = [].slice.call(root.querySelectorAll('.tb-code-tabs [role="tab"]'));
  ctabs.forEach(function (t, i) {
    t.addEventListener('click', function () { ctabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); x.tabIndex = x === t ? 0 : -1; }); $('tb-code-panel').setAttribute('aria-labelledby', t.id); S.fmt = t.getAttribute('data-fmt'); drawCode(); });
    t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { var n = ctabs[(i + d + ctabs.length) % ctabs.length]; n.focus(); n.click(); } });
  });
  var codeCopy = document.createElement('button');
  codeCopy.type = 'button'; codeCopy.className = 'doc-btn'; codeCopy.textContent = 'Copy';
  codeCopy.addEventListener('click', function () { D.copy(output(S.fmt), codeCopy, 'Code copied'); });
  $('tb-code').parentNode.appendChild(codeCopy);

  /* Share link (compressed changes in the URL hash) */
  function b64(bytes) { var s = ''; bytes.forEach(function (b) { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64(str) { var s = atob(str.replace(/-/g, '+').replace(/_/g, '/')); var a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function pack(obj) {
    var data = new TextEncoder().encode(JSON.stringify(obj));
    if (!window.CompressionStream) return Promise.resolve('j' + b64(data));
    return new Response(new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer().then(function (buf) { return 'z' + b64(new Uint8Array(buf)); });
  }
  function unpack(str) {
    var kind = str[0], bytes = unb64(str.slice(1));
    if (kind === 'j') return Promise.resolve(JSON.parse(new TextDecoder().decode(bytes)));
    return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text().then(JSON.parse);
  }
  $('tb-share').addEventListener('click', function () {
    pack({ v: 1, from: S.from, name: S.name, id: S.id, c: changes() }).then(function (h) {
      var url = location.origin + location.pathname + '#t=' + h;
      history.replaceState(null, '', '#t=' + h);
      D.copy(url, null, 'Share link');
    });
  });

  /* ------------------------------------------------------------------ Top bar */
  $('tb-from').innerHTML = R.brands.map(function (b) { return '<option value="' + b.id + '">' + esc(b.name) + (b.id === R.default ? ' (blank starting point)' : '') + '</option>'; }).join('');
  $('tb-from').addEventListener('change', function () {
    var id = this.value;
    if (Object.keys(changes()).length && !confirm('Start again from ' + D.brandById(id).name + '? Your current changes will be lost.')) { this.value = S.from; return; }
    loadSource(id).then(function (css) {
      var b = D.brandById(id);
      S.name = id === R.default ? 'My brand' : b.name; S.id = id === R.default ? 'my-brand' : b.id;
      $('tb-name').value = S.name; $('tb-id').value = S.id;
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      start(id, B.parse(css));
      status('Started from ' + b.name + '.');
    });
  });
  $('tb-name').addEventListener('input', function () {
    var auto = S.id === slug(S.name);
    S.name = this.value || 'My brand';
    if (auto) { S.id = slug(S.name); $('tb-id').value = S.id; }
    refresh(true);
  });
  $('tb-id').addEventListener('input', function () { S.id = slug(this.value) || 'my-brand'; refresh(true); });
  $('tb-id').addEventListener('blur', function () { this.value = S.id; });
  function slug(s) { return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  $('tb-undo').addEventListener('click', function () { if (!S.undo.length) return; S.redo.push(changes()); restore(S.undo.pop()); });
  $('tb-redo').addEventListener('click', function () { if (!S.redo.length) return; S.undo.push(changes()); restore(S.redo.pop()); });
  $('tb-reset').addEventListener('click', function () { if (!Object.keys(changes()).length) return; S.undo.push(changes()); restore({}); status('All changes reset.'); });
  document.addEventListener('keydown', function (e) {
    if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z' || /input|textarea|select/i.test(e.target.tagName)) return;
    e.preventDefault(); (e.shiftKey ? $('tb-redo') : $('tb-undo')).click();
  });

  $('tb-import').addEventListener('change', function () {
    var f = this.files[0]; this.value = '';
    if (!f) return;
    f.text().then(function (text) {
      var incoming = {};
      if (/\.json$/i.test(f.name) || /^\s*\{/.test(text)) {
        var j = JSON.parse(text);
        incoming = B.flattenJSON(j);
        if (j.brand && j.brand.name) { S.name = j.brand.name; $('tb-name').value = S.name; }
        if (j.brand && j.brand.id) { S.id = slug(j.brand.id); $('tb-id').value = S.id; }
      } else {
        var m = B.parse(text), toks = B.tokens(m);
        if (toks.length > 1000) { // a complete brand file becomes the new starting point
          S.name = f.name.replace(/\.(vars\.)?css$/i, ''); S.id = slug(S.name); $('tb-name').value = S.name; $('tb-id').value = S.id;
          start('import', m); status('Imported ' + f.name + ' (' + toks.length.toLocaleString() + ' tokens) as the starting point.'); return;
        }
        toks.forEach(function (t) { incoming[t.key] = t.value; });
      }
      var known = {}, unknown = 0;
      Object.keys(incoming).forEach(function (k) { if (S.map[k]) known[k] = incoming[k]; else unknown++; });
      applyChanges(known);
      status('Imported ' + Object.keys(known).length + ' tokens from ' + f.name + (unknown ? ' · ' + unknown + ' unknown tokens skipped' : '') + '.');
    }).catch(function (err) { status('Could not import ' + f.name + ': ' + err.message); });
  });

  function status(msg) { $('tb-id-help').textContent = msg; }

  /* ------------------------------------------------------------------ Refresh */
  var rt;
  function refresh(now) {
    clearTimeout(rt);
    var run = function () {
      var n = Object.keys(changes()).length;
      $('tb-changes').textContent = n ? n.toLocaleString() + ' token' + (n === 1 ? '' : 's') + ' changed from ' + (S.from === 'import' ? 'the imported file' : D.brandById(S.from).name) : 'No changes yet';
      $('tb-undo').disabled = !S.undo.length; $('tb-redo').disabled = !S.redo.length;
      $('tb-cap-work').textContent = S.name + (n ? ' · ' + n + ' changes' : '');
      $('tb-cap-orig').textContent = 'Original: ' + (S.from === 'import' ? 'imported file' : D.brandById(S.from).name);
      paintFrame('work', S.work, S.list);
      refreshQuickValues();
      drawA11y();
      drawCode();
      if (!$('tb-p-palette').hidden) drawPalette();
      drawTokens();
      try { localStorage.setItem('drs-tb-draft', JSON.stringify({ from: S.from, name: S.name, id: S.id, c: changes() })); } catch (e) {}
    };
    if (now) run(); else rt = setTimeout(run, 60);
  }

  /* ------------------------------------------------------------------ Boot */
  var params = new URLSearchParams(location.search);
  var hash = (location.hash.match(/#t=([A-Za-z0-9_-]+)/) || [])[1];
  var draft = null; try { draft = JSON.parse(localStorage.getItem('drs-tb-draft') || 'null'); } catch (e) {}
  (hash ? unpack(hash).catch(function () { return null; }) : Promise.resolve(null)).then(function (shared) {
    var plan = shared ? { from: shared.from, name: shared.name, id: shared.id, c: shared.c, msg: 'Opened a shared theme.' }
      : params.get('from') ? { from: params.get('from'), msg: '' }
      : draft && draft.c && Object.keys(draft.c).length ? { from: draft.from, name: draft.name, id: draft.id, c: draft.c, msg: 'Restored your draft from this browser.' }
      : { from: R.default, msg: '' };
    if (!D.brandById(plan.from)) plan.from = R.default;
    var b = D.brandById(plan.from);
    S.name = plan.name || (plan.from === R.default ? 'My brand' : b.name);
    S.id = slug(plan.id || (plan.from === R.default ? 'my-brand' : b.id));
    $('tb-from').value = plan.from; $('tb-name').value = S.name; $('tb-id').value = S.id;
    return loadSource(plan.from).then(function (css) {
      start(plan.from, B.parse(css), plan.c);
      if (plan.msg) status(plan.msg);
    });
  }).catch(function (err) { status('The theme builder could not load the brand tokens (' + err.message + ').'); });
})();

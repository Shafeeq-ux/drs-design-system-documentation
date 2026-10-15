/* Docs kit — live, brand-aware documentation helpers. Everything is measured from the real rendered
 * component, so values follow the active brand (and per-example brand pickers).
 *
 *  State matrix   <div class="doc-state-matrix" data-states="default,hover,focus,pressed,disabled,loading">
 *                   <template data-row="Primary"><button class="aec-btn aec-btn--primary" type="button">Button</button></template>
 *                 </div>
 *                 States: default hover focus pressed disabled loading selected checked indeterminate error
 *                 The state is applied to [data-state-el] inside the template, or to its first element.
 *                 Put data-indeterminate on a checkbox in a template to make it indeterminate.
 *
 *  Spec marks     <div class="doc-spec" data-spec="height,padding,gap,radius,icon,width,border">
 *                   <button class="aec-btn" data-spec-target>…</button>     (one or more targets)
 *                 </div>
 *
 *  Live value     <span data-measure="#some-id" data-prop="height"></span>
 *                 props: height width padding-left padding-right padding-top padding-bottom gap border-radius
 *                        border-width font-size line-height font-weight font-family text-transform icon-size
 *
 *  Contrast       <table data-contrast-table> … <td><el data-contrast-sample [data-contrast-mode="text|border|fill|icon|focus"]></td><td data-contrast-result></td>
 *                 text = colour vs background (4.5:1, 3:1 large) · border = border colour vs surroundings · fill = background vs surroundings
 *                 icon = icon colour vs surroundings (automatic for .aec-icon) · focus = focus ring vs surroundings (all 3:1)
 *
 *  Do / don't     <div class="doc-dodont"><figure class="doc-do"><div class="doc-dodont-preview">…</div><figcaption>…</figcaption></figure> …</div>
 */
(function () {
  'use strict';
  var esc = (window.DRS && DRS.esc) || function (s) { return String(s); };

  /* ---------- colour ---------- */
  function rgba(s) {
    var m = String(s).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function over(top, base) { var a = top.a; return { r: top.r * a + base.r * (1 - a), g: top.g * a + base.g * (1 - a), b: top.b * a + base.b * (1 - a), a: 1 }; }
  function bgOf(el, skipSelf) {
    var stack = [], n = skipSelf ? el.parentElement : el;
    while (n && n.nodeType === 1) { var c = rgba(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } n = n.parentElement; }
    var out = { r: 255, g: 255, b: 255, a: 1 };
    for (var i = stack.length - 1; i >= 0; i--) out = over(stack[i], out);
    return out;
  }
  function lum(c) { var f = function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); }
  function ratio(a, b) { var l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
  function hex(c) { return '#' + [c.r, c.g, c.b].map(function (x) { return ('0' + Math.round(x).toString(16)).slice(-2); }).join(''); }

  /* ---------- state matrix ---------- */
  var LABEL = { 'default': 'Default', hover: 'Hover', focus: 'Focus', pressed: 'Pressed', disabled: 'Disabled', loading: 'Loading', selected: 'Selected', checked: 'Checked', indeterminate: 'Indeterminate', error: 'Error', filled: 'Filled' };
  function applyState(root, el, st) {
    var isForm = /^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName);
    switch (st) {
      case 'hover': el.classList.add('is-hover'); break;
      case 'pressed': el.classList.add('is-pressed'); break;
      case 'focus': el.classList.add('is-focus'); break;
      case 'disabled':
        if (isForm) el.disabled = true; else { el.setAttribute('aria-disabled', 'true'); el.classList.add('is-disabled'); }
        root.querySelectorAll('input,button,select,textarea').forEach(function (x) { x.disabled = true; });
        break;
      case 'loading': el.classList.add('is-loading'); el.setAttribute('aria-busy', 'true'); break;
      case 'selected':
        if (el.hasAttribute('aria-pressed')) el.setAttribute('aria-pressed', 'true');
        else if (el.hasAttribute('aria-checked')) el.setAttribute('aria-checked', 'true');
        else if (el.hasAttribute('aria-selected')) el.setAttribute('aria-selected', 'true');
        else el.classList.add('is-selected');
        break;
      case 'checked': (el.matches('input') ? el : el.querySelector('input') || el).checked = true; break;
      case 'indeterminate': var i = el.matches('input') ? el : el.querySelector('input'); if (i) i.indeterminate = true; break;
      case 'error':
        var inp = el.matches('input,select,textarea') ? el : root.querySelector('input,select,textarea');
        if (inp) inp.setAttribute('aria-invalid', 'true');
        var f = root.querySelector('.aec-field') || (root.classList && root.classList.contains('aec-field') ? root : null);
        if (f) f.classList.add('aec-field--error');
        break;
      case 'filled': var v = root.querySelector('input'); if (v && !v.value) v.value = v.getAttribute('data-fill') || 'Text'; break;
    }
  }
  function buildMatrix(m) {
    var states = (m.getAttribute('data-states') || 'default,hover,focus,pressed,disabled').split(',').map(function (s) { return s.trim(); });
    var rows = [].slice.call(m.querySelectorAll('template[data-row]'));
    var grid = document.createElement('div');
    grid.className = 'doc-state-grid';
    grid.style.setProperty('--cols', states.length);
    grid.setAttribute('role', 'table');
    grid.setAttribute('aria-label', m.getAttribute('aria-label') || 'States');
    var head = '<div class="doc-state-row doc-state-head" role="row"><span role="columnheader"><span class="aec-visually-hidden">Variant</span></span>' + states.map(function (s) { return '<span role="columnheader">' + esc(LABEL[s] || s) + '</span>'; }).join('') + '</div>';
    grid.innerHTML = head;
    rows.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'doc-state-row'; row.setAttribute('role', 'row');
      row.innerHTML = '<span class="doc-state-name" role="rowheader">' + esc(t.getAttribute('data-row')) + '</span>';
      states.forEach(function (st) {
        var cell = document.createElement('div');
        cell.className = 'doc-state-cell'; cell.setAttribute('role', 'cell');
        if (t.hasAttribute('data-dark')) cell.classList.add('is-dark');
        var frag = t.content.cloneNode(true);
        frag.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
        frag.querySelectorAll('[for]').forEach(function (n) { n.removeAttribute('for'); });
        frag.querySelectorAll('input[name]').forEach(function (n) { n.name = n.name + '-' + Math.random().toString(36).slice(2, 7); });
        var wrap = document.createElement('div'); wrap.className = 'doc-state-demo'; wrap.appendChild(frag);
        wrap.querySelectorAll('[data-indeterminate]').forEach(function (n) { n.indeterminate = true; });
        var el = wrap.querySelector('[data-state-el]') || wrap.firstElementChild;
        if (el) applyState(wrap, el, st);
        wrap.setAttribute('inert', '');
        cell.appendChild(wrap);
        row.appendChild(cell);
      });
      grid.appendChild(row);
    });
    m.appendChild(grid);
  }

  /* ---------- spec marks ---------- */
  function px(v) { return Math.round(parseFloat(v) * 10) / 10; }
  function fmt(v) { var n = px(v); return (n === Math.round(n) ? Math.round(n) : n) + 'px'; }
  function rad(v, h) { var n = parseFloat(v); return n >= 100 || (h && n >= h / 2 - 0.5 && n > 0) ? 'pill' : fmt(v); }
  function mark(spec, cls, x, y, w, h, label) {
    var d = document.createElement('span');
    d.className = 'doc-spec-mark ' + cls;
    d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + Math.max(0, w) + 'px;height:' + Math.max(0, h) + 'px';
    if (label) d.setAttribute('data-label', label);
    d.setAttribute('aria-hidden', 'true');
    spec.appendChild(d);
  }
  function drawSpec(spec) {
    spec.querySelectorAll('.doc-spec-mark').forEach(function (n) { n.remove(); });
    var what = (spec.getAttribute('data-spec') || 'height,padding,gap,radius').split(',').map(function (s) { return s.trim(); });
    var box = spec.getBoundingClientRect();
    spec.querySelectorAll('[data-spec-target]').forEach(function (t) {
      var r = t.getBoundingClientRect(), cs = getComputedStyle(t);
      if (!r.width) return;
      var x = r.left - box.left, y = r.top - box.top;
      if (what.indexOf('height') > -1) mark(spec, 'is-v is-out-left', x - 14, y, 1, r.height, fmt(r.height));
      if (what.indexOf('width') > -1) mark(spec, 'is-h is-out-bottom', x, y + r.height + 10, r.width, 1, fmt(r.width));
      if (what.indexOf('padding') > -1) {
        var pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
        if (pl > 0) mark(spec, 'is-fill is-out-top', x + parseFloat(cs.borderLeftWidth), y, pl, r.height, fmt(pl));
        if (pr > 0) mark(spec, 'is-fill is-out-top', x + r.width - pr - parseFloat(cs.borderRightWidth), y, pr, r.height, fmt(pr));
      }
      if (what.indexOf('padding-y') > -1) {
        var pt = parseFloat(cs.paddingTop);
        if (pt > 0) mark(spec, 'is-fill is-out-right', x, y + parseFloat(cs.borderTopWidth), r.width, pt, fmt(pt));
      }
      if (what.indexOf('gap') > -1) {
        var g = parseFloat(cs.columnGap || cs.gap);
        var kids = [].slice.call(t.children).filter(function (k) { return k.getBoundingClientRect().width > 0; });
        if (g > 0 && kids.length) {
          var k = kids[0], kr = k.getBoundingClientRect(), lead = true, p = k.previousSibling;
          if (/column/.test(cs.flexDirection) || cs.display === 'grid' && kids[1] && kids[1].getBoundingClientRect().top >= kr.bottom - 1) {
            var rg = parseFloat(cs.rowGap || cs.gap) || g;
            mark(spec, 'is-fill is-gap is-out-right', x + r.width * 0.2, kr.bottom - box.top, r.width * 0.6, rg, fmt(rg));
          } else {
            while (p) { if (p.nodeType === 3 ? p.textContent.trim() : p.nodeType === 1) { lead = false; break; } p = p.previousSibling; }
            var gx = lead ? kr.right : kr.left - g;
            mark(spec, 'is-fill is-gap is-out-bottom', gx - box.left, y + r.height * 0.25, g, r.height * 0.5, fmt(g));
          }
        }
      }
      if (what.indexOf('icon') > -1) {
        var ic = t.querySelector('.aec-icon');
        if (ic) { var ir = ic.getBoundingClientRect(); mark(spec, 'is-outline is-out-top', ir.left - box.left, ir.top - box.top, ir.width, ir.height, fmt(ir.width)); }
      }
      var tagY = y + r.height / 2 - (what.indexOf('border') > -1 && what.indexOf('radius') > -1 ? 18 : 8);
      if (what.indexOf('radius') > -1) { mark(spec, 'is-tag', x + r.width + 10, tagY, 0, 0, 'radius ' + rad(cs.borderTopLeftRadius, r.height)); tagY += 20; }
      if (what.indexOf('border') > -1) mark(spec, 'is-tag', x + r.width + 10, tagY, 0, 0, 'border ' + fmt(cs.borderTopWidth));
    });
  }

  /* ---------- live values ---------- */
  function measure(el) {
    var t = document.querySelector(el.getAttribute('data-measure'));
    if (!t) return;
    var prop = el.getAttribute('data-prop'), cs = getComputedStyle(t), r = t.getBoundingClientRect(), v;
    switch (prop) {
      case 'height': v = fmt(r.height); break;
      case 'width': v = fmt(r.width); break;
      case 'gap': v = fmt(cs.columnGap || cs.gap); break;
      case 'border-radius': v = rad(cs.borderTopLeftRadius, r.height); break;
      case 'border-width': v = fmt(cs.borderTopWidth); break;
      case 'font-family': v = cs.fontFamily.split(',')[0].replace(/["']/g, ''); break;
      case 'icon-size': var ic = t.querySelector('.aec-icon'); v = ic ? fmt(ic.getBoundingClientRect().width) : '—'; break;
      case 'font-weight': case 'text-transform': v = cs.getPropertyValue(prop); break;
      case 'color': case 'background-color': case 'border-color': var c = rgba(cs.getPropertyValue(prop === 'border-color' ? 'border-top-color' : prop)); v = c ? hex(c) : ''; break;
      default: v = /px$/.test(cs.getPropertyValue(prop)) ? fmt(cs.getPropertyValue(prop)) : cs.getPropertyValue(prop);
    }
    el.textContent = v;
  }

  /* ---------- contrast ---------- */
  function contrastRow(sample) {
    var row = sample.closest('tr'); if (!row) return;
    var out = row.querySelector('[data-contrast-result]'); if (!out) return;
    var mode = sample.getAttribute('data-contrast-mode') || 'text', cs = getComputedStyle(sample), fg, bg, min;
    if (mode === 'border') { fg = rgba(cs.borderTopColor); bg = bgOf(sample, true); min = 3; }
    else if (mode === 'fill') { fg = rgba(cs.backgroundColor); bg = bgOf(sample, true); min = 3; }
    else if (mode === 'icon' || sample.classList.contains('aec-icon')) { fg = rgba(cs.color); bg = bgOf(sample, true); min = 3; }
    else if (mode === 'focus') { fg = rgba(getComputedStyle(document.documentElement).getPropertyValue('--aec-color-focus-default').trim().replace(/^#(..)(..)(..)$/, function (_, r, g, b) { return 'rgb(' + parseInt(r, 16) + ',' + parseInt(g, 16) + ',' + parseInt(b, 16) + ')'; })) || rgba(cs.outlineColor); bg = bgOf(sample, true); min = 3; }
    else { fg = rgba(cs.color); bg = bgOf(sample); min = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700) ? 3 : 4.5; }
    if (!fg) return;
    if (fg.a < 1) fg = over(fg, bg);
    var r = ratio(fg, bg), pass = r >= min, aaa = r >= (min === 3 ? 4.5 : 7);
    out.innerHTML = '<span class="doc-contrast ' + (pass ? 'is-pass' : 'is-fail') + '">' + r.toFixed(2) + ':1 ' + (pass ? (aaa ? 'AAA' : 'AA') : 'Fails ' + min + ':1') + '</span><span class="doc-small doc-muted" style="display:block">' + hex(fg) + ' on ' + hex(bg) + '</span>';
  }

  /* ---------- refresh ---------- */
  function refresh() {
    document.querySelectorAll('.doc-spec').forEach(drawSpec);
    document.querySelectorAll('[data-measure]').forEach(measure);
    document.querySelectorAll('[data-contrast-sample]').forEach(contrastRow);
  }
  var t;
  function later() { clearTimeout(t); t = setTimeout(refresh, 80); }

  function init() {
    document.querySelectorAll('.doc-state-matrix').forEach(buildMatrix);
    document.querySelectorAll('.doc-dodont-preview').forEach(function (p) { p.setAttribute('inert', ''); });
    refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    window.addEventListener('load', later);
    window.addEventListener('resize', later);
    document.addEventListener('drs:brand', function () { setTimeout(refresh, 60); });
    new MutationObserver(later).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-brand'] });
    // brand stylesheets load asynchronously
    document.querySelectorAll('link[data-brand-css]').forEach(function (l) { l.addEventListener('load', later); });
    new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.tagName === 'LINK') n.addEventListener('load', later); }); }); }).observe(document.head, { childList: true });
  }
  window.DRSKit = { refresh: refresh };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

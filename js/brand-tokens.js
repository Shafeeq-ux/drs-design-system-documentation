/* Brand tokens page: download cards + cross-brand token explorer (reads downloads/brands/<id>.json). */
(function () {
  'use strict';
  var R = window.DRS_BRANDS, D = window.DRS, B = window.DRSBrand;
  if (!R || !D || !B) return;
  var esc = D.esc, ROOT = D.ROOT;
  var brands = R.brands;

  function sw(b) {
    var bg = b.button && b.button.bg && !/^#?f{3,6}$/i.test(String(b.button.bg).replace('#', '')) ? b.button.bg : b.primary;
    return '<span class="doc-brand-swatch" aria-hidden="true" style="--sw-1:' + esc(bg) + ';--sw-2:' + esc(b.primary) + ';--sw-r:' + esc((b.button && b.button.radius) || '4px') + '"></span>';
  }
  function dot(v) { return '<span class="bt-dot" style="background:' + esc(v) + '" aria-hidden="true"></span>'; }

  // ---- Download cards
  var cards = document.querySelector('[data-brand-downloads]');
  if (cards) {
    cards.innerHTML = brands.map(function (b) {
      var base = ROOT + 'downloads/brands/' + b.id;
      var fonts = (b.families || []).join(', ');
      return '<article class="bt-card">' +
        '<header>' + sw(b) + '<div><h3>' + esc(b.name) + (b.id === R.default ? ' <span class="doc-pill">Default</span>' : '') + '</h3><p>' + esc(b.description || '') + '</p></div></header>' +
        '<dl class="bt-facts">' +
          '<div><dt>Primary</dt><dd>' + dot(b.primary) + '<code>' + esc(b.primary) + '</code></dd></div>' +
          '<div><dt>Secondary</dt><dd>' + dot(b.secondary) + '<code>' + esc(b.secondary) + '</code></dd></div>' +
          '<div><dt>Button</dt><dd>' + esc(b.button.radius) + ' corners' + (b.button.case && b.button.case !== 'none' ? ', ' + esc(b.button.case) : '') + '</dd></div>' +
          '<div><dt>Fonts</dt><dd>' + esc(fonts) + '</dd></div>' +
          '<div><dt>Tokens</dt><dd>' + b.tokens.toLocaleString() + '</dd></div>' +
        '</dl>' +
        '<div class="bt-dl">' +
          '<a class="aec-btn aec-btn--primary aec-btn--sm" href="' + base + '.css" download="' + b.id + '.css">' + b.id + '.css</a>' +
          '<a class="aec-btn aec-btn--primary aec-btn--outline aec-btn--sm" href="' + base + '.vars.css" download="' + b.id + '.vars.css">.vars.css</a>' +
          '<a class="aec-btn aec-btn--primary aec-btn--outline aec-btn--sm" href="' + base + '.json" download="' + b.id + '.json">.json</a>' +
        '</div>' +
        '<div class="bt-links"><button type="button" class="aec-link aec-link--sm" data-preview-brand="' + b.id + '">Preview site in ' + esc(b.name) + '</button><a class="aec-link aec-link--sm" href="theme-builder.html?from=' + b.id + '">Edit in Theme builder</a></div>' +
      '</article>';
    }).join('');
    cards.addEventListener('click', function (e) { var p = e.target.closest('[data-preview-brand]'); if (p) D.setBrand(p.getAttribute('data-preview-brand')); });
  }

  // ---- Explorer
  var tableEl = document.querySelector('[data-tx-table]');
  if (!tableEl) return;
  var q = document.querySelector('[data-tx-search]'), gSel = document.querySelector('[data-tx-group]'), lSel = document.querySelector('[data-tx-layer]'), mSel = document.querySelector('[data-tx-media]'), diff = document.querySelector('[data-tx-diff]');
  var countEl = document.querySelector('[data-tx-count]'), more = document.querySelector('[data-tx-more]');
  var rows = [], limit = 150;

  Promise.all(brands.map(function (b) {
    return fetch(ROOT + 'downloads/brands/' + b.id + '.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { return { id: b.id, flat: B.flattenJSON(j) }; });
  })).then(function (sets) {
    var keys = {}, order = [];
    sets.forEach(function (s) { Object.keys(s.flat).forEach(function (k) { if (!keys[k]) { keys[k] = 1; order.push(k); } }); });
    var groups = {}, medias = {};
    rows = order.map(function (k) {
      var parts = k.split('@'), name = parts[0], media = parts[1] || '';
      var g = B.groupOf(name);
      groups[g] = 1; if (media) medias[media] = 1;
      var vals = sets.map(function (s) { return s.flat[k]; });
      var norm = vals.map(function (v) { return v == null ? '' : B.normColor(v); });
      return { key: k, name: name, media: media, group: g, layer: name.indexOf('--drp-') === 0 ? 'class' : 'var', vals: vals, norm: norm, differs: norm.some(function (v) { return v !== norm[0]; }), hay: (k + ' ' + vals.join(' ')).toLowerCase() };
    });
    Object.keys(groups).sort().forEach(function (g) { gSel.insertAdjacentHTML('beforeend', '<option>' + esc(g) + '</option>'); });
    Object.keys(medias).forEach(function (m) { mSel.insertAdjacentHTML('beforeend', '<option value="' + esc(m) + '">' + esc(m) + '</option>'); });
    draw();
  }).catch(function () {
    countEl.textContent = 'Tokens could not be loaded. Use the downloads above.';
  });

  function filtered() {
    var s = (q.value || '').trim().toLowerCase(), g = gSel.value, l = lSel.value, m = mSel.value, d = diff.checked;
    return rows.filter(function (r) {
      if (s && r.hay.indexOf(s) < 0) return false;
      if (g && r.group !== g) return false;
      if (l && r.layer !== l) return false;
      if (m === 'base' && r.media) return false;
      if (m && m !== 'base' && r.media !== m) return false;
      if (d && !r.differs) return false;
      return true;
    });
  }
  function cell(v, isDiff) {
    if (v == null) return '<td class="bt-na">—</td>';
    var c = B.parseColor(v);
    return '<td' + (isDiff ? ' class="is-diff"' : '') + '>' + (c ? dot(v) : '') + '<span>' + esc(v) + '</span></td>';
  }
  function draw() {
    var list = filtered();
    countEl.textContent = list.length.toLocaleString() + ' of ' + rows.length.toLocaleString() + ' tokens' + (list.length > limit ? ' · showing ' + limit : '');
    var head = '<tr><th scope="col">Token</th>' + brands.map(function (b) { return '<th scope="col">' + esc(b.name) + '</th>'; }).join('') + '</tr>';
    var body = list.slice(0, limit).map(function (r) {
      return '<tr><th scope="row"><button type="button" class="bt-name" data-copy="' + esc(r.name) + '" data-copy-label="' + esc(r.name) + '">' + esc(r.name) + '</button>' +
        '<span class="bt-meta">' + esc(r.group) + (r.media ? ' · <span class="bt-media">' + esc(r.media) + '</span>' : '') + '</span></th>' +
        r.vals.map(function (v, i) { return cell(v, i > 0 && r.norm[i] !== r.norm[0]); }).join('') + '</tr>';
    }).join('');
    tableEl.innerHTML = list.length ? '<table class="bt-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>' : '<p class="doc-muted">No tokens match.</p>';
    more.hidden = list.length <= limit;
  }
  var t;
  function redraw() { clearTimeout(t); t = setTimeout(function () { limit = 150; draw(); }, 120); }
  [q, gSel, lSel, mSel, diff].forEach(function (el) { el.addEventListener(el === q ? 'input' : 'change', redraw); });
  more.addEventListener('click', function () { limit += 300; draw(); });
})();

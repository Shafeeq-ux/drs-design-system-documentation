/* Multi-brand page: site brand buttons, side-by-side specimen grid, fonts table. */
(function () {
  'use strict';
  var R = window.DRS_BRANDS, D = window.DRS, SP = window.DRS_SPECIMENS;
  if (!R || !D) return;
  var esc = D.esc;
  var brands = R.brands;

  document.querySelectorAll('[data-brand-count]').forEach(function (el) { el.textContent = brands.length + ' brands'; });

  function sw(b) {
    var bg = b.button && b.button.bg && !/^#?f{3,6}$/i.test(String(b.button.bg).replace('#', '')) ? b.button.bg : b.primary;
    return '<span class="doc-brand-swatch" aria-hidden="true" style="--sw-1:' + esc(bg) + ';--sw-2:' + esc(b.primary) + ';--sw-r:' + esc((b.button && b.button.radius) || '4px') + '"></span>';
  }

  // ---- Site brand buttons
  var btnWrap = document.querySelector('[data-brand-buttons]');
  function drawButtons() {
    if (!btnWrap) return;
    var cur = D.currentBrand();
    btnWrap.innerHTML = brands.map(function (b) {
      return '<button type="button" class="bc-switch-btn" data-set-brand="' + b.id + '" aria-pressed="' + (b.id === cur) + '">' + sw(b) + '<span>' + esc(b.name) + '</span></button>';
    }).join('');
  }
  drawButtons();
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set-brand]');
    if (b) D.setBrand(b.getAttribute('data-set-brand'));
  });
  document.addEventListener('drs:brand', drawButtons);

  // ---- Compare grid
  var grid = document.querySelector('[data-brand-compare]');
  var filter = document.querySelector('[data-specimen-filter]');
  var current = 'buttons';
  function drawFilter() {
    if (!filter) return;
    filter.innerHTML = Object.keys(SP.list).map(function (k) {
      return '<button type="button" class="bc-filter-btn" data-specimen-key="' + k + '" aria-pressed="' + (k === current) + '">' + esc(SP.list[k].label) + '</button>';
    }).join('');
  }
  function drawGrid() {
    if (!grid) return;
    grid.innerHTML = brands.map(function (b) {
      var fonts = [b.fonts.body, b.fonts.heading].filter(function (x, i, a) { return x && a.indexOf(x) === i; }).join(' · ');
      return '<article class="bc-card">' +
        '<header class="bc-card-head">' + sw(b) + '<div><h3>' + esc(b.name) + '</h3><p>' + esc(fonts) + ' · radius ' + esc(b.button.radius || b.radius) + (b.button.case && b.button.case !== 'none' ? ' · ' + esc(b.button.case) + ' buttons' : '') + '</p></div>' +
        '<button type="button" class="bc-use" data-set-brand="' + b.id + '">Use</button></header>' +
        '<div class="bc-card-body" data-brand="' + b.id + '">' + SP.render(current) + '</div></article>';
    }).join('');
    if (window.AEC) window.AEC.init(grid);
  }
  if (filter) filter.addEventListener('click', function (e) {
    var b = e.target.closest('[data-specimen-key]');
    if (!b) return;
    current = b.getAttribute('data-specimen-key');
    drawFilter(); drawGrid();
  });
  // Demo links in specimens must not navigate
  if (grid) grid.addEventListener('click', function (e) { var a = e.target.closest('a[href="#"]'); if (a) e.preventDefault(); });

  if (grid) {
    drawFilter();
    Promise.all(brands.map(function (b) { return D.loadBrand(b.id).catch(function () {}); })).then(drawGrid);
  }

  // ---- Fonts table
  var ft = document.querySelector('[data-font-table]');
  if (ft) {
    var rows = [];
    brands.forEach(function (b) {
      var byFam = {};
      ['body', 'heading', 'display', 'button'].forEach(function (role) { var f = b.fonts[role]; if (f) (byFam[f] = byFam[f] || []).push(role); });
      Object.keys(byFam).forEach(function (f) {
        var sub = (R.fonts[f] || {}).substitute || '—';
        rows.push('<tr><td>' + esc(b.name) + '</td><td>' + byFam[f].join(', ') + '</td><td>' + esc(f) + '</td><td><span style="font-family:\'' + esc(sub) + '\',sans-serif">' + esc(sub) + '</span></td></tr>');
      });
    });
    ft.innerHTML = '<table class="doc-table"><thead><tr><th>Brand</th><th>Used for</th><th>Brand font</th><th>Public substitute</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>';
    // Load substitutes so the samples render
    brands.forEach(function (b) { if (b.google && !document.querySelector('link[data-brand-font="' + b.id + '"]')) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = b.google; l.setAttribute('data-brand-font', b.id); document.head.appendChild(l); } });
  }
})();

/* DRS docs — shared chrome (header, sidebar, search), copy buttons, code toggles, pager. */
(function () {
  'use strict';

  var ROOT = document.documentElement.getAttribute('data-root') || '';
  var FIGMA = 'https://www.figma.com/design/ilpJ5K66cGR85o287K4HDD';
  var VERSION = 'v1.3.0';
  var BRANDS = window.DRS_BRANDS || { default: 'base', brands: [] };

  // status: done | wip  (mirrors the Figma "Component Status" page)
  var NAV = [
    { title: 'Get started', items: [
      { href: 'index.html', label: 'Overview', desc: 'What the DRS Chevrolet design foundation is and how it is organised.' },
      { href: 'get-started/designers.html', label: 'For designers', desc: 'Use the Figma library, styles and components.' },
      { href: 'get-started/developers.html', label: 'For developers', desc: 'Install tokens.css and components.css and use the classes.' },
      { href: 'get-started/status.html', label: 'Component status', desc: 'Delivery status for every foundation and component.' },
      { href: 'get-started/changelog.html', label: 'Changelog', desc: 'Release notes.' }
    ]},
    { title: 'Foundations', items: [
      { href: 'foundations/colour.html', label: 'Colour', desc: 'Semantic colour tokens for surfaces, text, actions and status.' },
      { href: 'foundations/typography.html', label: 'Typography', desc: 'Display, heading and body styles with responsive sizes.' },
      { href: 'foundations/spacing.html', label: 'Spacing', desc: 'Container and selectable padding, gap and stack tokens.' },
      { href: 'foundations/border.html', label: 'Border', desc: 'Corner radius and border width tokens.' },
      { href: 'foundations/elevation.html', label: 'Elevation', desc: 'Seven shadow levels from none to 2xl.' },
      { href: 'foundations/icons.html', label: 'Icons', desc: 'Brand icon fonts: browse, compare across brands and download.' },
      { href: 'foundations/illustrations.html', label: 'Illustrations', desc: 'Spot illustrations for empty states and highlights.' }
    ]},
    { title: 'Brands', items: [
      { href: 'brands/index.html', label: 'Multi-brand', desc: 'How one set of components re-themes per brand through tokens. Compare every brand side by side.' },
      { href: 'brands/tokens.html', label: 'Brand tokens', desc: 'Every token for every brand. Download as CSS or JSON.' },
      { href: 'brands/theme-builder.html', label: 'Theme builder', desc: 'Create a new brand or edit an existing one, preview it live and export CSS and JSON.' }
    ]},
    { title: 'Components', groups: [
      { title: 'Inputs', items: [
        { href: 'components/button.html', label: 'Button', desc: 'Triggers an action, such as submitting a form or opening a dialog.' },
        { href: 'components/icon-button.html', label: 'Icon button', desc: 'A compact, icon-only button for common actions.' },
        { href: 'components/checkbox.html', label: 'Checkbox', desc: 'Turns an option on or off, or selects several options from a list.' },
        { href: 'components/form-control.html', label: 'Form control', desc: 'Wraps a selection control with its label and helper text.' },
        { href: 'components/menu.html', label: 'Menu', desc: 'A list of options or actions that opens from a trigger.' },
        { href: 'components/radio.html', label: 'Radio button', desc: 'Selects one option from a short, visible list.' },
        { href: 'components/slider.html', label: 'Slider', desc: 'Selects a value or range by dragging along a track.' },
        { href: 'components/switch.html', label: 'Switch', desc: 'Turns a single setting on or off with immediate effect.' },
        { href: 'components/text-field.html', label: 'Text field', desc: 'Lets people enter and edit short text.' },
        { href: 'components/toggle-button.html', label: 'Toggle button', desc: 'Groups related options where one or more can be selected.' }
      ]},
      { title: 'Data display', items: [
        { href: 'components/avatar.html', label: 'Avatar', desc: 'Represents a person with an image, initials or an icon.' },
        { href: 'components/badge.html', label: 'Badge', desc: 'Shows a count or status dot on another element.' },
        { href: 'components/chip.html', label: 'Chip', desc: 'Compact elements for status, filters and selections.' },
        { href: 'components/tooltip.html', label: 'Tooltip', desc: 'A short text hint shown on hover or focus.' },
        { href: 'components/table.html', label: 'Table', desc: 'Organises data into rows and columns.' }
      ]},
      { title: 'Feedback', items: [
        { href: 'components/alert.html', label: 'Alert', desc: 'A prominent message about the current page or task.' },
        { href: 'components/banner.html', label: 'Banner', desc: 'A full-width message at the top of a page or section.' },
        { href: 'components/progress.html', label: 'Progress', desc: 'Shows that something is happening and how far along it is.', status: 'wip' },
        { href: 'components/snackbar.html', label: 'Snackbar', desc: 'A brief message about the result of an action.' },
        { href: 'components/modal.html', label: 'Modal & sheet', desc: 'A dialog that focuses attention on a task or message.' }
      ]},
      { title: 'Surfaces', items: [
        { href: 'components/accordion.html', label: 'Accordion', desc: 'Shows and hides sections of related content.' }
      ]},
      { title: 'Navigation', items: [
        { href: 'components/breadcrumbs.html', label: 'Breadcrumbs', desc: 'Shows where the page sits in the hierarchy.' },
        { href: 'components/header.html', label: 'Header', desc: 'The global page header with brand and navigation.' },
        { href: 'components/link.html', label: 'Link', desc: 'Navigates to another page or place on the same page.' },
        { href: 'components/pagination.html', label: 'Pagination', desc: 'Moves between pages of a long list.', status: 'wip' },
        { href: 'components/tabs.html', label: 'Tabs', desc: 'Switches between related views on the same page.' }
      ]}
    ]},
    { title: 'Patterns', groups: [
      { title: 'Overview', items: [
        { href: 'patterns/index.html', label: 'About patterns', desc: 'Composite components from the DR 2.0 Chevy Components library.' },
        { href: 'patterns/templates.html', label: 'Page template', desc: 'Checkout page shell: header, left nav, content grid, summary rail and bottom bar.' }
      ]},
      { title: 'Navigation', items: [
        { href: 'patterns/left-navigation.html', label: 'Left navigation', desc: 'The checkout journey navigation with rail and drawer modes.' },
        { href: 'patterns/page-header.html', label: 'Page header', desc: 'In-page header, welcome header and filter bar for checkout steps.' },
        { href: 'patterns/stepper.html', label: 'Stepper', desc: 'Compact step-progress dots and segmented progress.' },
        { href: 'patterns/footers.html', label: 'Footers', desc: 'Inline form footer, sticky bottom bar and mobile CTA.' }
      ]},
      { title: 'Feedback', items: [
        { href: 'patterns/notifications.html', label: 'Notifications', desc: 'Toast, solid banner, inline and slim alert notifications.' },
        { href: 'patterns/live-session.html', label: 'Live session', desc: 'Live personal-session banner and toolbar.' },
        { href: 'patterns/rich-tooltip.html', label: 'Rich tooltip', desc: 'Tooltip with an illustration, such as “Where to find VIN?”.' },
        { href: 'patterns/error-states.html', label: 'Error & empty states', desc: 'Full-section error, success and empty states.' }
      ]},
      { title: 'Overlays', items: [
        { href: 'patterns/modal-dialogs.html', label: 'Modals & dialogs', desc: 'Modal content types, share, reserve, switch vehicle and contact dealer.' },
        { href: 'patterns/side-sheets.html', label: 'Side sheets', desc: 'Right side sheets in three widths, with navigation rail and price footer.' },
        { href: 'patterns/signature.html', label: 'Signature sheet', desc: 'E-signature side sheet: documents, signing and disclosure.' },
        { href: 'patterns/bottom-sheets.html', label: 'Bottom sheets', desc: 'Mobile bottom sheets for financing and trade-in.' }
      ]},
      { title: 'Checkout', items: [
        { href: 'patterns/mathbox.html', label: 'Mathbox', desc: 'Persistent vehicle and payment summary panel.' },
        { href: 'patterns/cards.html', label: 'Card anatomy', desc: 'Shared card parts: media, price, CTA, chips.' },
        { href: 'patterns/card-products.html', label: 'Product cards', desc: 'Protection plans, packages, rebates, accessories, chargers and subscriptions.' },
        { href: 'patterns/card-finance.html', label: 'Finance cards', desc: 'Finance offers, financing info and credit application cards.' },
        { href: 'patterns/card-payment.html', label: 'Payment cards', desc: 'Payment method, payment type, processing status and payment summary.' },
        { href: 'patterns/card-trade-in.html', label: 'Trade-in cards', desc: 'Trade-in add, info, summary and photo upload.' },
        { href: 'patterns/card-delivery.html', label: 'Delivery & scheduling', desc: 'Delivery method, scheduled delivery and appointment cards.' },
        { href: 'patterns/card-documents.html', label: 'Document cards', desc: 'Document upload, summary and signature document listing.' },
        { href: 'patterns/card-other.html', label: 'Other cards', desc: 'Summary, contact dealership, garage, OTP, conflict resolution and more.' }
      ]},
      { title: 'Forms', items: [
        { href: 'patterns/form-patterns.html', label: 'Form layouts', desc: 'Form input groups, questions and checkbox groups.' },
        { href: 'patterns/calendar.html', label: 'Calendar', desc: 'Date picker calendar for delivery and appointments.' },
        { href: 'patterns/vehicle-selector.html', label: 'Vehicle selector', desc: 'Year, make and model selection.' }
      ]},
      { title: 'Media & screens', items: [
        { href: 'patterns/gallery.html', label: 'Gallery', desc: 'Vehicle gallery, gallery preview, vehicle image and top banner.' },
        { href: 'patterns/congratulations.html', label: 'Congratulations', desc: 'Order confirmation screen.' },
        { href: 'patterns/in-store.html', label: 'In-store', desc: 'In-store kiosk and tablet patterns.' },
        { href: 'patterns/misc.html', label: 'Misc', desc: 'Titles, loading screen, placeholders and data-table cells.' }
      ]}
    ]}
  ];

  var ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 7-5 5 5 5M16 7l5 5-5 5"/></svg>',
    figma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 3h4v6H8a3 3 0 0 1 0-6zM12 3h4a3 3 0 0 1 0 6h-4zM8 9h4v6H8a3 3 0 0 1 0-6zM12 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM8 15h4v3a3 3 0 1 1-4-3z"/></svg>'
  };

  function flat() {
    var out = [];
    NAV.forEach(function (sec) {
      (sec.items || []).forEach(function (i) { out.push(Object.assign({ section: sec.title }, i)); });
      (sec.groups || []).forEach(function (g) { g.items.forEach(function (i) { out.push(Object.assign({ section: sec.title + ' · ' + g.title }, i)); }); });
    });
    return out;
  }
  var PAGES = flat();

  function currentHref() {
    var path = location.pathname.replace(/\/+$/, '/');
    var file = path.split('/').pop() || 'index.html';
    if (!/\.html$/.test(file)) file = 'index.html';
    var dir = path.split('/').slice(-2, -1)[0];
    var match = PAGES.filter(function (p) {
      var parts = p.href.split('/');
      return parts[parts.length - 1] === file && (parts.length === 1 ? !['components', 'foundations', 'get-started', 'patterns', 'brands'].includes(dir) : parts[0] === dir);
    })[0];
    return match ? match.href : null;
  }
  var CURRENT = currentHref();

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function navLink(i) {
    var cur = i.href === CURRENT ? ' aria-current="page"' : '';
    var badge = i.status === 'wip' ? '<span class="doc-nav-badge">Beta</span>' : '';
    return '<li><a href="' + ROOT + i.href + '"' + cur + '><span>' + esc(i.label) + '</span>' + badge + '</a></li>';
  }

  function renderSidebar() {
    var html = '';
    NAV.forEach(function (sec) {
      html += '<div class="doc-nav-group"><p class="doc-nav-title">' + esc(sec.title) + '</p>';
      if (sec.items) html += '<ul class="doc-nav-list">' + sec.items.map(navLink).join('') + '</ul>';
      (sec.groups || []).forEach(function (g) {
        html += '<p class="doc-nav-sub">' + esc(g.title) + '</p><ul class="doc-nav-list">' + g.items.map(navLink).join('') + '</ul>';
      });
      html += '</div>';
    });
    return '<nav class="doc-sidebar" id="doc-sidebar" aria-label="Documentation">' + html + '</nav><div class="doc-backdrop" data-close-nav></div>';
  }

  function renderHeader() {
    var sec = CURRENT ? (CURRENT.indexOf('components/') === 0 ? 'components' : CURRENT.indexOf('foundations/') === 0 ? 'foundations' : CURRENT.indexOf('patterns/') === 0 ? 'patterns' : CURRENT.indexOf('brands/') === 0 ? 'brands' : 'start') : '';
    function top(href, label, key) { return '<a href="' + ROOT + href + '"' + (sec === key ? ' aria-current="true"' : '') + '>' + label + '</a>'; }
    return '<a class="skip-link" href="#main">Skip to content</a>' +
      '<header class="doc-header">' +
        '<button class="doc-menu-btn" type="button" aria-controls="doc-sidebar" aria-expanded="false" aria-label="Open navigation">' + ICONS.menu + '</button>' +
        '<a class="doc-brand" href="' + ROOT + 'index.html" aria-label="DRS Design System home">' +
          '<span class="doc-brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5" fill="#f2bc18"/><rect x="13" y="4" width="7" height="7" rx="3.5" fill="#fff"/><rect x="4" y="13" width="7" height="7" rx="3.5" fill="#fff"/><rect x="13" y="13" width="7" height="7" rx="1.5" fill="#0077d9"/></svg></span>' +
          '<span class="doc-brand-text"><strong>DRS Design System</strong><span data-brand-name>Multi-brand foundation</span></span>' +
        '</a>' +
        '<nav class="doc-topnav" aria-label="Sections">' +
          top('index.html', 'Get started', 'start') + top('foundations/colour.html', 'Foundations', 'foundations') + top('components/button.html', 'Components', 'components') + top('patterns/index.html', 'Patterns', 'patterns') + top('brands/index.html', 'Brands', 'brands') +
        '</nav>' +
        '<div class="doc-header-end">' +
          '<div class="doc-search" role="search">' + ICONS.search.replace('<svg', '<svg class="doc-search-icon"') +
            '<input id="doc-search-input" type="search" placeholder="Search" autocomplete="off" aria-label="Search the documentation" aria-controls="doc-search-results" aria-expanded="false" role="combobox" aria-autocomplete="list">' +
            '<kbd aria-hidden="true">/</kbd>' +
            '<ul class="doc-search-results" id="doc-search-results" role="listbox" hidden></ul>' +
          '</div>' +
          renderBrandSwitch() +
          '<span class="doc-version">' + VERSION + '</span>' +
        '</div>' +
      '</header>';
  }

  // ---------- Brand switcher ----------
  function brandById(id) { return BRANDS.brands.filter(function (b) { return b.id === id; })[0]; }
  function swatch(b) {
    var bg = b.button && b.button.bg && !/^#?f{3,6}$/i.test(String(b.button.bg).replace('#', '')) ? b.button.bg : (b.primary || '#888');
    return '<span class="doc-brand-swatch" aria-hidden="true" style="--sw-1:' + esc(bg) + ';--sw-2:' + esc(b.primary || bg) + ';--sw-r:' + esc((b.button && b.button.radius) || '4px') + '"></span>';
  }
  function renderBrandSwitch() {
    if (!BRANDS.brands.length) return '';
    var cur = brandById(document.documentElement.getAttribute('data-brand')) || BRANDS.brands[0];
    return '<div class="doc-brand-switch">' +
      '<button type="button" class="doc-brand-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="doc-brand-list" aria-label="Brand: ' + esc(cur.name) + '. Change brand">' +
        swatch(cur) + '<span class="doc-brand-btn-label">' + esc(cur.name) + '</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
      '</button>' +
      '<ul class="doc-brand-list" id="doc-brand-list" role="listbox" aria-label="Brand" tabindex="-1" hidden>' +
        BRANDS.brands.map(function (b) {
          return '<li role="option" id="brand-opt-' + b.id + '" data-brand-id="' + b.id + '" aria-selected="' + (b.id === cur.id) + '">' + swatch(b) +
            '<span><strong>' + esc(b.name) + '</strong><small>' + esc(b.description || '') + '</small></span></li>';
        }).join('') +
        '<li class="doc-brand-list-foot" role="presentation"><a href="' + ROOT + 'brands/theme-builder.html">Create a brand in the Theme builder</a></li>' +
      '</ul></div>';
  }
  var brandLoads = {};
  function loadBrand(id) {
    if (brandLoads[id]) return brandLoads[id];
    var b = brandById(id);
    if (!b) return Promise.reject(new Error('Unknown brand ' + id));
    if (b.google && !document.querySelector('link[data-brand-font="' + id + '"]')) {
      var f = document.createElement('link'); f.rel = 'stylesheet'; f.href = b.google; f.setAttribute('data-brand-font', id); document.head.appendChild(f);
    }
    var existing = document.querySelector('link[data-brand-css="' + id + '"]');
    brandLoads[id] = existing && existing.sheet ? Promise.resolve() : new Promise(function (res, rej) {
      var l = existing || document.createElement('link');
      l.addEventListener('load', function () { res(); });
      l.addEventListener('error', function () { delete brandLoads[id]; rej(new Error('Could not load brand ' + id)); });
      if (!existing) { l.rel = 'stylesheet'; l.href = ROOT + 'css/brands/' + id + '.css'; l.setAttribute('data-brand-css', id); document.head.appendChild(l); }
    });
    return brandLoads[id];
  }
  function setBrand(id) {
    return loadBrand(id).then(function () {
      document.documentElement.setAttribute('data-brand', id);
      try { localStorage.setItem('drs-brand', id); } catch (e) {}
      var b = brandById(id);
      var btn = document.querySelector('.doc-brand-btn');
      if (btn) {
        btn.setAttribute('aria-label', 'Brand: ' + b.name + '. Change brand');
        btn.querySelector('.doc-brand-btn-label').textContent = b.name;
        btn.querySelector('.doc-brand-swatch').outerHTML = swatch(b);
      }
      document.querySelectorAll('#doc-brand-list [role="option"]').forEach(function (o) { o.setAttribute('aria-selected', String(o.getAttribute('data-brand-id') === id)); });
      document.querySelectorAll('[data-brand-name]').forEach(function (n) { n.textContent = b.name; });
      if (window.DRS && DRS.toast) DRS.toast('Brand: ' + b.name);
      document.dispatchEvent(new CustomEvent('drs:brand', { detail: { id: id, brand: b } }));
    });
  }

  function renderPager() {
    var idx = PAGES.findIndex(function (p) { return p.href === CURRENT; });
    if (idx < 0) return '';
    var prev = PAGES[idx - 1], next = PAGES[idx + 1];
    return '<nav class="doc-pager" aria-label="Previous and next">' +
      (prev ? '<a href="' + ROOT + prev.href + '"><span>Previous</span><strong>' + esc(prev.label) + '</strong></a>' : '') +
      (next ? '<a class="is-next" href="' + ROOT + next.href + '"><span>Next</span><strong>' + esc(next.label) + '</strong></a>' : '') +
      '</nav>' +
      '<footer class="doc-footer"><span>DRS Design System · Multi-brand foundation · ' + VERSION + '</span><a href="' + FIGMA + '" target="_blank" rel="noopener">Figma source (opens in a new tab)</a></footer>';
  }

  // ---------- Mount chrome ----------
  var main = document.querySelector('main');
  document.body.insertAdjacentHTML('afterbegin', renderHeader());
  var layout = document.createElement('div');
  layout.className = 'doc-layout';
  layout.innerHTML = renderSidebar();
  main.parentNode.insertBefore(layout, main);
  layout.appendChild(main);
  main.id = 'main';
  main.classList.add('doc-main');
  var content = main.querySelector('.doc-content') || main;
  content.insertAdjacentHTML('beforeend', renderPager());

  // Page meta (Figma link etc.)
  var figmaNode = main.getAttribute('data-figma');
  var figmaFile = main.getAttribute('data-figma-file');
  var figmaBase = figmaFile ? 'https://www.figma.com/design/' + figmaFile : FIGMA;
  var meta = main.querySelector('.doc-meta');
  if (meta && figmaNode) {
    meta.insertAdjacentHTML('afterbegin', '<a href="' + figmaBase + '?node-id=' + figmaNode + '" target="_blank" rel="noopener">' + ICONS.figma + 'View in Figma</a>');
  }

  // ---------- Mobile nav ----------
  var menuBtn = document.querySelector('.doc-menu-btn');
  function setNav(open) {
    document.body.classList.toggle('is-nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menuBtn.innerHTML = open ? ICONS.close : ICONS.menu;
  }
  menuBtn.addEventListener('click', function () { setNav(!document.body.classList.contains('is-nav-open')); });
  document.addEventListener('click', function (e) { if (e.target.closest('[data-close-nav]')) setNav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('is-nav-open')) { setNav(false); menuBtn.focus(); } });
  var curLink = document.querySelector('.doc-sidebar [aria-current="page"]');
  if (curLink) curLink.scrollIntoView({ block: 'center' });

  // ---------- Search ----------
  var input = document.getElementById('doc-search-input');
  var list = document.getElementById('doc-search-results');
  var active = -1;
  function results(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    return PAGES.map(function (p) {
      var l = p.label.toLowerCase(), d = (p.desc || '').toLowerCase();
      var score = l.indexOf(q) === 0 ? 3 : l.indexOf(q) > -1 ? 2 : d.indexOf(q) > -1 ? 1 : 0;
      return { p: p, score: score };
    }).filter(function (r) { return r.score; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 8).map(function (r) { return r.p; });
  }
  function draw() {
    var r = results(input.value);
    active = -1;
    if (!input.value.trim()) { list.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
    list.innerHTML = r.length ? r.map(function (p, i) {
      return '<li role="option" id="sr-' + i + '"><a href="' + ROOT + p.href + '"><strong>' + esc(p.label) + '</strong><span>' + esc(p.section) + ' — ' + esc(p.desc || '') + '</span></a></li>';
    }).join('') : '<li class="doc-search-empty">No results for “' + esc(input.value) + '”</li>';
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }
  function move(d) {
    var links = list.querySelectorAll('a');
    if (!links.length) return;
    active = (active + d + links.length) % links.length;
    links.forEach(function (a, i) { a.setAttribute('aria-selected', String(i === active)); });
    input.setAttribute('aria-activedescendant', 'sr-' + active);
    links[active].scrollIntoView({ block: 'nearest' });
  }
  input.addEventListener('input', draw);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { var links = list.querySelectorAll('a'); var t = links[active] || links[0]; if (t) location.href = t.href; }
    else if (e.key === 'Escape') { input.value = ''; draw(); input.blur(); }
  });
  input.addEventListener('blur', function () { setTimeout(function () { list.hidden = true; input.setAttribute('aria-expanded', 'false'); }, 150); });
  input.addEventListener('focus', draw);
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === '/' && !/input|textarea|select/.test(tag) && !e.target.isContentEditable) { e.preventDefault(); input.focus(); }
  });

  // ---------- Toast ----------
  var toastEl = document.createElement('div');
  toastEl.className = 'doc-toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastEl);
  var toastTimer;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 1600); }
  window.DRS = { toast: toast, esc: esc, ROOT: ROOT, brands: BRANDS, brandById: brandById, loadBrand: loadBrand, setBrand: setBrand, currentBrand: function () { return document.documentElement.getAttribute('data-brand'); } };

  // Header brand dropdown (listbox)
  (function () {
    var wrap = document.querySelector('.doc-brand-switch');
    if (!wrap) return;
    var btn = wrap.querySelector('.doc-brand-btn'), lb = wrap.querySelector('.doc-brand-list');
    var opts = function () { return [].slice.call(lb.querySelectorAll('[role="option"]')); };
    var idx = 0;
    function focusOpt(i) { var o = opts(); idx = (i + o.length) % o.length; o.forEach(function (x, j) { x.classList.toggle('is-active', j === idx); }); lb.setAttribute('aria-activedescendant', o[idx].id); o[idx].scrollIntoView({ block: 'nearest' }); }
    function open() { lb.hidden = false; btn.setAttribute('aria-expanded', 'true'); var o = opts(); focusOpt(Math.max(0, o.findIndex(function (x) { return x.getAttribute('aria-selected') === 'true'; }))); lb.focus(); }
    function close(refocus) { lb.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); }
    function choose(o) { close(true); setBrand(o.getAttribute('data-brand-id')); }
    btn.addEventListener('click', function () { lb.hidden ? open() : close(); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
    lb.addEventListener('click', function (e) { var o = e.target.closest('[role="option"]'); if (o) choose(o); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); focusOpt(idx + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusOpt(idx - 1); }
      else if (e.key === 'Home') { e.preventDefault(); focusOpt(0); }
      else if (e.key === 'End') { e.preventDefault(); focusOpt(opts().length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(opts()[idx]); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') close();
    });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
    var cur = brandById(document.documentElement.getAttribute('data-brand'));
    if (cur) document.querySelectorAll('[data-brand-name]').forEach(function (n) { n.textContent = cur.name; });
  })();

  function copyText(text, btn, label) {
    var done = function () {
      toast((label || 'Copied') + ' to clipboard');
      if (btn) { var html = btn.innerHTML; btn.classList.add('is-done'); btn.innerHTML = ICONS.check + 'Copied'; setTimeout(function () { btn.classList.remove('is-done'); btn.innerHTML = html; }, 1400); }
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    else { fallback(text); done(); }
  }
  function fallback(text) { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); }
  window.DRS.copy = copyText;

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (b) { e.preventDefault(); copyText(b.getAttribute('data-copy'), b.tagName === 'BUTTON' && b.classList.contains('doc-btn') ? b : null, b.getAttribute('data-copy-label')); }
  });

  // ---------- Code: highlight + copy ----------
  function highlight(code) {
    var s = esc(code);
    s = s.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-com">$1</span>');
    s = s.replace(/(&lt;\/?)([a-z0-9-]+)/gi, '$1<span class="tok-tag">$2</span>');
    s = s.replace(/\s([a-z-:@]+)=(&quot;[^&]*?&quot;)/gi, ' <span class="tok-attr">$1</span>=<span class="tok-str">$2</span>');
    s = s.replace(/(--(?:aec|drp)-[a-z0-9-]+)/g, '<span class="tok-prop">$1</span>');
    return s;
  }
  function addCopy(pre) {
    if (pre.querySelector('.doc-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'doc-btn'; btn.innerHTML = ICONS.copy + 'Copy';
    btn.setAttribute('aria-label', 'Copy code');
    btn.addEventListener('click', function () { copyText(pre.querySelector('code').textContent, btn, 'Code copied'); });
    pre.appendChild(btn);
  }
  document.querySelectorAll('pre > code').forEach(function (c) {
    if (c.hasAttribute('data-raw')) return;
    if (!c.querySelector('span')) c.innerHTML = highlight(c.textContent);
    addCopy(c.parentNode);
  });

  function tidy(html) {
    var lines = html.replace(/^\n+|\s+$/g, '').split('\n');
    var min = Math.min.apply(null, lines.filter(function (l) { return l.trim(); }).map(function (l) { return l.match(/^\s*/)[0].length; }));
    return lines.map(function (l) { return l.slice(min); }).join('\n')
      .replace(/ data-demo[a-z-]*(="[^"]*")?/g, '')
      .replace(/=""/g, '');
  }

  // Examples: <div class="doc-example"><div class="doc-example-preview">…</div></div>
  var exN = 0;
  document.querySelectorAll('.doc-example').forEach(function (ex) {
    var preview = ex.querySelector('.doc-example-preview');
    if (!preview || ex.hasAttribute('data-no-code')) return;
    var code = tidy(preview.innerHTML);
    var id = 'ex-code-' + (++exN);
    var bar = document.createElement('div');
    bar.className = 'doc-example-bar';
    var brandPick = BRANDS.brands.length > 1 && !ex.hasAttribute('data-no-brand') ? '<label class="doc-ex-brand"><span class="aec-visually-hidden">Preview brand</span><select data-act="brand" aria-label="Preview this example in a brand"><option value="">Page brand</option>' +
      BRANDS.brands.map(function (b) { return '<option value="' + b.id + '">' + esc(b.name) + '</option>'; }).join('') + '</select></label>' : '';
    bar.innerHTML = '<span>' + esc(ex.getAttribute('data-label') || 'HTML') + '</span><span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' + brandPick +
      '<button type="button" class="doc-btn" data-act="copy">' + ICONS.copy + 'Copy HTML</button>' +
      '<button type="button" class="doc-btn" data-act="toggle" aria-expanded="false" aria-controls="' + id + '">' + ICONS.code + 'Show code</button></span>';
    var pre = document.createElement('pre');
    pre.id = id; pre.hidden = true;
    pre.innerHTML = '<code>' + highlight(code) + '</code>';
    ex.appendChild(bar); ex.appendChild(pre);
    addCopy(pre);
    bar.addEventListener('change', function (e) {
      if (!e.target.matches('[data-act="brand"]')) return;
      var id = e.target.value;
      if (!id) { preview.removeAttribute('data-brand'); return; }
      loadBrand(id).then(function () { preview.setAttribute('data-brand', id); });
    });
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.act === 'copy') copyText(code, b, 'HTML copied');
      else { var open = pre.hidden; pre.hidden = !open; b.setAttribute('aria-expanded', String(open)); b.innerHTML = ICONS.code + (open ? 'Hide code' : 'Show code'); }
    });
  });

  // Heading anchors
  content.querySelectorAll('.doc-section > h2[id], .doc-section > h3[id]').forEach(function (h) {
    if (h.querySelector('.doc-anchor')) return;
    var a = document.createElement('a'); a.className = 'doc-anchor'; a.href = '#' + h.id;
    while (h.firstChild && !(h.firstChild.nodeType === 1 && h.firstChild.matches('.doc-btn, .doc-h-actions'))) a.appendChild(h.firstChild);
    h.insertBefore(a, h.firstChild);
  });

  // Component cards (home page) — live, inert thumbnails that follow the brand
  var THUMBS = {"button": "<button class=\"aec-btn aec-btn--primary aec-btn--sm\" type=\"button\">Continue</button><button class=\"aec-btn aec-btn--primary aec-btn--outline aec-btn--sm\" type=\"button\">Save</button>", "icon-button": "<button class=\"aec-icon-btn aec-icon-btn--primary aec-icon-btn--filled\" type=\"button\" aria-label=\"Add\"><span class=\"aec-icon\" data-icon=\"add\" aria-hidden=\"true\"></span></button><button class=\"aec-icon-btn aec-icon-btn--primary aec-icon-btn--outline\" type=\"button\" aria-label=\"Edit\"><span class=\"aec-icon\" data-icon=\"edit\" aria-hidden=\"true\"></span></button><button class=\"aec-icon-btn aec-icon-btn--neutral aec-icon-btn--filled aec-icon-btn--circle\" type=\"button\" aria-label=\"Search\"><span class=\"aec-icon\" data-icon=\"search\" aria-hidden=\"true\"></span></button>", "checkbox": "<input type=\"checkbox\" class=\"aec-checkbox\" checked aria-label=\"Checked\"><input type=\"checkbox\" class=\"aec-checkbox\" aria-label=\"Unchecked\"><input type=\"checkbox\" class=\"aec-checkbox\" aria-label=\"Mixed\" data-indeterminate>", "form-control": "<label class=\"aec-control\"><input type=\"checkbox\" class=\"aec-checkbox\" checked><span class=\"aec-form-label\"><span class=\"aec-form-label__text\">GAP protection</span><span class=\"aec-form-label__desc\">$12/mo</span></span></label>", "menu": "<div class=\"aec-menu\" style=\"min-width:150px;padding:4px 0\"><div class=\"aec-menu__item\" style=\"min-height:28px;padding:4px 12px\">Finance</div><div class=\"aec-menu__item\" aria-selected=\"true\" style=\"min-height:28px;padding:4px 12px\">Lease</div><div class=\"aec-menu__item\" style=\"min-height:28px;padding:4px 12px\">Cash</div></div>", "radio": "<input type=\"radio\" class=\"aec-radio\" name=\"thumb-r\" checked aria-label=\"Selected\"><input type=\"radio\" class=\"aec-radio\" name=\"thumb-r\" aria-label=\"Unselected\">", "slider": "<input class=\"aec-slider\" type=\"range\" min=\"0\" max=\"100\" value=\"60\" style=\"--_pct:60%;width:150px\" aria-label=\"Value\">", "switch": "<input type=\"checkbox\" role=\"switch\" class=\"aec-switch\" checked aria-label=\"On\"><input type=\"checkbox\" role=\"switch\" class=\"aec-switch\" aria-label=\"Off\">", "text-field": "<div class=\"aec-field\" style=\"width:170px\"><span class=\"aec-field__label\">ZIP code</span><div class=\"aec-field__box\"><input class=\"aec-field__input\" value=\"94588\" aria-label=\"ZIP code\"></div></div>", "toggle-button": "<button class=\"aec-toggle aec-toggle--md\" type=\"button\" aria-pressed=\"true\">Finance</button><button class=\"aec-toggle aec-toggle--md\" type=\"button\" aria-pressed=\"false\">Lease</button>", "avatar": "<span class=\"aec-avatar aec-avatar--primary\">JD</span><span class=\"aec-avatar aec-avatar--lg aec-avatar--inverse\">RC</span><span class=\"aec-avatar aec-avatar--outline\"><span class=\"aec-icon aec-icon--16\" data-icon=\"account-round\" aria-hidden=\"true\"></span></span>", "badge": "<span class=\"aec-badge-anchor\"><span class=\"aec-icon aec-icon--32\" data-icon=\"bell-simple\" aria-hidden=\"true\"></span><span class=\"aec-badge\">3</span></span><span class=\"aec-badge aec-badge--md\">12</span><span class=\"aec-badge aec-badge--dot\"></span>", "chip": "<span class=\"aec-chip aec-chip--info aec-chip--sm\">New</span><span class=\"aec-chip aec-chip--info aec-chip--success aec-chip--sm\">Approved</span><button class=\"aec-chip aec-chip--selectable aec-chip--sm\" type=\"button\" aria-pressed=\"true\">SUV</button>", "tooltip": "<span class=\"aec-tooltip is-static aec-tooltip--sm\" role=\"tooltip\" data-arrow=\"none\" style=\"max-width:180px\">The yearly cost of borrowing</span>", "table": "<div class=\"aec-table-wrap\" style=\"width:180px\"><table class=\"aec-table aec-table--sm\" style=\"font-size:11px\"><thead><tr><th>Plan</th><th class=\"aec-num\">Price</th></tr></thead><tbody><tr><td>GAP</td><td class=\"aec-num\">$12</td></tr></tbody></table></div>", "alert": "<div class=\"aec-alert aec-alert--success aec-alert--flat\" style=\"max-width:200px;padding:10px\"><div class=\"aec-alert__body\"><span class=\"aec-icon aec-icon--16\" data-icon=\"check-circle\" aria-hidden=\"true\"></span><div class=\"aec-alert__content\"><p class=\"aec-alert__title\" style=\"font-size:12px;line-height:16px\">Deposit received</p></div></div></div>", "banner": "<div class=\"aec-banner\" style=\"max-width:200px;padding:10px\"><div class=\"aec-banner__body\"><span class=\"aec-icon aec-icon--16\" data-icon=\"info\" aria-hidden=\"true\"></span><div class=\"aec-banner__content\"><p class=\"aec-banner__title\" style=\"font-size:12px;line-height:16px\">Price drop</p></div></div></div>", "progress": "<div style=\"display:flex;flex-direction:column;gap:12px;align-items:center;width:150px\"><div class=\"aec-progress\" style=\"--aec-progress:62%\"></div><span class=\"aec-spinner\"></span></div>", "snackbar": "<div class=\"aec-snackbar is-static\" style=\"min-height:40px;max-width:200px;padding:8px 8px 8px 12px;font-size:12px\"><span class=\"aec-snackbar__msg\">Saved to garage</span><span class=\"aec-snackbar__action\">Undo</span></div>", "modal": "<div class=\"aec-modal is-static\" style=\"width:170px;box-shadow:var(--aec-box-shadow-l)\"><div class=\"aec-modal__header\" style=\"min-height:0;padding:8px 10px\"><p class=\"aec-modal__title\" style=\"font-size:12px;line-height:16px\">Remove trade-in?</p></div><div class=\"aec-modal__footer\" style=\"padding:8px 10px\"><span class=\"aec-btn aec-btn--primary aec-btn--sm\" style=\"min-height:24px;height:24px;font-size:11px;padding:0 10px\">Remove</span></div></div>", "accordion": "<div class=\"aec-accordion\" style=\"width:180px\"><div class=\"aec-accordion__item\"><div class=\"aec-accordion__trigger\" aria-expanded=\"true\" style=\"min-height:32px;padding:4px 8px;font-size:12px\"><span class=\"aec-accordion__title\">Trade-in</span></div></div><div class=\"aec-accordion__item\"><div class=\"aec-accordion__trigger\" style=\"min-height:32px;padding:4px 8px;font-size:12px\"><span class=\"aec-accordion__title\">Financing</span></div></div></div>", "breadcrumbs": "<nav class=\"aec-breadcrumbs\" aria-label=\"Example\"><ol><li><span style=\"color:var(--aec-breadcrumb-color-text-default)\">Home</span></li><li><span style=\"color:var(--aec-breadcrumb-color-text-default)\">Inventory</span></li><li><span aria-current=\"page\">Checkout</span></li></ol></nav>", "header": "<div class=\"aec-header\" style=\"width:190px;height:40px;padding:4px 10px\"><span style=\"width:44px;height:12px;border-radius:2px;background:var(--aec-color-text-default)\"></span><span class=\"aec-avatar aec-avatar--sm aec-avatar--inverse\">JD</span></div>", "link": "<span class=\"aec-link\">View payment summary</span><span class=\"aec-link aec-link--neutral aec-link--sm\">Contact dealer</span>", "pagination": "<div class=\"aec-pagination aec-pagination--sm\"><ul class=\"aec-pagination__list\"><li><span class=\"aec-pagination__item\">1</span></li><li><span class=\"aec-pagination__item\" aria-current=\"page\">2</span></li><li><span class=\"aec-pagination__item\">3</span></li></ul></div>", "tabs": "<div class=\"aec-tabs aec-tabs--md\"><div class=\"aec-tabs__list\" style=\"gap:16px\"><span class=\"aec-tab\" aria-selected=\"true\" style=\"height:32px\">Finance</span><span class=\"aec-tab\" style=\"height:32px\">Lease</span><span class=\"aec-tab\" style=\"height:32px\">Cash</span></div></div>"};
  document.querySelectorAll('[data-component-cards]').forEach(function (el) {
    var comps = PAGES.filter(function (p) { return p.href.indexOf('components/') === 0; });
    el.innerHTML = comps.map(function (p) {
      var key = p.href.replace('components/', '').replace('.html', '');
      var art = THUMBS[key] ? '<div class="doc-card-art doc-thumb" inert aria-hidden="true">' + THUMBS[key] + '</div>' : '';
      return '<article class="doc-card has-thumb">' + art + '<h3><a href="' + ROOT + p.href + '">' + esc(p.label) + '</a>' + (p.status === 'wip' ? ' <span class="doc-nav-badge">Beta</span>' : '') + '</h3><p>' + esc(p.desc) + '</p></article>';
    }).join('');
    el.querySelectorAll('[data-indeterminate]').forEach(function (i) { i.indeterminate = true; });
  });

  document.querySelectorAll('[data-pattern-cards]').forEach(function (el) {
    var list = PAGES.filter(function (p) { return p.href.indexOf('patterns/') === 0 && p.href !== 'patterns/index.html'; });
    el.innerHTML = list.map(function (p) {
      return '<a class="doc-card" href="' + ROOT + p.href + '"><h3>' + esc(p.label) + '</h3><p>' + esc(p.desc) + '</p><p class="doc-small" style="margin-top:4px">' + esc(p.section.replace('Patterns · ', '')) + '</p></a>';
    }).join('');
  });

  // Title
  var cur = PAGES.filter(function (p) { return p.href === CURRENT; })[0];
  if (cur && !/·/.test(document.title)) document.title = cur.label + ' · DRS Design System';
})();

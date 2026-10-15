/* DRS Design System — behaviour for interactive components.
 * Framework-free. Include once per page; it binds to markup on DOMContentLoaded
 * and exposes window.AEC.init(root) for content added later.
 */
(function () {
  'use strict';

  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function once(el, key) { if (el['_aec' + key]) return false; el['_aec' + key] = true; return true; }

  // ---------- Toggle button: <button class="aec-toggle" aria-pressed="false"> ----------
  function toggles(root) {
    $all('.aec-toggle[aria-pressed]', root).forEach(function (b) {
      if (!once(b, 'toggle')) return;
      function paint() {
        var on = b.getAttribute('aria-pressed') === 'true';
        var label = b.querySelector('.aec-toggle__label'), icon = b.querySelector('.aec-icon');
        if (label && b.dataset.on) label.textContent = on ? b.dataset.on : b.dataset.off;
        if (icon && b.dataset.iconOn) icon.style.setProperty('--aec-icon-src', 'url(/assets/icons/' + (on ? b.dataset.iconOn : b.dataset.iconOff) + '.svg)');
        var card = b.hasAttribute('data-select-card') && b.closest('.aec-card');
        if (card) card.classList.toggle('is-selected', on);
      }
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); paint(); });
      paint();
    });
  }

  // ---------- Single-select groups (toggle group, segmented): role="radiogroup" > role="radio" ----------
  function radioGroups(root) {
    $all('[role="radiogroup"].aec-toggle-group, [role="radiogroup"].aec-option-grid, [role="radiogroup"].aec-tile-group, [data-aec-radiogroup]', root).forEach(function (g) {
      if (!once(g, 'rg')) return;
      var items = function () { return $all('[role="radio"]:not(:disabled)', g); };
      function select(it, focus) {
        $all('[role="radio"]', g).forEach(function (r) {
          var on = r === it; r.setAttribute('aria-checked', String(on)); r.tabIndex = on ? 0 : -1;
          var label = r.querySelector('.aec-toggle__label'); if (label && r.dataset.on) label.textContent = on ? r.dataset.on : r.dataset.off;
          if (r.dataset.offClass) r.classList.toggle(r.dataset.offClass, !on);
          var card = g.hasAttribute('data-select-card') && r.closest('.aec-card'); if (card) card.classList.toggle('is-selected', on);
        });
        if (focus) it.focus();
        g.dispatchEvent(new CustomEvent('aec:change', { detail: { value: it.value || it.textContent.trim() }, bubbles: true }));
      }
      var cur = $all('[role="radio"][aria-checked="true"]', g)[0] || items()[0];
      $all('[role="radio"]', g).forEach(function (r) { r.tabIndex = r === cur ? 0 : -1; });
      g.addEventListener('click', function (e) { var it = e.target.closest('[role="radio"]'); if (it && !it.disabled) select(it); });
      g.addEventListener('keydown', function (e) {
        var list = items(), i = list.indexOf(document.activeElement);
        if (i < 0) return;
        var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
        if (e.key === 'Home') { e.preventDefault(); select(list[0], true); }
        else if (e.key === 'End') { e.preventDefault(); select(list[list.length - 1], true); }
        else if (d) { e.preventDefault(); select(list[(i + d + list.length) % list.length], true); }
      });
    });
  }

  // ---------- Slider: keep the filled track (--_pct) and value labels in sync ----------
  function pct(input) { var min = +input.min || 0, max = input.max === '' ? 100 : +input.max; return ((+input.value - min) / (max - min)) * 100; }
  function fmt(input) { var f = input.getAttribute('data-format'); var v = (+input.value).toLocaleString('en-US'); return f ? f.replace('{v}', v) : v; }
  function sliders(root) {
    $all('.aec-slider', root).forEach(function (s) {
      if (s.closest('.aec-range') || !once(s, 'slider')) return;
      var out = s.id ? document.querySelector('[data-for="' + s.id + '"]') : null;
      function upd() { s.style.setProperty('--_pct', pct(s) + '%'); s.setAttribute('aria-valuetext', fmt(s)); if (out) out.textContent = fmt(s); }
      s.addEventListener('input', upd); upd();
    });
    $all('.aec-range', root).forEach(function (r) {
      if (!once(r, 'range')) return;
      var ins = $all('.aec-slider', r), lo = ins[0], hi = ins[1];
      var outLo = document.querySelector('[data-for="' + lo.id + '"]'), outHi = document.querySelector('[data-for="' + hi.id + '"]');
      var gap = +(r.getAttribute('data-min-gap') || 0);
      function upd(e) {
        if (+lo.value > +hi.value - gap) { if (e && e.target === lo) lo.value = +hi.value - gap; else hi.value = +lo.value + gap; }
        lo.style.setProperty('--_from', pct(lo) + '%'); lo.style.setProperty('--_pct', pct(hi) + '%');
        lo.setAttribute('aria-valuetext', fmt(lo)); hi.setAttribute('aria-valuetext', fmt(hi));
        if (outLo) outLo.textContent = fmt(lo); if (outHi) outHi.textContent = fmt(hi);
      }
      lo.addEventListener('input', upd); hi.addEventListener('input', upd); upd();
    });
  }

  // ---------- Menu: trigger[aria-haspopup] + .aec-menu[role=menu|listbox] ----------
  var openMenu = null;
  function closeMenu(focusTrigger) {
    if (!openMenu) return;
    openMenu.menu.hidden = true; openMenu.trigger.setAttribute('aria-expanded', 'false');
    if (focusTrigger) openMenu.trigger.focus();
    openMenu = null;
  }
  function menus(root) {
    $all('[aria-haspopup][aria-controls]', root).forEach(function (t) {
      var menu = document.getElementById(t.getAttribute('aria-controls'));
      if (!menu || !menu.classList.contains('aec-menu') || !once(t, 'menu')) return;
      var items = function () { return $all('.aec-menu__item:not([aria-disabled="true"]):not(:disabled)', menu).filter(function (i) { return !i.hidden; }); };
      function open(focusLast) {
        if (openMenu && openMenu.menu !== menu) closeMenu();
        menu.hidden = false; t.setAttribute('aria-expanded', 'true'); openMenu = { menu: menu, trigger: t };
        var search = menu.querySelector('.aec-menu__search input');
        var list = items(); var sel = menu.querySelector('[aria-checked="true"],[aria-selected="true"]');
        (search || (focusLast ? list[list.length - 1] : (sel || list[0])) || menu).focus();
      }
      t.addEventListener('click', function () { if (menu.hidden) open(); else closeMenu(); });
      t.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(e.key === 'ArrowUp'); } });
      $all('.aec-menu__item', menu).forEach(function (i) { i.tabIndex = -1; });
      menu.addEventListener('keydown', function (e) {
        var list = items(), i = list.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); (list[i + 1] || list[0]).focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); (list[i - 1] || list[list.length - 1]).focus(); }
        else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
        else if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
        else if (e.key === 'Tab') { closeMenu(); }
      });
      menu.addEventListener('click', function (e) {
        var it = e.target.closest('.aec-menu__item');
        if (!it || it.getAttribute('aria-disabled') === 'true' || it.disabled) return;
        var role = it.getAttribute('role');
        if (role === 'menuitemradio' || role === 'option') {
          $all('[role="' + role + '"]', menu).forEach(function (o) { o.setAttribute(role === 'option' ? 'aria-selected' : 'aria-checked', String(o === it)); });
          var label = t.querySelector('[data-menu-value]'); if (label) label.textContent = (it.querySelector('.aec-menu__label') || it).textContent.trim();
        }
        closeMenu(true);
      });
      var search = menu.querySelector('.aec-menu__search input');
      if (search) {
        search.addEventListener('input', function () {
          var q = search.value.trim().toLowerCase();
          $all('.aec-menu__item', menu).forEach(function (i) { i.hidden = q && i.textContent.toLowerCase().indexOf(q) < 0; });
        });
        search.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); var l = items(); if (l[0]) l[0].focus(); } });
      }
    });
  }
  document.addEventListener('click', function (e) { if (openMenu && !openMenu.menu.contains(e.target) && !openMenu.trigger.contains(e.target)) closeMenu(); });

  // ---------- Tabs: .aec-tabs > [role=tablist] > [role=tab][aria-controls] ----------
  function tabs(root) {
    $all('[role="tablist"]', root).forEach(function (list) {
      if (!once(list, 'tabs')) return;
      var vertical = list.getAttribute('aria-orientation') === 'vertical';
      var all = function () { return $all('[role="tab"]', list).filter(function (t) { return !t.disabled && t.getAttribute('aria-disabled') !== 'true'; }); };
      function select(t, focus) {
        $all('[role="tab"]', list).forEach(function (x) {
          var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
          var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on;
        });
        if (focus) t.focus();
      }
      var cur = list.querySelector('[role="tab"][aria-selected="true"]') || all()[0];
      if (cur) select(cur);
      list.addEventListener('click', function (e) { var t = e.target.closest('[role="tab"]'); if (t && !t.disabled) select(t); });
      list.addEventListener('keydown', function (e) {
        var l = all(), i = l.indexOf(document.activeElement); if (i < 0) return;
        var next = vertical ? 'ArrowDown' : 'ArrowRight', prev = vertical ? 'ArrowUp' : 'ArrowLeft';
        if (e.key === next) { e.preventDefault(); select(l[(i + 1) % l.length], true); }
        else if (e.key === prev) { e.preventDefault(); select(l[(i - 1 + l.length) % l.length], true); }
        else if (e.key === 'Home') { e.preventDefault(); select(l[0], true); }
        else if (e.key === 'End') { e.preventDefault(); select(l[l.length - 1], true); }
      });
    });
  }

  // ---------- Accordion: .aec-accordion__trigger[aria-expanded][aria-controls] ----------
  function accordions(root) {
    $all('.aec-accordion__trigger[aria-controls]', root).forEach(function (b) {
      if (!once(b, 'acc')) return;
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      if (panel) panel.hidden = b.getAttribute('aria-expanded') !== 'true';
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        var group = b.closest('.aec-accordion[data-single]');
        if (open && group) $all('.aec-accordion__trigger[aria-expanded="true"]', group).forEach(function (o) { if (o !== b) { o.setAttribute('aria-expanded', 'false'); var p = document.getElementById(o.getAttribute('aria-controls')); if (p) p.hidden = true; } });
        b.setAttribute('aria-expanded', String(open)); if (panel) panel.hidden = !open;
      });
    });
  }

  // ---------- Modal / sheet: <dialog class="aec-modal" id>; open with [data-aec-open="id"], close with [data-aec-close] ----------
  function modals(root) {
    $all('[data-aec-open]', root).forEach(function (b) {
      if (!once(b, 'open')) return;
      b.addEventListener('click', function () {
        var d = document.getElementById(b.getAttribute('data-aec-open'));
        if (!d) return;
        if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
        document.documentElement.classList.add('aec-scroll-lock');
      });
    });
    $all('dialog.aec-modal', root).forEach(function (d) {
      if (!once(d, 'dlg')) return;
      d.addEventListener('close', function () { document.documentElement.classList.remove('aec-scroll-lock'); });
      d.addEventListener('click', function (e) {
        if (e.target.closest('[data-aec-close]')) { d.close(); return; }
        if (e.target === d && !d.hasAttribute('data-static')) d.close(); // click on backdrop
      });
    });
  }

  // ---------- Dismissable chips / alerts / banners: [data-aec-dismiss] removes its closest [data-aec-dismissable] ----------
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-aec-dismiss]');
    if (!b) return;
    var host = b.closest('[data-aec-dismissable]');
    if (!host) return;
    var next = host.nextElementSibling || host.previousElementSibling;
    host.remove();
    var focusTarget = next && next.querySelector('button, a, input');
    if (focusTarget) focusTarget.focus();
  });

  // ---------- Selectable chips: <button class="aec-chip aec-chip--selectable" aria-pressed> ----------
  function chips(root) {
    $all('.aec-chip--selectable[aria-pressed]', root).forEach(function (c) {
      if (!once(c, 'chip')) return;
      c.addEventListener('click', function () { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); });
    });
  }

  // ---------- Tooltip: [data-aec-tooltip] trigger with aria-describedby → .aec-tooltip ----------
  function tooltips(root) {
    $all('.aec-tooltip-anchor', root).forEach(function (a) {
      if (!once(a, 'tip')) return;
      a.addEventListener('keydown', function (e) { if (e.key === 'Escape') a.classList.add('is-dismissed'); });
      a.addEventListener('mouseleave', function () { a.classList.remove('is-dismissed'); });
      a.addEventListener('focusout', function () { a.classList.remove('is-dismissed'); });
    });
  }

  // ---------- Snackbar: AEC.snackbar({ message, action, onAction, timeout }) ----------
  var snackRegion;
  function snackbar(opts) {
    opts = typeof opts === 'string' ? { message: opts } : (opts || {});
    if (!snackRegion) {
      snackRegion = document.createElement('div');
      snackRegion.className = 'aec-snackbar-region'; snackRegion.setAttribute('role', 'status'); snackRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(snackRegion);
    }
    var el = document.createElement('div');
    el.className = 'aec-snackbar' + (opts.variant ? ' aec-snackbar--' + opts.variant : '');
    el.innerHTML = '<span class="aec-snackbar__msg"></span>';
    el.firstChild.textContent = opts.message || '';
    if (opts.action) {
      var a = document.createElement('button'); a.type = 'button'; a.className = 'aec-snackbar__action'; a.textContent = opts.action;
      a.addEventListener('click', function () { if (opts.onAction) opts.onAction(); hide(); });
      el.appendChild(a);
    }
    var x = document.createElement('button'); x.type = 'button'; x.className = 'aec-snackbar__close'; x.setAttribute('aria-label', 'Dismiss');
    x.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    x.addEventListener('click', hide); el.appendChild(x);
    snackRegion.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('is-visible'); });
    var timer = setTimeout(hide, opts.timeout || 6000);
    el.addEventListener('mouseenter', function () { clearTimeout(timer); });
    el.addEventListener('mouseleave', function () { timer = setTimeout(hide, 3000); });
    function hide() { clearTimeout(timer); el.classList.remove('is-visible'); setTimeout(function () { el.remove(); }, 200); }
    return { hide: hide };
  }
  function snackTriggers(root) {
    $all('[data-aec-snackbar]', root).forEach(function (b) {
      if (!once(b, 'snack')) return;
      b.addEventListener('click', function () { snackbar({ message: b.getAttribute('data-aec-snackbar'), action: b.getAttribute('data-aec-snackbar-action'), variant: b.getAttribute('data-aec-snackbar-variant') }); });
    });
  }

  // ---------- Toast notification (patterns): AEC.toast({ kind, title, message, action, href, timeout }) ----------
  var toastRegion;
  var KIND_ICON = { info: 'info', success: 'check-circle', warning: 'warning', error: 'warning', secondary: 'info' };
  function toast(o) {
    o = o || {};
    var kind = o.kind || 'info';
    if (!toastRegion) {
      toastRegion = document.createElement('div');
      toastRegion.className = 'aec-toast-region'; toastRegion.setAttribute('aria-live', 'polite'); toastRegion.setAttribute('role', 'status');
      document.body.appendChild(toastRegion);
    }
    var el = document.createElement('div');
    el.className = 'aec-notice aec-notice--toast aec-notice--' + kind;
    var icon = document.createElement('span'); icon.className = 'aec-icon aec-notice__icon'; icon.setAttribute('aria-hidden', 'true');
    icon.style.setProperty('--aec-icon-src', 'url(/assets/icons/' + (o.icon || KIND_ICON[kind] || 'info') + '.svg)');
    var body = document.createElement('div'); body.className = 'aec-notice__body';
    if (o.title) { var t = document.createElement('p'); t.className = 'aec-notice__title'; t.textContent = o.title; body.appendChild(t); }
    if (o.message) { var m = document.createElement('p'); m.className = 'aec-notice__text'; m.textContent = o.message; body.appendChild(m); }
    var x = document.createElement('button'); x.type = 'button'; x.className = 'aec-notice__close'; x.setAttribute('aria-label', 'Dismiss');
    x.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    el.appendChild(icon); el.appendChild(body); el.appendChild(x);
    if (o.action) {
      var row = document.createElement('div'); row.className = 'aec-notice__actions';
      var a = document.createElement(o.href ? 'a' : 'button'); a.className = 'aec-link aec-link--neutral'; a.textContent = o.action;
      if (o.href) a.href = o.href; else a.type = 'button';
      if (o.onAction) a.addEventListener('click', o.onAction);
      row.appendChild(a); el.appendChild(row);
    }
    toastRegion.appendChild(el);
    var timer, ms = o.timeout || 8000;
    function hide() { clearTimeout(timer); el.remove(); }
    function arm() { clearTimeout(timer); timer = setTimeout(hide, ms); }
    x.addEventListener('click', hide);
    el.addEventListener('mouseenter', function () { clearTimeout(timer); });
    el.addEventListener('mouseleave', arm);
    el.addEventListener('focusin', function () { clearTimeout(timer); });
    el.addEventListener('focusout', arm);
    arm();
    return { hide: hide };
  }

  // ---------- Signature pad: <canvas data-aec-signature aria-label="…">, clear with [data-aec-clear="canvasId"] ----------
  function signaturePads(root) {
    $all('canvas[data-aec-signature]', root).forEach(function (c) {
      if (!once(c, 'sig')) return;
      var ctx = c.getContext('2d'), drawing = false, last = null;
      function size() { var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1; if (!r.width) return; c._w = Math.round(r.width); c.width = r.width * d; c.height = r.height * d; ctx.scale(d, d); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = getComputedStyle(c).color || '#262626'; }
      function pos(e) { var r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      size();
      c.addEventListener('pointerdown', function (e) { if (c._w !== Math.round(c.getBoundingClientRect().width)) size(); drawing = true; last = pos(e); c.setPointerCapture(e.pointerId); });
      c.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pos(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; c.dataset.signed = 'true'; c.dispatchEvent(new CustomEvent('aec:sign', { bubbles: true })); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { c.addEventListener(t, function () { drawing = false; }); });
    });
    $all('[data-aec-clear]', root).forEach(function (b) {
      if (!once(b, 'clr')) return;
      b.addEventListener('click', function () { var c = document.getElementById(b.getAttribute('data-aec-clear')); if (!c) return; c.getContext('2d').clearRect(0, 0, c.width, c.height); delete c.dataset.signed; c.dispatchEvent(new CustomEvent('aec:sign', { bubbles: true })); });
    });
  }

  // ---------- OTP: <div class="aec-otp"> of single-char inputs — auto-advance, backspace, paste ----------
  function otps(root) {
    $all('.aec-otp', root).forEach(function (g) {
      if (!once(g, 'otp')) return;
      var ins = $all('input', g);
      ins.forEach(function (inp, i) {
        inp.addEventListener('input', function () { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && ins[i + 1]) ins[i + 1].focus(); });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !inp.value && ins[i - 1]) { ins[i - 1].focus(); } else if (e.key === 'ArrowLeft' && ins[i - 1]) ins[i - 1].focus(); else if (e.key === 'ArrowRight' && ins[i + 1]) ins[i + 1].focus(); });
        inp.addEventListener('paste', function (e) { var t = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, ''); if (!t) return; e.preventDefault(); ins.forEach(function (x, j) { x.value = t[j] || ''; }); (ins[Math.min(t.length, ins.length) - 1] || inp).focus(); });
      });
    });
  }

  // ---------- Calendar: <div class="aec-calendar__date" data-aec-calendar data-value="YYYY-MM-DD" data-min="YYYY-MM-DD"> ----------
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parse(v) { if (!v) return null; var p = v.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function calendars(root) {
    $all('[data-aec-calendar]', root).forEach(function (el) {
      if (!once(el, 'cal')) return;
      var sel = parse(el.dataset.value), min = parse(el.dataset.min), today = new Date(); today.setHours(0, 0, 0, 0);
      var view = new Date((sel || today).getFullYear(), (sel || today).getMonth(), 1), focusDay = sel || today;
      var uid = 'cal' + Math.random().toString(36).slice(2, 7);
      el.innerHTML = '<div class="aec-calendar__head"><h3 class="aec-calendar__month" id="' + uid + '" aria-live="polite"></h3>' +
        '<button class="aec-icon-btn aec-icon-btn--neutral aec-icon-btn--sm" type="button" data-cal="-1" aria-label="Previous month"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m15 6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '<button class="aec-icon-btn aec-icon-btn--neutral aec-icon-btn--sm" type="button" data-cal="1" aria-label="Next month"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>' +
        '<table class="aec-calendar__grid" role="grid" aria-labelledby="' + uid + '"><thead><tr>' + DOW.map(function (d) { return '<th scope="col" abbr="' + d + '">' + d + '</th>'; }).join('') + '</tr></thead><tbody></tbody></table>';
      var title = el.querySelector('.aec-calendar__month'), body = el.querySelector('tbody');
      function render(focus) {
        title.textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
        var first = (view.getDay() + 6) % 7, days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), html = '', d = 1;
        for (var r = 0; r < 6 && d <= days; r++) {
          html += '<tr>';
          for (var c = 0; c < 7; c++) {
            if ((r === 0 && c < first) || d > days) { html += '<td></td>'; continue; }
            var date = new Date(view.getFullYear(), view.getMonth(), d), key = iso(date);
            var dis = min && date < min, on = sel && key === iso(sel), isFocus = key === iso(focusDay);
            html += '<td><button type="button" class="aec-calendar__day" data-date="' + key + '" tabindex="' + (isFocus ? 0 : -1) + '"' + (on ? ' aria-selected="true"' : ' aria-selected="false"') + (key === iso(today) ? ' aria-current="date"' : '') + (dis ? ' disabled' : '') + ' aria-label="' + date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + '">' + d + '</button></td>';
            d++;
          }
          html += '</tr>';
        }
        body.innerHTML = html;
        if (!body.querySelector('[tabindex="0"]')) { var firstBtn = body.querySelector('.aec-calendar__day:not(:disabled)'); if (firstBtn) firstBtn.tabIndex = 0; }
        if (focus) { var f = body.querySelector('[tabindex="0"]'); if (f) f.focus(); }
      }
      function moveTo(date) { focusDay = date; if (date.getMonth() !== view.getMonth() || date.getFullYear() !== view.getFullYear()) view = new Date(date.getFullYear(), date.getMonth(), 1); render(true); }
      el.addEventListener('click', function (e) {
        var nav = e.target.closest('[data-cal]');
        if (nav) { view = new Date(view.getFullYear(), view.getMonth() + (+nav.dataset.cal), 1); focusDay = view; render(); return; }
        var b = e.target.closest('.aec-calendar__day'); if (!b || b.disabled) return;
        sel = parse(b.dataset.date); focusDay = sel; render(true);
        el.dataset.value = b.dataset.date;
        el.dispatchEvent(new CustomEvent('aec:change', { bubbles: true, detail: { value: b.dataset.date, date: sel } }));
      });
      el.addEventListener('keydown', function (e) {
        var b = e.target.closest('.aec-calendar__day'); if (!b) return;
        var cur = parse(b.dataset.date), step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (step) { e.preventDefault(); moveTo(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + step)); }
        else if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); moveTo(new Date(cur.getFullYear(), cur.getMonth() + (e.key === 'PageUp' ? -1 : 1), cur.getDate())); }
        else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); var dow = (cur.getDay() + 6) % 7; moveTo(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + (e.key === 'Home' ? -dow : 6 - dow))); }
      });
      render();
    });
  }

  function init(root) { toggles(root); radioGroups(root); sliders(root); menus(root); tabs(root); accordions(root); modals(root); chips(root); tooltips(root); snackTriggers(root); signaturePads(root); otps(root); calendars(root); }
  window.AEC = { init: init, snackbar: snackbar, toast: toast };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(document); });
  else init(document);
})();

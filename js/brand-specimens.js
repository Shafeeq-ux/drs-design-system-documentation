/* Component specimens used by the Multi-brand compare grid and the Theme builder preview.
 * Plain .aec-* markup — the brand comes from the nearest [data-brand] ancestor.
 * "{{s}}" is replaced with a unique suffix per instance so ids stay unique. */
(function () {
  'use strict';
  var I = function (name, size) { return '<span class="aec-icon' + (size ? ' aec-icon--' + size : '') + '" style="--aec-icon-src:url(/assets/icons/' + name + '.svg)" aria-hidden="true"></span>'; };

  var S = {};

  S.buttons = { label: 'Buttons', html:
    '<div class="sp-row"><button class="aec-btn aec-btn--primary" type="button">Continue</button><button class="aec-btn aec-btn--primary aec-btn--outline" type="button">Save deal</button><button class="aec-btn aec-btn--primary aec-btn--plain" type="button">Edit</button></div>' +
    '<div class="sp-row"><button class="aec-btn aec-btn--secondary" type="button">Pre-qualify</button><button class="aec-btn aec-btn--secondary aec-btn--outline" type="button">Compare</button><button class="aec-btn aec-btn--standard" type="button">Standard</button></div>' +
    '<div class="sp-row"><button class="aec-btn aec-btn--primary aec-btn--md" type="button">' + I('add', 16) + 'Medium</button><button class="aec-btn aec-btn--primary aec-btn--sm" type="button">Small</button><button class="aec-btn aec-btn--primary" type="button" disabled>Disabled</button><button class="aec-btn aec-btn--inline" type="button">Inline action' + I('arrow-right') + '</button></div>' +
    '<div class="sp-row"><button class="aec-icon-btn aec-icon-btn--primary aec-icon-btn--filled" type="button" aria-label="Add">' + I('add') + '</button><button class="aec-icon-btn aec-icon-btn--primary aec-icon-btn--outline" type="button" aria-label="Edit">' + I('edit') + '</button><button class="aec-icon-btn aec-icon-btn--neutral" type="button" aria-label="Share">' + I('share') + '</button><button class="aec-icon-btn aec-icon-btn--neutral aec-icon-btn--filled aec-icon-btn--circle" type="button" aria-label="Search">' + I('search') + '</button>' +
      '<button class="aec-toggle" type="button" aria-pressed="true">Finance</button><button class="aec-toggle" type="button" aria-pressed="false">Lease</button></div>' +
    '<div class="aec-toggle-group" role="radiogroup" aria-label="Term"><button class="aec-toggle-group__item" type="button" role="radio" aria-checked="false">36 mo</button><button class="aec-toggle-group__item" type="button" role="radio" aria-checked="true">48 mo</button><button class="aec-toggle-group__item" type="button" role="radio" aria-checked="false">60 mo</button></div>'
  };

  S.forms = { label: 'Form', html:
    '<div class="sp-grid">' +
      '<div class="aec-field"><label class="aec-field__label" for="sp-fn{{s}}">First name</label><div class="aec-field__box"><input class="aec-field__input" id="sp-fn{{s}}" placeholder="Jane" autocomplete="off"></div><p class="aec-field__help">As it appears on your licence</p></div>' +
      '<div class="aec-field aec-field--error"><label class="aec-field__label" for="sp-em{{s}}">Email</label><div class="aec-field__box"><input class="aec-field__input" id="sp-em{{s}}" value="jane@" aria-invalid="true" aria-describedby="sp-eme{{s}}" autocomplete="off"></div><p class="aec-field__help aec-field__help--error" id="sp-eme{{s}}">' + I('warning', 16) + 'Enter a valid email address</p></div>' +
      '<div class="aec-field"><label class="aec-field__label" for="sp-pr{{s}}">Down payment</label><div class="aec-field__box"><span class="aec-field__affix aec-field__affix--prefix">$</span><input class="aec-field__input" id="sp-pr{{s}}" value="4,000" inputmode="numeric"></div></div>' +
      '<div class="aec-field aec-field--material"><div class="aec-field__box"><div class="aec-field__float"><input class="aec-field__input" id="sp-zip{{s}}" placeholder=" " value="94588"><label class="aec-field__label" for="sp-zip{{s}}">ZIP code</label></div></div></div>' +
    '</div>' +
    '<div class="aec-slider-field" style="max-width:none"><div class="aec-slider-field__head"><label class="aec-slider-field__title" for="sp-term{{s}}">Term</label><output class="aec-slider-field__value" data-for="sp-term{{s}}">48 months</output></div><input class="aec-slider" type="range" id="sp-term{{s}}" min="12" max="72" step="12" value="48" data-format="{v} months"></div>'
  };

  S.selection = { label: 'Selection', html:
    '<div class="sp-row" style="gap:24px;align-items:flex-start">' +
      '<div class="aec-choice-list">' +
        '<label class="aec-control"><input type="checkbox" class="aec-checkbox" checked><span class="aec-form-label"><span class="aec-form-label__text">GAP protection</span></span></label>' +
        '<label class="aec-control"><input type="checkbox" class="aec-checkbox"><span class="aec-form-label"><span class="aec-form-label__text">Tire &amp; wheel</span></span></label>' +
        '<label class="aec-control"><input type="checkbox" class="aec-checkbox" checked disabled><span class="aec-form-label"><span class="aec-form-label__text">Included</span></span></label>' +
      '</div>' +
      '<fieldset class="aec-fieldset"><legend class="aec-visually-hidden">Delivery</legend><div class="aec-choice-list">' +
        '<label class="aec-control"><input type="radio" class="aec-radio" name="sp-del{{s}}" checked><span class="aec-form-label"><span class="aec-form-label__text">Home delivery</span></span></label>' +
        '<label class="aec-control"><input type="radio" class="aec-radio" name="sp-del{{s}}"><span class="aec-form-label"><span class="aec-form-label__text">Pick up</span></span></label>' +
      '</div></fieldset>' +
      '<div class="aec-choice-list">' +
        '<label class="aec-control"><input type="checkbox" role="switch" class="aec-switch" checked><span class="aec-form-label"><span class="aec-form-label__text">Text updates</span></span></label>' +
        '<label class="aec-control"><input type="checkbox" role="switch" class="aec-switch"><span class="aec-form-label"><span class="aec-form-label__text">Email updates</span></span></label>' +
      '</div>' +
    '</div>' +
    '<div class="sp-row"><span class="aec-chip aec-chip--info">New</span><span class="aec-chip aec-chip--info aec-chip--success">' + I('check-circle', 16) + 'Approved</span><span class="aec-chip aec-chip--info aec-chip--warning">In transit</span><span class="aec-chip aec-chip--info aec-chip--error">Sold</span><span class="aec-chip aec-chip--info aec-chip--filled">Featured</span></div>' +
    '<div class="sp-row"><button class="aec-chip aec-chip--selectable" type="button" aria-pressed="true">Electric</button><button class="aec-chip aec-chip--selectable" type="button" aria-pressed="false">SUV</button><button class="aec-chip aec-chip--selectable" type="button" aria-pressed="false">AWD</button>' +
      '<span class="aec-chip aec-chip--input">Under $50k<button class="aec-chip__remove" type="button" aria-label="Remove Under $50k">' + I('close', 16) + '</button></span>' +
      '<span class="aec-badge-anchor"><span class="aec-avatar aec-avatar--primary">JD</span><span class="aec-badge">3</span></span><span class="aec-avatar aec-avatar--lg aec-avatar--inverse">RC</span></div>'
  };

  S.navigation = { label: 'Navigation', html:
    '<nav class="aec-breadcrumbs" aria-label="Breadcrumb {{s}}"><ol><li><a href="#">Home</a></li><li><a href="#">Inventory</a></li><li><span aria-current="page">Checkout</span></li></ol></nav>' +
    '<div class="aec-tabs"><div class="aec-tabs__list" role="tablist" aria-label="Payment type"><button class="aec-tab" role="tab" id="sp-ta{{s}}" aria-selected="true" aria-controls="sp-pa{{s}}">Finance</button><button class="aec-tab" role="tab" id="sp-tb{{s}}" aria-selected="false" aria-controls="sp-pb{{s}}">Lease</button><button class="aec-tab" role="tab" id="sp-tc{{s}}" aria-selected="false" aria-controls="sp-pc{{s}}">Cash</button></div>' +
      '<div class="aec-tabs__panel" role="tabpanel" id="sp-pa{{s}}" aria-labelledby="sp-ta{{s}}" tabindex="0">$612/mo for 60 months</div><div class="aec-tabs__panel" role="tabpanel" id="sp-pb{{s}}" aria-labelledby="sp-tb{{s}}" tabindex="0" hidden>$489/mo for 36 months</div><div class="aec-tabs__panel" role="tabpanel" id="sp-pc{{s}}" aria-labelledby="sp-tc{{s}}" tabindex="0" hidden>$47,600 today</div></div>' +
    '<div class="aec-tabs aec-tabs--contained"><div class="aec-tabs__list" role="tablist" aria-label="View"><button class="aec-tab" role="tab" id="sp-ca{{s}}" aria-selected="true" aria-controls="sp-cpa{{s}}">Exterior</button><button class="aec-tab" role="tab" id="sp-cb{{s}}" aria-selected="false" aria-controls="sp-cpb{{s}}">Interior</button></div>' +
      '<div class="aec-tabs__panel" role="tabpanel" id="sp-cpa{{s}}" aria-labelledby="sp-ca{{s}}" tabindex="0" hidden></div><div class="aec-tabs__panel" role="tabpanel" id="sp-cpb{{s}}" aria-labelledby="sp-cb{{s}}" tabindex="0" hidden></div></div>' +
    '<div class="sp-row"><a class="aec-link" href="#">View payment summary</a><a class="aec-link aec-link--neutral" href="#">Contact dealer</a></div>'
  };

  S.feedback = { label: 'Feedback', html:
    '<div class="aec-alert aec-alert--success aec-alert--flat" role="status"><div class="aec-alert__body">' + I('check-circle') + '<div class="aec-alert__content"><p class="aec-alert__title">Deposit received</p><p class="aec-alert__message">Your vehicle is reserved for 48 hours.</p></div></div></div>' +
    '<div class="aec-alert aec-alert--error aec-alert--flat" role="alert"><div class="aec-alert__body">' + I('warning') + '<div class="aec-alert__content"><p class="aec-alert__title">Card declined</p><p class="aec-alert__message">Try another payment method.</p></div></div></div>' +
    '<div class="aec-banner"><div class="aec-banner__body">' + I('info', 16) + '<div class="aec-banner__content"><p class="aec-banner__title">Price drop</p><p class="aec-banner__message">This vehicle is now $1,200 less.</p></div></div></div>' +
    '<div class="sp-row" style="align-items:flex-start"><div class="aec-snackbar is-static"><span class="aec-snackbar__msg">Saved to your garage</span><button class="aec-snackbar__action" type="button">Undo</button></div>' +
      '<span class="aec-tooltip is-static" role="tooltip" data-arrow="none"><span class="aec-tooltip__title">' + I('info', 16) + 'What is APR?</span>The yearly cost of borrowing, including fees.</span></div>'
  };

  S.card = { label: 'Card & type', html:
    '<article class="aec-card" style="max-width:420px"><div class="aec-card__body" style="display:flex;flex-direction:column;gap:12px;padding:24px">' +
      '<span class="aec-chip aec-chip--info aec-chip--sm" style="align-self:flex-start">Recommended</span>' +
      '<h3 class="aec-heading-4" style="margin:0">Premium protection plan</h3>' +
      '<p class="aec-body-2" style="margin:0;color:var(--aec-color-text-subtle)">Covers the powertrain, electronics and roadside assistance for 7 years.</p>' +
      '<p class="aec-heading-3" style="margin:0">$38<span class="aec-body-2">/mo</span></p>' +
      '<div class="sp-row" style="margin:0"><button class="aec-btn aec-btn--primary aec-btn--md" type="button">Add to deal</button><button class="aec-btn aec-btn--primary aec-btn--plain aec-btn--md" type="button">Details</button></div>' +
    '</div></article>' +
    '<div class="sp-type"><p class="aec-display-2">Display</p><p class="aec-heading-1">Heading 1</p><p class="aec-heading-3">Heading 3</p><p class="aec-heading-5">Heading 5</p><p class="aec-body-1">Body 1 — your new vehicle is almost ready.</p><p class="aec-body-3">Body 3 — taxes and fees calculated at checkout.</p></div>'
  };

  var n = 0;
  function render(key) { n++; return (S[key] ? S[key].html : '').replace(/\{\{s\}\}/g, '-' + n); }
  window.DRS_SPECIMENS = { list: S, render: render, all: function () { return Object.keys(S).map(function (k) { return '<section class="sp-section" data-specimen="' + k + '"><h3 class="sp-title">' + S[k].label + '</h3>' + render(k) + '</section>'; }).join(''); } };
})();

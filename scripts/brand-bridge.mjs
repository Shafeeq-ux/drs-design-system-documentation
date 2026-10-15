// Generates css/brand-components.css — maps the brand token layer (--drp-* from .drp-* classes, --aec-* component colours)
// onto the documented .aec-* components. Loaded after components.css / patterns.css; every rule is prefixed with
// [data-brand] so it outranks the base rules it replaces. Values always come from the brand file of the nearest
// [data-brand] ancestor, so a single example can be previewed in another brand.
//
// Edit the mapping here, then run `npm run build`.

const d = n => `var(--drp-${n})`;
const a = n => `var(--aec-${n})`;

// Typography block from a .drp-*-typography-* token prefix
const T = p => ({
  'font-family': d(`${p}-font-family`), 'font-size': d(`${p}-font-size`), 'line-height': d(`${p}-line-height`),
  'font-weight': d(`${p}-font-weight`), 'text-transform': d(`${p}-text-transform`), 'letter-spacing': d(`${p}-letter-spacing`)
});
const BOX = (p, { pad = 'padding' } = {}) => ({
  height: d(`${p}-height`), [pad]: d(`${p}-padding`), gap: d(`${p}-gap`), 'border-radius': d(`${p}-border-radius`), 'border-width': d(`${p}-border-width`)
});
const SIDES = p => ({ 'border-top-width': d(`${p}-border-top-width`), 'border-right-width': d(`${p}-border-right-width`), 'border-bottom-width': d(`${p}-border-bottom-width`), 'border-left-width': d(`${p}-border-left-width`) });

const rules = [];
const R = (sel, decls) => rules.push([sel, decls]);
const C = text => rules.push([null, text]);

/* ------------------------------------------------------------------ Typography utilities */
C('Typography — family and case per brand (sizes come from the brand runtime file)');
for (const s of ['display-1', 'display-2']) R(`.aec-${s}`, { 'font-family': a(`typography-${s}-font-family`), 'text-transform': a(`typography-${s}-text-transform`) });
for (let i = 1; i <= 6; i++) R(`.aec-heading-${i}`, { 'font-family': a(`typography-heading-${i}-font-family`), 'text-transform': a(`typography-heading-${i}-text-transform`) });
for (let i = 1; i <= 3; i++) R(`.aec-body-${i}`, { 'font-family': a(`typography-body-${i}-font-family`) });

/* ------------------------------------------------------------------ Button */
C('Button — size, shape and type from .drp-button-contained-*; colour per emphasis × style × state');
const SLOT = p => ({
  '--_bg': d(`${p}-background-color`), '--_bd': d(`${p}-border-color`), '--_fg': d(`${p}-color`), '--_ic': d(`${p}-icon-color`),
  '--_bg-h': d(`${p}-hover-background-color`), '--_bd-h': d(`${p}-hover-border-color`), '--_fg-h': d(`${p}-hover-color`), '--_ic-h': d(`${p}-hover-icon-color`),
  '--_bg-a': d(`${p}-active-background-color`), '--_bd-a': d(`${p}-active-border-color`), '--_fg-a': d(`${p}-active-color`), '--_ic-a': d(`${p}-active-icon-color`),
  '--_bg-d': d(`${p}-disabled-background-color`), '--_bd-d': d(`${p}-disabled-border-color`), '--_fg-d': d(`${p}-disabled-color`), '--_ic-d': d(`${p}-disabled-icon-color`)
});
const LINKSLOT = p => ({
  '--_bg': 'transparent', '--_bd': 'transparent', '--_fg': d(`${p}-color`), '--_ic': d(`${p}-icon-color`),
  '--_bg-h': 'transparent', '--_bd-h': 'transparent', '--_fg-h': d(`${p}-hover-color`), '--_ic-h': d(`${p}-hover-icon-color`),
  '--_bg-a': 'transparent', '--_bd-a': 'transparent', '--_fg-a': d(`${p}-active-color`), '--_ic-a': d(`${p}-active-icon-color`),
  '--_bg-d': 'transparent', '--_bd-d': 'transparent', '--_fg-d': d(`${p}-disabled-color`), '--_ic-d': d(`${p}-disabled-icon-color`)
});
// min-height (not height) so a long label in a wide or uppercase brand font wraps instead of overflowing
const BTN = p => { const b = BOX(p); return { ...b, height: 'auto', 'min-height': b.height }; };
R('.aec-btn', { ...BTN('button-contained-container-bg-large'), 'border-style': 'solid', 'max-width': '100%', 'white-space': 'normal', 'text-align': 'center', ...T('button-contained-typography-large') });
R('.aec-btn--md', { ...BTN('button-contained-container-bg-medium'), ...T('button-contained-typography-medium') });
R('.aec-btn--sm', { ...BTN('button-contained-container-bg-small'), ...T('button-contained-typography-small') });
R('.aec-btn--plain', { 'padding-inline': '0' });
R('.aec-btn--destructive.aec-btn--plain', { 'padding-inline': a('spacing-container-padding-m') });
R('.aec-btn--inline', { height: 'auto', 'min-height': d('button-link-container-bg-height'), padding: d('button-link-container-bg-padding'), gap: d('button-link-container-bg-gap'), 'border-width': d('button-link-container-bg-border-width'), 'border-radius': d('button-link-container-bg-border-radius'), ...T('button-link-typography-large') });
R('.aec-btn--inline.aec-btn--md', T('button-link-typography-medium'));
R('.aec-btn--inline.aec-btn--sm', T('button-link-typography-small'));

const EMPH = ['primary', 'secondary', 'neutral', 'inverse', 'destructive'];
const STYLE = { filled: '', outlined: '.aec-btn--outline', plain: '.aec-btn--plain' };
for (const e of EMPH) {
  for (const [s, cls] of Object.entries(STYLE)) {
    const sel = e === 'primary' ? [`.aec-btn${cls}`, `.aec-btn--primary${cls}`] : [`.aec-btn--${e}${cls}`];
    R(sel.join(', '), SLOT(`button-contained-color-${e}-${s}`));
  }
}
R('.aec-btn--standard', SLOT('button-contained-color-standard'));
R('.aec-btn--inline, .aec-btn--primary.aec-btn--inline', LINKSLOT('button-link-color-primary'));
for (const e of ['secondary', 'neutral', 'inverse', 'destructive']) R(`.aec-btn--${e}.aec-btn--inline`, LINKSLOT(`button-link-color-${e}`));

const STATES = (base, extra = '') => {
  R(`${base}`, { background: 'var(--_bg)', 'border-color': 'var(--_bd)', color: 'var(--_fg)' });
  R(`${base} .aec-icon`, { color: 'var(--_ic, currentColor)' });
  R(`${base}:hover`, { background: 'var(--_bg-h, var(--_bg))', 'border-color': 'var(--_bd-h, var(--_bd))', color: 'var(--_fg-h, var(--_fg))' });
  R(`${base}:hover .aec-icon`, { color: 'var(--_ic-h, var(--_ic, currentColor))' });
  R(`${base}:active`, { background: 'var(--_bg-a, var(--_bg-h))', 'border-color': 'var(--_bd-a, var(--_bd-h))', color: 'var(--_fg-a, var(--_fg-h))' });
  R(`${base}:active .aec-icon`, { color: 'var(--_ic-a, var(--_ic-h, currentColor))' });
  R(`${base}:disabled, ${base}[aria-disabled="true"]`, { background: 'var(--_bg-d)', 'border-color': 'var(--_bd-d)', color: 'var(--_fg-d)' });
  R(`${base}:disabled .aec-icon, ${base}[aria-disabled="true"] .aec-icon`, { color: 'var(--_ic-d, currentColor)' });
};
STATES('.aec-btn');

/* ------------------------------------------------------------------ Icon button */
C('Icon button — .drp-button-contained-icon-container-{rect|circle}-*; colours reuse the button tokens');
const IB = (shape, size) => `button-contained-icon-container-${shape}-bg-${size}`;
R('.aec-icon-btn', { width: d(`${IB('rect', 'medium')}-width`), height: d(`${IB('rect', 'medium')}-height`), 'border-radius': d(`${IB('rect', 'medium')}-border-radius`), 'border-width': d(`${IB('rect', 'medium')}-border-width`), 'border-style': 'solid' });
R('.aec-icon-btn--lg', { width: d(`${IB('rect', 'large')}-width`), height: d(`${IB('rect', 'large')}-height`), 'border-radius': d(`${IB('rect', 'large')}-border-radius`) });
R('.aec-icon-btn--sm', { width: d(`${IB('rect', 'small')}-width`), height: d(`${IB('rect', 'small')}-height`), 'border-radius': d(`${IB('rect', 'small')}-border-radius`) });
R('.aec-icon-btn--circle', { 'border-radius': d(`${IB('circle', 'medium')}-border-radius`), 'border-width': d(`${IB('circle', 'medium')}-border-width`) });
const IBSTYLE = { plain: '', filled: '.aec-icon-btn--filled', outlined: '.aec-icon-btn--outline' };
for (const e of ['primary', 'neutral', 'inverse']) {
  for (const [s, cls] of Object.entries(IBSTYLE)) {
    const sel = e === 'primary' ? [`.aec-icon-btn${cls}`, `.aec-icon-btn--primary${cls}`] : [`.aec-icon-btn--${e}${cls}`];
    R(sel.join(', '), SLOT(`button-contained-color-${e}-${s}`));
  }
}
R('.aec-icon-btn', { background: 'var(--_bg)', 'border-color': 'var(--_bd)', color: 'var(--_ic, var(--_fg))' });
R('.aec-icon-btn:hover', { background: 'var(--_bg-h, var(--_bg))', 'border-color': 'var(--_bd-h, var(--_bd))', color: 'var(--_ic-h, var(--_fg-h))' });
R('.aec-icon-btn:active', { background: 'var(--_bg-a, var(--_bg-h))', 'border-color': 'var(--_bd-a, var(--_bd-h))', color: 'var(--_ic-a, var(--_fg-a))' });
R('.aec-icon-btn:disabled, .aec-icon-btn[aria-disabled="true"]', { background: 'var(--_bg-d)', 'border-color': 'var(--_bd-d)', color: 'var(--_ic-d, var(--_fg-d))' });

/* ------------------------------------------------------------------ Link */
C('Link — .drp-link-typography-* and --aec-link-color-*');
R('.aec-link', { ...T('link-typography-medium'), color: a('link-color-primary-text-default'), 'border-radius': d('link-container-focus-ring-border-radius') });
R('.aec-link .aec-icon', { color: a('link-color-primary-icon-default') });
R('.aec-link:hover, .aec-link:active', { color: a('link-color-primary-text-hover') });
R('.aec-link:hover .aec-icon', { color: a('link-color-primary-icon-hover') });
R('.aec-link--lg', T('link-typography-large'));
R('.aec-link--sm', T('link-typography-small'));
for (const k of ['neutral', 'inverse']) {
  R(`.aec-link--${k}`, { color: a(`link-color-${k}-text-default`) });
  R(`.aec-link--${k}:hover, .aec-link--${k}:active`, { color: a(`link-color-${k}-text-hover`) });
  R(`.aec-link--${k} .aec-icon`, { color: a(`link-color-${k}-icon-default`) });
}
R('.aec-link[aria-disabled="true"]', { color: a('link-color-primary-text-disabled') });
R('.aec-link--inverse[aria-disabled="true"]', { color: a('link-color-inverse-text-disabled') });
R(':is(p, li) .aec-link', { 'font-size': 'inherit', 'line-height': 'inherit' });

/* ------------------------------------------------------------------ Toggle button */
C('Toggle button — .drp-toggle-button-*');
R('.aec-toggle', { height: d('toggle-button-container-bg-large-height'), 'padding-inline': d('toggle-button-container-bg-large-padding'), gap: d('toggle-button-container-bg-large-gap'), 'border-radius': d('toggle-button-container-bg-large-border-radius'), 'border-style': 'solid', ...SIDES('toggle-button-container-bg-large'), ...T('toggle-button-typography-large') });
R('.aec-toggle--md', { height: d('toggle-button-container-bg-medium-height'), 'padding-inline': d('toggle-button-container-bg-medium-padding'), 'border-radius': d('toggle-button-container-bg-medium-border-radius'), ...T('toggle-button-typography-small') });
R('.aec-toggle', SLOT('toggle-button-color-option-1'));
R('.aec-toggle[aria-pressed="true"]', SLOT('toggle-button-color-option-1-selected'));
STATES('.aec-toggle');

/* ------------------------------------------------------------------ Toggle group */
C('Toggle group — --aec-toggle-group-tab-item-color-option-1-*');
const TG = s => a(`toggle-group-tab-item-color-option-1-${s}`);
R('.aec-toggle-group__item', { ...T('toggle-group-typography-large'), background: TG('bg-default'), 'border-color': TG('border-default'), color: TG('text-default') });
R('.aec-toggle-group--md .aec-toggle-group__item', T('toggle-group-typography-small'));
R('.aec-toggle-group__item:hover', { background: TG('bg-hover'), 'border-color': TG('border-hover'), color: TG('text-hover') });
R('.aec-toggle-group__item:active', { background: TG('bg-active'), 'border-color': TG('border-active'), color: TG('text-active') });
R('.aec-toggle-group__item[aria-checked="true"], .aec-toggle-group__item[aria-pressed="true"]', { background: TG('selected-bg-default'), 'border-color': TG('selected-border-default'), color: TG('selected-text-default'), 'box-shadow': `inset 0 0 0 1px ${TG('selected-border-default')}` });
R('.aec-toggle-group__item:disabled', { background: TG('bg-disabled'), 'border-color': TG('border-disabled'), color: TG('text-disabled') });
R('.aec-toggle-group__item:disabled[aria-checked="true"]', { background: TG('selected-bg-disabled'), 'border-color': TG('selected-border-disabled'), color: TG('selected-text-disabled') });

/* ------------------------------------------------------------------ Chips */
C('Chips — .drp-chip-*-container / typography and --aec-chip-*-color-*');
R('.aec-chip', { ...BOX('chip-information-container-small'), ...T('chip-information-typography-large') });
R('.aec-chip--sm', { ...BOX('chip-information-container-xs'), ...T('chip-information-typography-small') });
R('.aec-chip--lg', { ...BOX('chip-information-container-medium') });
for (const st of ['primary', 'success', 'warning', 'error', 'grey']) {
  const sel = st === 'primary' ? '.aec-chip--info' : `.aec-chip--info.aec-chip--${st}`;
  R(sel, { background: a(`chip-information-color-${st}-subtle-bg`), 'border-color': a(`chip-information-color-${st}-subtle-border`), color: a(`chip-information-color-${st}-subtle-text`) });
  R(`${sel} .aec-icon`, { color: a(`chip-information-color-${st}-subtle-icon`) });
  R(`${sel}.aec-chip--filled`, { background: a(`chip-information-color-${st}-bg`), 'border-color': a(`chip-information-color-${st}-border`), color: a(`chip-information-color-${st}-text`) });
  R(`${sel}.aec-chip--filled .aec-icon`, { color: a(`chip-information-color-${st}-icon`) });
}
R('.aec-chip-plain', { ...T('chip-plain-typography-large'), gap: d('chip-plain-container-gap'), color: a('chip-plain-color-primary-text') });
R('.aec-chip-plain--sm', T('chip-plain-typography-small'));
for (const st of ['success', 'warning', 'error', 'grey']) R(`.aec-chip-plain--${st}`, { color: a(`chip-plain-color-${st}-text`) });

const CS = s => a(`chip-selectable-color-${s}`);
R('.aec-chip--selectable', { ...BOX('chip-selectable-container-medium'), ...T('chip-selectable-typography-large'), background: CS('bg-default'), 'border-color': CS('border-default'), color: CS('text-default') });
R('.aec-chip--selectable.aec-chip--sm', { ...BOX('chip-selectable-container-small'), ...T('chip-selectable-typography-small') });
R('.aec-chip--selectable .aec-icon', { color: CS('icon-default') });
R('.aec-chip--selectable:hover', { background: CS('bg-hover'), 'border-color': CS('border-hover'), color: CS('text-hover') });
R('.aec-chip--selectable:active', { background: CS('bg-active'), 'border-color': CS('border-active'), color: CS('text-active') });
R('.aec-chip--selectable[aria-pressed="true"]', { background: CS('bg-selected-default'), 'border-color': CS('border-selected-default'), color: CS('text-selected-default') });
R('.aec-chip--selectable[aria-pressed="true"] .aec-icon', { color: CS('icon-selected-default') });
R('.aec-chip--selectable:disabled', { background: CS('bg-disabled'), 'border-color': CS('border-disabled'), color: CS('text-disabled') });
R('.aec-chip--selectable:disabled[aria-pressed="true"]', { background: CS('bg-selected-disabled'), 'border-color': CS('border-selected-disabled'), color: CS('text-selected-disabled') });
R('.aec-chip--inverse.aec-chip--selectable', { background: CS('inverse-bg-default'), 'border-color': CS('inverse-border-default'), color: CS('inverse-text-default') });
R('.aec-chip--inverse.aec-chip--selectable:hover', { background: CS('inverse-bg-hover'), 'border-color': CS('inverse-border-hover'), color: CS('inverse-text-hover') });
R('.aec-chip--inverse.aec-chip--selectable[aria-pressed="true"]', { background: CS('inverse-bg-selected-default'), 'border-color': CS('inverse-border-selected-default'), color: CS('inverse-text-selected-default') });
R('.aec-chip--inverse.aec-chip--selectable:disabled', { background: CS('inverse-bg-disabled'), 'border-color': CS('inverse-border-disabled'), color: CS('inverse-text-disabled') });

const CD = s => a(`chip-dismissable-color-${s}`);
R('.aec-chip--input', { ...BOX('chip-dismissable-container-small'), 'padding-right': '4px', ...T('chip-dismissable-typography-large'), background: CD('bg-default'), 'border-color': CD('border-default'), color: CD('text-default') });
R('.aec-chip--input.aec-chip--sm', { ...BOX('chip-dismissable-container-xs'), 'padding-right': '4px', ...T('chip-dismissable-typography-small') });
R('.aec-chip--input.aec-chip--lg', { ...BOX('chip-dismissable-container-medium'), 'padding-right': '8px' });
R('.aec-chip--input .aec-chip__remove', { color: CD('icon-default') });
R('.aec-chip--input:hover', { background: CD('bg-hover'), 'border-color': CD('border-hover'), color: CD('text-hover') });
R('.aec-chip--input[aria-disabled="true"]', { background: CD('bg-disabled'), 'border-color': CD('border-disabled'), color: CD('text-disabled') });
R('.aec-chip--inverse.aec-chip--input', { background: CD('inverse-bg-default'), 'border-color': CD('inverse-border-default'), color: CD('inverse-text-default') });
R('.aec-chip--inverse.aec-chip--input:hover', { background: CD('inverse-bg-hover'), 'border-color': CD('inverse-border-hover'), color: CD('inverse-text-hover') });
R('.aec-chip--inverse .aec-chip__remove', { color: CD('inverse-icon-default') });

/* ------------------------------------------------------------------ Checkbox / radio / switch */
C('Checkbox — .drp-checkbox-container + --aec-checkbox-color-*; the mark is a masked ::before so it takes the icon colour');
const CB = s => a(`checkbox-color-${s}`);
const CHECK = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M2.5 8.5 6 12l7.5-8' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";
const DASH = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M2.5 8h11' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\")";
R('.aec-checkbox', { position: 'relative', width: d('checkbox-container-width'), height: d('checkbox-container-height'), 'border-radius': d('checkbox-container-border-radius'), 'border-width': d('checkbox-container-border-width'), 'background-image': 'none', 'background-color': CB('bg-default'), 'border-color': CB('border-default'), '--_ck': CB('icon-default'), '--_mk': CHECK });
R('.aec-checkbox::before', { content: '""', position: 'absolute', inset: '0', 'background-color': 'var(--_ck, transparent)', '-webkit-mask': 'var(--_mk) center / 70% no-repeat', mask: 'var(--_mk) center / 70% no-repeat', 'pointer-events': 'none' });
R('.aec-checkbox:hover:not(:disabled)', { 'background-color': CB('bg-hover'), 'border-color': CB('border-hover'), '--_ck': CB('icon-hover') });
R('.aec-checkbox:active:not(:disabled)', { 'background-color': CB('bg-active'), 'border-color': CB('border-active'), '--_ck': CB('icon-active') });
R('.aec-checkbox:checked', { 'background-image': 'none', 'background-color': CB('selected-bg-default'), 'border-color': CB('selected-border-default'), '--_ck': CB('selected-icon-default') });
R('.aec-checkbox:checked:hover:not(:disabled)', { 'background-color': CB('selected-bg-hover'), 'border-color': CB('selected-border-hover'), '--_ck': CB('selected-icon-hover') });
R('.aec-checkbox:indeterminate', { 'background-image': 'none', 'background-color': CB('intermediate-bg-default'), 'border-color': CB('intermediate-border-default'), '--_ck': CB('intermediate-icon-default'), '--_mk': DASH });
R('.aec-checkbox:disabled', { 'background-image': 'none', 'background-color': CB('bg-disabled'), 'border-color': CB('border-disabled'), '--_ck': CB('icon-disabled') });
R('.aec-checkbox:disabled:checked', { 'background-color': CB('selected-bg-disabled'), 'border-color': CB('selected-border-disabled'), '--_ck': CB('selected-icon-disabled') });
R('.aec-checkbox:disabled:indeterminate', { 'background-color': CB('intermediate-bg-disabled'), 'border-color': CB('intermediate-border-disabled'), '--_ck': CB('intermediate-icon-disabled') });
R('.aec-checkbox[aria-invalid="true"]', { 'border-color': a('color-error-default') });
R('.aec-table .aec-checkbox', { width: '20px', height: '20px' });
R('.aec-checkbox, .aec-radio', { 'border-style': 'solid' });

C('Radio — --aec-radio-*');
const RD = s => a(`radio-color-${s}`);
const DOT = c => `radial-gradient(circle, ${c} 0 calc(${a('radio-indicator-sizing')} / 2 - 0.5px), transparent calc(${a('radio-indicator-sizing')} / 2))`;
R('.aec-radio', { width: a('radio-container-sizing'), height: a('radio-container-sizing'), 'border-width': a('radio-container-border-width'), 'border-radius': a('radio-container-border-radius'), 'background-color': RD('bg-default'), 'border-color': RD('border-default') });
R('.aec-radio:hover:not(:disabled)', { 'background-color': RD('bg-hover'), 'border-color': RD('border-hover') });
R('.aec-radio:checked', { 'background-color': RD('selected-bg-default'), 'border-color': RD('selected-border-default'), 'background-image': DOT(RD('selected-icon-default')) });
R('.aec-radio:disabled', { 'background-color': RD('bg-disabled'), 'border-color': RD('border-disabled') });
R('.aec-radio:disabled:checked', { 'background-color': RD('selected-bg-disabled'), 'border-color': RD('selected-border-disabled'), 'background-image': DOT(RD('selected-icon-disabled')) });

C('Switch — --aec-switch-*');
const SW = s => a(`switch-color-${s}`);
const inset = `calc(${a('switch-container-spacing')} - ${a('switch-container-border-width')})`;
R('.aec-switch', { width: a('switch-container-width'), height: a('switch-container-height'), 'border-width': a('switch-container-border-width'), 'border-style': 'solid', 'border-radius': a('switch-container-border-radius'), 'background-color': SW('track-bg-default'), 'border-color': SW('track-border-default') });
R('.aec-switch::before', { top: inset, left: inset, width: a('switch-handle-width'), height: a('switch-handle-height'), 'border-radius': a('switch-handle-border-radius'), background: SW('handle-bg-default'), 'box-shadow': `0 0 0 ${a('switch-handle-border-width')} ${SW('handle-border-default')}` });
R('.aec-switch:hover:not(:disabled)', { 'background-color': SW('track-bg-hover'), 'border-color': SW('track-border-hover') });
R('.aec-switch:hover:not(:disabled):not(:checked)::before', { background: SW('handle-bg-hover') });
R('.aec-switch:checked', { 'background-color': SW('track-selected-bg-default'), 'border-color': SW('track-selected-border-default') });
R('.aec-switch:checked:hover:not(:disabled)', { 'background-color': SW('track-selected-bg-hover'), 'border-color': SW('track-selected-border-hover') });
R('.aec-switch:checked::before', { transform: `translateX(calc(${a('switch-container-width')} - ${a('switch-handle-width')} - 2 * ${a('switch-container-spacing')}))`, background: SW('handle-selected-bg-default'), 'box-shadow': `0 0 0 ${a('switch-handle-border-width')} ${SW('handle-selected-border-default')}` });
R('.aec-switch:disabled', { 'background-color': SW('track-bg-disabled'), 'border-color': SW('track-border-disabled') });
R('.aec-switch:disabled::before', { background: SW('handle-bg-disabled'), 'box-shadow': 'none' });
R('.aec-switch:disabled:checked', { 'background-color': SW('track-selected-bg-disabled'), 'border-color': SW('track-selected-border-disabled') });
R('.aec-switch:disabled:checked::before', { background: SW('handle-selected-bg-disabled') });

/* ------------------------------------------------------------------ Text field */
C('Text field — standard = .drp-input-standard-outlined-*, material = .drp-input-material-filled-*');
for (const [root, kind] of [['', 'standard-outlined'], ['.aec-field--material ', 'material-filled']]) {
  const IC = s => a(`input-${kind}-color-${s}`);
  const box = `${root}.aec-field__box`;
  R(box, { height: d(`input-${kind}-container-bg-large-height`), 'border-radius': d(`input-${kind}-container-bg-large-border-radius`), 'border-width': d(`input-${kind}-container-bg-large-border-width`), 'border-style': 'solid', background: IC('bg-default'), 'border-color': IC('border-default') });
  R(`${box}:hover`, { background: IC('bg-hover'), 'border-color': IC('border-hover') });
  R(`${box}:focus-within`, { background: IC('bg-active'), 'border-color': IC('border-active') });
  R(`${box}:has(:disabled)`, { background: IC('bg-disabled'), 'border-color': IC('border-disabled') });
  R(`${root}.aec-field__input`, { ...T(`input-${kind}-typography`), color: IC('text-default') });
  R(`${root}.aec-field__input::placeholder`, { color: IC('text-prompt') });
  R(`${box}:has(:disabled) .aec-field__input`, { color: IC('text-disabled') });
  R(`${box} > .aec-icon`, { color: IC('icon-default') });
  R(`${root}.aec-field--error .aec-field__box, ${root}.aec-field__box:has([aria-invalid="true"])`, { background: IC('error-bg-default'), 'border-color': IC('error-border-default') });
}
R('.aec-field__label', { ...T('input-standard-outlined-typography-label'), color: a('input-standard-outlined-color-label-default') });
R('.aec-field--error .aec-field__label', { color: a('input-standard-outlined-color-error-label-default') });
R('.aec-field:has(:disabled) .aec-field__label', { color: a('input-standard-outlined-color-label-disabled') });
R('.aec-field__affix', T('input-standard-outlined-prefix-typography'));
R('.aec-field--material .aec-field__float .aec-field__label', { ...T('input-material-filled-typography'), color: a('input-material-filled-color-label-prompt') });
R('.aec-field--material .aec-field__float:focus-within .aec-field__label, .aec-field--material .aec-field__input:not(:placeholder-shown) + .aec-field__label, .aec-field--material select.aec-field__input + .aec-field__label', { ...T('input-material-filled-typography-label'), color: a('input-material-filled-color-label-default') });
R('.aec-field__help', { ...T('assistive-text-typography'), color: a('assistive-text-color-neutral-text') });
for (const st of ['error', 'success', 'warning']) R(`.aec-field__help--${st}`, { color: a(`assistive-text-color-${st}-text`) });

/* ------------------------------------------------------------------ Tabs */
C('Tabs — .drp-tab-* metrics/typography and --aec-tabbar-* colours, one block per style');
const TAB = (style, base, list, typo, extra = {}) => {
  const c = s => a(`tabbar-${base}-tab-item-color-${s}`);
  R(`${style} .aec-tab`, { ...T(typo), background: c('bg-default'), color: c('text-default'), ...extra.item });
  R(`${style} .aec-tab:hover`, { background: c('bg-hover'), color: c('text-hover'), ...(extra.borderProp ? { [extra.borderProp]: c('border-hover') } : {}) });
  R(`${style} .aec-tab:active`, { background: c('bg-active'), color: c('text-active'), ...(extra.borderProp ? { [extra.borderProp]: c('border-active') } : {}) });
  R(`${style} .aec-tab[aria-selected="true"]`, { background: c('selected-bg-default'), color: c('selected-text-default'), ...(extra.borderProp ? { [extra.borderProp]: c('selected-border-default') } : {}), ...extra.selected });
  R(`${style} .aec-tab:disabled, ${style} .aec-tab[aria-disabled="true"]`, { background: c('bg-disabled'), color: c('text-disabled'), ...(extra.borderProp ? { [extra.borderProp]: c('border-disabled') } : {}) });
  if (extra.borderProp) R(`${style} .aec-tab`, { [extra.borderProp]: c('border-default') });
  if (list) R(`${style} .aec-tabs__list`, list);
};
TAB('.aec-tabs', 'underlined-inside', { gap: d('tab-underlined-inside-tab-container-bg-large-gap') }, 'tab-underlined-inside-typography-large',
  { borderProp: 'border-bottom-color', item: { height: d('tab-underlined-inside-tab-container-bg-large-height'), 'border-bottom-width': d('tab-underlined-inside-container-border-bottom-width') } });
R('.aec-tabs--md .aec-tab', { ...T('tab-underlined-inside-typography-medium'), height: d('tab-underlined-inside-tab-container-bg-medium-height') });
TAB('.aec-tabs--inset', 'underlined-inset', { 'box-shadow': `inset 0 calc(-1 * ${d('tab-underlined-inset-container-bg-border-bottom-width')}) 0 ${a('tabbar-underlined-inset-tab-color-border-default')}` }, 'tab-underlined-inset-typography-large',
  { borderProp: 'border-bottom-color', item: { height: d('tab-underlined-inset-tab-container-bg-large-height'), padding: d('tab-underlined-inset-container-padding') },
    selected: { 'box-shadow': `inset 0 calc(-1 * ${d('tab-underlined-inset-container-selected-bg-border-bottom-width')}) 0 ${a('tabbar-underlined-inset-tab-item-color-selected-border-default')}` } });
TAB('.aec-tabs--contained', 'contained', { padding: d('tab-contained-tab-container-bg-medium-padding'), 'border-radius': d('tab-contained-tab-container-bg-medium-border-radius'), 'border-color': a('tabbar-contained-tab-color-border-default'), background: a('tabbar-contained-tab-color-bg-default') }, 'tab-contained-typography-medium',
  { item: { 'border-radius': d('tab-contained-container-bg-border-radius'), padding: d('tab-contained-container-bg-padding') } });
TAB('.aec-tabs--segment', 'segment', { 'border-radius': d('tab-segment-container-bg-border-radius'), overflow: 'hidden' }, 'tab-segment-typography-medium',
  { item: { height: d('tab-segment-tab-container-bg-medium-height'), padding: d('tab-segment-container-bg-padding') } });
TAB('.aec-tabs--stacked', 'stacked', null, 'tab-stacked-typography-medium',
  { borderProp: 'border-color', item: { 'border-radius': d('tab-stacked-container-bg-border-radius'), padding: d('tab-stacked-container-bg-padding'), height: d('tab-stacked-tab-container-bg-medium-height') } });
TAB('.aec-tabs--vertical', 'vertical', null, 'tab-vertical-typography-medium',
  { borderProp: 'border-right-color', item: { height: d('tab-vertical-container-height'), 'border-right-width': d('tab-vertical-container-bg-border-right-width') } });

/* ------------------------------------------------------------------ Accordion */
C('Accordion — .drp-accordion-container-bg + --aec-accordion-color-*');
const AC = s => a(`accordion-color-${s}`);
R('.aec-accordion__trigger', { 'min-height': d('accordion-container-bg-height'), background: AC('bg-default'), color: AC('text-default') });
R('.aec-accordion__item', { 'border-bottom-color': AC('border-default'), 'border-bottom-width': d('accordion-container-bg-border-bottom-width') });
R('.aec-accordion', { 'border-top-color': AC('border-default') });
R('.aec-accordion__trigger::after', { background: AC('icon-default') });
R('.aec-accordion__trigger:hover', { background: AC('bg-hover'), color: AC('text-hover') });
R('.aec-accordion__trigger[aria-expanded="true"]', { background: AC('selected-bg-default'), color: AC('selected-text-default') });
R('.aec-accordion__trigger[aria-expanded="true"]::after', { background: AC('selected-icon-default') });
R('.aec-accordion__trigger:disabled', { background: AC('bg-disabled'), color: AC('text-disabled') });

/* ------------------------------------------------------------------ Avatar & badge */
C('Avatar & badge');
for (const [cls, size] of [['.aec-avatar', 'medium'], ['.aec-avatar--sm', 'small'], ['.aec-avatar--lg', 'large']]) {
  R(cls, { width: d(`avatar-container-bg-${size}-width`), height: d(`avatar-container-bg-${size}-height`), 'border-radius': d(`avatar-container-bg-${size}-border-radius`), ...T(`avatar-typography-${size}`), 'line-height': '1', 'text-transform': 'uppercase' });
}
R('.aec-badge', { height: d('badge-container-bg-small-height'), 'min-width': d('badge-container-bg-small-height'), padding: d('badge-container-bg-small-padding'), 'border-radius': d('badge-container-bg-small-border-radius'), ...T('badge-typography-small'), 'line-height': '1', background: a('badge-color-primary-bg'), color: a('badge-color-primary-text'), 'box-shadow': `inset 0 0 0 ${d('badge-container-bg-small-border-width')} ${a('badge-color-primary-border')}` });
R('.aec-badge--md', { height: d('badge-container-bg-medium-height'), 'min-width': d('badge-container-bg-medium-height'), padding: d('badge-container-bg-medium-padding'), ...T('badge-typography-medium'), 'line-height': '1' });
R('.aec-badge--dot', { height: d('badge-container-bg-xs-height'), width: d('badge-container-bg-xs-width'), 'min-width': d('badge-container-bg-xs-width'), padding: '0', 'font-size': '0' });
R('.aec-badge--dark', { background: a('badge-color-black-bg'), color: a('badge-color-black-text') });
R('.aec-badge--light', { background: a('badge-color-white-bg'), color: a('badge-color-white-text') });

/* ------------------------------------------------------------------ Alert, banner, snackbar, tooltip */
C('Notification (alert) — --aec-notification-*');
const NC = (st, s) => a(`notification-color-${st}-${s}`);
R('.aec-alert', { padding: a('notification-container-inside-spacing'), gap: a('notification-container-inside-item-spacing'), 'border-radius': a('notification-container-inside-border-radius'), 'box-shadow': a('notification-container-inside-box-shadow'),
  'border-top-width': a('notification-container-inside-border-width-top'), 'border-right-width': a('notification-container-inside-border-width-right'), 'border-bottom-width': a('notification-container-inside-border-width-bottom'), 'border-left-width': a('notification-container-inside-border-width-left'),
  background: NC('information', 'bg'), 'border-color': NC('information', 'border'), '--_accent': NC('information', 'icon'), '--_icon': NC('information', 'icon') });
R('.aec-alert', { 'border-left-color': 'var(--_accent)' });
for (const [cls, st] of [['success', 'success'], ['warning', 'warning'], ['error', 'error'], ['info', 'information']]) {
  R(`.aec-alert--${cls}`, { background: NC(st, 'bg'), 'border-color': NC(st, 'border'), 'border-left-color': NC(st, 'icon'), '--_accent': NC(st, 'icon'), '--_icon': NC(st, 'icon') });
  R(`.aec-alert--${cls} .aec-alert__title`, { color: NC(st, 'title') });
  R(`.aec-alert--${cls} .aec-alert__message`, { color: NC(st, 'description') });
}
R('.aec-alert__title', { ...T('notification-typography-title'), color: NC('information', 'title') });
R('.aec-alert__message', { ...T('notification-typography-description'), color: NC('information', 'description') });

C('Banner — .drp-banner-* + --aec-banner-color-*');
R('.aec-banner', { 'border-radius': d('banner-container-bg-border-radius'), background: a('banner-color-bg'), color: a('banner-color-title'), 'border-style': 'solid', 'border-color': a('banner-color-border'), 'border-top-width': d('banner-container-bg-border-top-width'), 'border-right-width': d('banner-container-bg-border-right-width'), 'border-bottom-width': d('banner-container-bg-border-bottom-width'), 'border-left-width': d('banner-container-bg-border-left-width'), 'box-shadow': d('banner-container-bg-box-shadow') });
R('.aec-banner__title', { ...T('banner-typography-title'), color: a('banner-color-title') });
R('.aec-banner__message', { ...T('banner-typography-description'), color: a('banner-color-description') });
R('.aec-banner__body > .aec-icon', { color: a('banner-color-icon') });

C('Snackbar');
R('.aec-snackbar', { ...T('snackbar-typography-title'), 'border-radius': d('snackbar-container-bg-border-radius'), 'box-shadow': d('snackbar-container-bg-box-shadow'), background: a('snackbar-color-bg'), color: a('snackbar-color-description'), gap: d('snackbar-container-bg-gap') });
R('.aec-snackbar--inverse', { background: a('color-bg-inverse'), color: a('color-text-inverse') });

C('Tooltip');
R('.aec-tooltip', { '--_bg': a('tooltip-color-dark-bg'), color: a('tooltip-color-dark-body'), padding: d('tooltip-container-padding'), gap: d('tooltip-container-gap'), 'border-radius': d('tooltip-container-border-radius'), 'box-shadow': d('tooltip-container-bg-box-shadow'), ...T('tooltip-typography') });
R('.aec-tooltip__title', { ...T('tooltip-typography-title'), color: a('tooltip-color-dark-title') });
R('.aec-tooltip--light', { '--_bg': a('tooltip-color-white-bg'), color: a('tooltip-color-white-body') });
R('.aec-tooltip--light .aec-tooltip__title', { color: a('tooltip-color-white-title') });

/* ------------------------------------------------------------------ Breadcrumbs, menu, modal, header, slider, card */
C('Breadcrumbs');
R('.aec-breadcrumbs ol', T('breadcrumb-typography-small-default'));
R('.aec-breadcrumbs a', { color: a('breadcrumb-color-text-default') });
R('.aec-breadcrumbs a:hover', { color: a('breadcrumb-color-text-hover') });
R('.aec-breadcrumbs a:active', { color: a('breadcrumb-color-text-active') });
R('.aec-breadcrumbs [aria-current="page"]', { ...T('breadcrumb-typography-small-selected'), color: a('breadcrumb-color-text-selected') });
R('.aec-breadcrumbs li + li::before', { background: a('breadcrumb-color-icon-default') });

C('Menu — list item tokens');
const LI = s => a(`list-item-color-${s}`);
R('.aec-menu__item', { padding: d('list-item-container-bg-padding'), gap: d('list-item-container-bg-gap'), ...T('list-item-typography-default'), background: LI('bg-default'), color: LI('text-default') });
R('.aec-menu__item:hover, .aec-menu__item:focus-visible', { background: LI('bg-hover'), color: LI('text-hover') });
R('.aec-menu__item:active', { background: LI('bg-active'), color: LI('text-active') });
R('.aec-menu__item[aria-checked="true"], .aec-menu__item[aria-selected="true"]', { ...T('list-item-typography-selected'), background: LI('bg-selected'), color: LI('text-selected') });
R('.aec-menu__item[aria-checked="true"]::after, .aec-menu__item[aria-selected="true"]::after', { background: LI('icon-selected') });
R('.aec-menu__item[aria-disabled="true"], .aec-menu__item:disabled', { background: LI('bg-disabled'), color: LI('text-disabled') });
R('.aec-menu__item .aec-icon', { color: LI('icon-default') });
R('.aec-menu__desc', { ...T('list-item-typography-description'), color: LI('description-default') });

C('Modal, sheets, drawer');
R('.aec-modal', { 'border-radius': d('dialog-container-bg-border-radius'), background: a('dialog-color-bg'), 'border-style': 'solid', 'border-color': a('dialog-color-border'), 'border-width': d('dialog-container-bg-border-width') });
R('.aec-modal--right-sheet', { 'border-radius': d('drawer-container-right-bg-border-radius'), background: a('drawer-color-bg'), 'border-width': `0 0 0 ${d('drawer-container-right-bg-border-left-width')}`, 'border-color': a('drawer-color-border') });
R('.aec-modal--bottom-sheet', { 'border-radius': d('drawer-container-bottom-bg-border-radius'), background: a('drawer-color-bg'), 'border-width': `${d('drawer-container-bottom-bg-border-top-width')} 0 0`, 'border-color': a('drawer-color-border') });

C('Header');
R('.aec-header', { background: a('header-color-bg-default'), 'border-bottom-color': a('header-color-border-default'), color: a('header-color-text-default') });
R('.aec-header__account', { color: a('header-color-icon-default') });

C('Slider — --aec-slider-*');
const SL = s => a(`slider-color-${s}`);
const track = sel => `linear-gradient(to right, ${SL('track-bg-default')} var(--_from), ${sel} var(--_from) var(--_pct), ${SL('track-bg-default')} var(--_pct))`;
for (const p of ['-webkit-slider-runnable-track', '-moz-range-track']) {
  R(`.aec-slider::${p}`, { height: a('slider-track-height'), 'border-radius': a('slider-track-border-radius'), background: track(SL('track-bg-selected')) });
  R(`.aec-slider:disabled::${p}`, { background: track(SL('track-bg-disabled')) });
  R(`.aec-range .aec-slider + .aec-slider::${p}`, { background: 'transparent' });
}
R('.aec-slider::-webkit-slider-thumb', { width: a('slider-handle-width'), height: a('slider-handle-height'), 'margin-top': `calc((${a('slider-track-height')} - ${a('slider-handle-height')}) / 2)`, 'border-radius': a('slider-handle-border-radius'), 'border-width': a('slider-handle-border-width'), 'border-color': SL('handle-border-default'), background: SL('handle-bg-default') });
R('.aec-slider::-moz-range-thumb', { 'border-radius': a('slider-handle-border-radius'), 'border-color': SL('handle-border-default'), background: SL('handle-bg-default') });
R('.aec-slider:disabled::-webkit-slider-thumb', { 'border-color': SL('handle-border-disabled'), background: SL('handle-bg-disabled') });
R('.aec-slider:disabled::-moz-range-thumb', { 'border-color': SL('handle-border-disabled'), background: SL('handle-bg-disabled') });

C('Card (patterns)');
R('.aec-card', { 'border-radius': d('card-container-bg-border-radius'), 'border-width': d('card-container-bg-border-width'), background: a('card-color-bg-default'), 'border-color': a('card-color-border-default') });

/* ------------------------------------------------------------------ Output */
export function bridgeCSS() {
  const out = ['/*', ' * DRS brand bridge — GENERATED by scripts/build-brands.mjs from scripts/brand-bridge.mjs. Do not edit by hand.', ' * Maps brand tokens (css/brands/<id>.css) onto the .aec-* components. Requires a [data-brand] ancestor.', ' */', ''];
  for (const [sel, body] of rules) {
    if (sel === null) { out.push(`/* ${body} */`); continue; }
    const scoped = sel.split(/,(?![^(]*\))/).map(s => `[data-brand] ${s.trim()}`).join(',\n');
    out.push(`${scoped} {`);
    for (const [k, v] of Object.entries(body)) out.push(`  ${k}: ${v};`);
    out.push('}');
  }
  return out.join('\n') + '\n';
}

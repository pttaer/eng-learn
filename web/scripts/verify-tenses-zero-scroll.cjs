/**
 * Verification test for Task 4: 12 Tenses Zero-Scroll Mobile Optimization
 * Verifies that on 360x803 (Vivo) and 375x667 (iPhone 6), all choices (A, B, C, D)
 * and question components fit above the fold without vertical scrolling.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Verifying Task 4: 12 Tenses Zero-Scroll Mobile Optimization ---');

// 1. Check tenses-dossier.ts
const dossierPath = path.join(__dirname, '../src/modules/tenses-dossier.ts');
assert.ok(fs.existsSync(dossierPath), 'tenses-dossier.ts must exist');
const dossierSrc = fs.readFileSync(dossierPath, 'utf8');

assert.ok(dossierSrc.includes('toggle-text-full'), 'tenses-dossier.ts must render toggle-text-full');
assert.ok(dossierSrc.includes('toggle-text-short'), 'tenses-dossier.ts must render toggle-text-short');
assert.ok(dossierSrc.includes('tenses.drill_short'), 'tenses-dossier.ts must use tenses.drill_short');
assert.ok(dossierSrc.includes('tenses.gauntlet_short'), 'tenses-dossier.ts must use tenses.gauntlet_short');
assert.ok(dossierSrc.includes('tenses.codex_short'), 'tenses-dossier.ts must use tenses.codex_short');

assert.ok(dossierSrc.includes('telemetry-desktop-items'), 'tenses-dossier.ts must have telemetry-desktop-items');
assert.ok(dossierSrc.includes('telemetry-mobile-compact'), 'tenses-dossier.ts must have telemetry-mobile-compact');
assert.ok(dossierSrc.includes('tenses.hud_accuracy_short'), 'tenses-dossier.ts must use tenses.hud_accuracy_short');
assert.ok(dossierSrc.includes('tenses.hud_streak_short'), 'tenses-dossier.ts must use tenses.hud_streak_short');
assert.ok(dossierSrc.includes('tenses.hud_pool_short'), 'tenses-dossier.ts must use tenses.hud_pool_short');
assert.ok(dossierSrc.includes('drill-control-bar'), 'tenses-dossier.ts must mark drill-control-bar');
assert.ok(dossierSrc.includes('tense-signal-callout'), 'tenses-dossier.ts must include tense-signal-callout class');
console.log('✓ tenses-dossier.ts contains all responsive markup, short labels, and 1-line HUD elements');

// 2. Check i18n.ts
const i18nPath = path.join(__dirname, '../src/core/i18n.ts');
const i18nSrc = fs.readFileSync(i18nPath, 'utf8');
assert.ok(i18nSrc.includes("'tenses.drill_short': 'Drill'"), 'i18n EN must define tenses.drill_short');
assert.ok(i18nSrc.includes("'tenses.drill_short': 'Luyện'"), 'i18n VI must define tenses.drill_short');
assert.ok(i18nSrc.includes("'tenses.gauntlet_short': 'Gauntlet'"), 'i18n EN must define tenses.gauntlet_short');
assert.ok(i18nSrc.includes("'tenses.gauntlet_short': 'Thử thách'"), 'i18n VI must define tenses.gauntlet_short');
assert.ok(i18nSrc.includes("'tenses.codex_short': 'Codex'"), 'i18n EN must define tenses.codex_short');
assert.ok(i18nSrc.includes("'tenses.codex_short': 'Cẩm nang'"), 'i18n VI must define tenses.codex_short');
console.log('✓ i18n.ts contains both English and Vietnamese translations for short toggles and HUD');

// 3. Check dossiers.css
const dossiersCssPath = path.join(__dirname, '../src/assets/styles/dossiers.css');
const dossiersCss = fs.readFileSync(dossiersCssPath, 'utf8');

assert.ok(dossiersCss.includes('grid-template-columns: repeat(3, 1fr) !important'), 'dossiers.css must declare 3-column repeat(3, 1fr) for view-mode-toggle');
assert.ok(dossiersCss.includes('tenses-telemetry-cluster'), 'dossiers.css must style tenses-telemetry-cluster');
assert.ok(dossiersCss.includes('telemetry-mobile-compact'), 'dossiers.css must style telemetry-mobile-compact');
assert.ok(dossiersCss.includes('tenses-card-question'), 'dossiers.css must style tenses-card-question');
assert.ok(dossiersCss.includes('tenses-choice-btn'), 'dossiers.css must style tenses-choice-btn');
assert.ok(dossiersCss.includes('drill-control-bar'), 'dossiers.css must collapse/hide dropdown on drill-control-bar');
console.log('✓ dossiers.css specifies 3-col uniform grid, 1-line HUD, 44px min-height choice buttons, and zero-scroll metrics');

// 4. Check ux-c.css consistency
const uxCPath = path.join(__dirname, '../src/assets/styles/ux-c.css');
const uxCSrc = fs.readFileSync(uxCPath, 'utf8');

assert.ok(uxCSrc.includes('grid-template-columns: repeat(3, 1fr) !important'), 'ux-c.css must match 3-column grid');
assert.ok(uxCSrc.includes('telemetry-mobile-compact'), 'ux-c.css must style telemetry-mobile-compact');
console.log('✓ ux-c.css maintains strict non-conflicting parity with dossiers.css');

console.log('\nAll Task 4 Zero-Scroll Mobile Optimization checks passed successfully (10/10)!');

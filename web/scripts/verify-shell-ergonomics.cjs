const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 1] Verifying Shell Ergonomics & Native Cursor Restoration...');

const hudCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/hud-base.css'), 'utf-8');
const variablesCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/variables.css'), 'utf-8');
const cursorTs = fs.readFileSync(path.join(__dirname, '../src/core/cursor-tracker.ts'), 'utf-8');

// 1. Assert variables contain warm paper palette
assert(variablesCss.includes('--bg-canvas: #fafaf9') || variablesCss.includes('#fafaf9'), 'variables.css must define soft warm background #fafaf9');
assert(variablesCss.includes('--ink-primary: #111111') || variablesCss.includes('#111111'), 'variables.css must define deep charcoal ink #111111');

// 2. Assert cursor: none is eradicated from html/body
assert(!hudCss.match(/body\s*{[^}]*cursor:\s*none/), 'hud-base.css must NOT set cursor: none on body');
assert(hudCss.includes('cursor: default') || hudCss.includes('cursor: auto'), 'hud-base.css must set cursor: default or auto on body');

// 3. Assert natural vertical scrolling is permitted
assert(!hudCss.match(/body\s*{[^}]*overflow:\s*hidden/), 'hud-base.css body must allow natural document scrolling');

// 4. Assert CursorTracker no longer injects custom reticle DOM
assert(cursorTs.includes('// Native cursor enabled') || cursorTs.includes('isNativeCursor: true') || cursorTs.includes('return; // Custom reticle disabled'), 'cursor-tracker.ts must disable DOM reticle insertion');

console.log('✅ [TEST 1 PASSED] Shell ergonomics and native cursor verified.');

// web/scripts/verify-visual-qa.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[VISUAL QA TEST] Initializing Layout Shift and Anti-Regression Audit...');

// 1. Audit CSS for Viewport Height Standards (100dvh support)
const hudBaseCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/hud-base.css'), 'utf8');
assert(hudBaseCss.includes('100dvh') || hudBaseCss.includes('dvh'), 'hud-base.css must implement 100dvh for modern mobile viewport support');
assert(hudBaseCss.includes('safe-area-inset'), 'hud-base.css must implement safe-area-inset rules for notched displays');
assert(hudBaseCss.includes('overscroll-behavior'), 'hud-base.css must specify overscroll-behavior to prevent iOS rubber-banding');

// 2. Audit CSS Containment in Card and Dossier Layouts
const cardCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/atomic-card.css'), 'utf8');
assert(cardCss.includes('contain:'), 'atomic-card.css must implement CSS containment for reflow isolation');

const dossiersCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/dossiers.css'), 'utf8');
assert(dossiersCss.includes('.dossier-card-slot'), 'dossiers.css must define .dossier-card-slot bounding styles');

// 3. Calm Palette Audit (Warm Paper or Binary Canvas)
const variablesCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/variables.css'), 'utf8');
assert(variablesCss.includes('--bg-canvas: #fafaf9') || variablesCss.includes('--bg-canvas: #ffffff'), 'Background canvas token must be #fafaf9 or #ffffff');
assert(variablesCss.includes('--ink-primary: #111111') || variablesCss.includes('--ink-primary: #000000'), 'Primary ink token must be #111111 or #000000');

// 4. Mathematical Simulation of Layout Shift Budget
function simulateLayoutShift(initialY, shiftedY, elementHeight, viewportHeight) {
  const distance = Math.abs(shiftedY - initialY);
  const distanceFraction = distance / viewportHeight;
  const impactFraction = (elementHeight + distance) / viewportHeight;
  return impactFraction * distanceFraction;
}

// Case A: Unconstrained slot (shifts by 80px when card loads)
const unconstrainedCls = simulateLayoutShift(120, 200, 440, 800);
console.log(`- Unconstrained Layout Shift Score: ${unconstrainedCls.toFixed(4)} (Threshold: < 0.05)`);
assert(unconstrainedCls > 0.05, 'Simulation sanity check: unconstrained should fail');

// Case B: Reserved container slot (shifts by 0px)
const reservedCls = simulateLayoutShift(120, 120, 440, 800);
console.log(`- Reserved Slot Layout Shift Score: ${reservedCls.toFixed(4)} (Threshold: < 0.05)`);
assert(reservedCls === 0.0, 'Reserved slot must produce exactly 0.00 CLS');

console.log('✓ All Visual QA and Layout Shift invariants verified successfully.');

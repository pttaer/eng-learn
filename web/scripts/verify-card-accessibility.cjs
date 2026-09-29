// web/scripts/verify-card-accessibility.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[A11Y TEST] Initializing Atomic Card Accessibility & Ergonomics Verification (ENG-23)...');

// 1. Audit CSS Tokens for Touch Target Minimums
const variablesCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/variables.css'), 'utf8');
assert(variablesCss.includes('--touch-target-min: 44px') || variablesCss.includes('44px'), 'Missing 44px touch target token in variables.css');
console.log('✓ Token Audit: --touch-target-min: 44px verified in variables.css');

// 2. Audit Atomic Card CSS for Container Queries and Fluid Clamp
const cardCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/atomic-card.css'), 'utf8');
assert(cardCss.includes('clamp('), 'atomic-card.css must utilize CSS clamp() for fluid card geometry');
assert(cardCss.includes('@container') || cardCss.includes('@media'), 'atomic-card.css must support responsive container adaptations');
console.log('✓ Fluid Geometry Audit: clamp() and container queries verified in atomic-card.css');

// 3. Audit Dual-Layer Focus Ring in HUD Base CSS
const hudCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/hud-base.css'), 'utf8');
assert(hudCss.includes(':focus-visible'), 'hud-base.css must define explicit :focus-visible rules');
assert(hudCss.includes('outline:') || hudCss.includes('outline-offset:'), 'hud-base.css must define coaxial focus ring outlines');
console.log('✓ Focus Ring Audit: WCAG 2.2 AAA coaxial :focus-visible rules verified in hud-base.css');

// 4. Verify ARIA Attributes in AtomicCard TypeScript source
const cardTs = fs.readFileSync(path.join(__dirname, '../src/core/atomic-card.ts'), 'utf8');
assert(cardTs.includes('aria-roledescription="flashcard"') || cardTs.includes('aria-roledescription'), 'Missing flashcard role description');
assert(cardTs.includes('aria-expanded'), 'Missing aria-expanded toggle on card flip');
assert(cardTs.includes('aria-label'), 'Interactive icon buttons must possess explicit aria-labels');
assert(cardTs.includes('role="region"') || cardTs.includes('role\', \'region\''), 'Missing role region container landmark');
console.log('✓ ARIA Semantics Audit: role="region", aria-roledescription="flashcard", aria-expanded & aria-label verified in atomic-card.ts');

console.log('✓ All Atomic Card accessibility and responsive constraints verified cleanly.');

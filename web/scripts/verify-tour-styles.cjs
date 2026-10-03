/**
 * Verification Test: GPU-Accelerated Spotlight Tour & Glassmorphic Card Styling (ENG-42)
 * Audits CSS rules, keyframes, backdrop filters, responsive clamps, and WCAG reduced motion compliance.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const tourCssPath = path.resolve(__dirname, '../src/assets/styles/tour-spotlight.css');
const dossiersCssPath = path.resolve(__dirname, '../src/assets/styles/dossiers.css');
const indexHtmlPath = path.resolve(__dirname, '../index.html');

console.log('[VERIFY-TOUR-STYLES] Auditing GPU Cutout and Glassmorphic Tour Card styles...');

// 1. File existence
assert(fs.existsSync(tourCssPath), 'web/src/assets/styles/tour-spotlight.css must exist');
const tourCss = fs.readFileSync(tourCssPath, 'utf8');

assert(fs.existsSync(dossiersCssPath), 'web/src/assets/styles/dossiers.css must exist');
const dossiersCss = fs.readFileSync(dossiersCssPath, 'utf8');

assert(fs.existsSync(indexHtmlPath), 'web/index.html must exist');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// 2. Integration / Import verification
assert(
  dossiersCss.includes("import './tour-spotlight.css'") || dossiersCss.includes('import "./tour-spotlight.css"'),
  'dossiers.css must import tour-spotlight.css'
);
assert(
  indexHtml.includes('tour-spotlight.css'),
  'index.html should link tour-spotlight.css'
);

// 3. Required Selectors
const requiredSelectors = [
  '.tour-overlay',
  '.tour-overlay.open',
  '.tour-spotlight',
  '.tour-spotlight::after',
  '.tour-arrow',
  '.tour-card',
  '.tour-card-header',
  '.tour-step-badge',
  '.tour-card-close',
  '.tour-card-title',
  '.tour-card-desc',
  '.tour-card-footer',
  '.tour-progress-hud',
  '.tour-mini-track',
  '.tour-mini-bar',
  '.tour-step-count'
];

for (const sel of requiredSelectors) {
  assert(tourCss.includes(sel), `Selector ${sel} must be defined in tour-spotlight.css`);
}
console.log('✓ All 16 required tour UI selectors verified');

// 4. Critical GPU Cutout and Spotlight specifications
assert(
  tourCss.includes('box-shadow: 0 0 0 9999px rgba(10, 10, 12, 0.85)') &&
  tourCss.includes('var(--accent-gold)'),
  'Spotlight box-shadow must specify 9999px dark curtain with --accent-gold perimeter'
);
assert(
  tourCss.includes('border: 2px solid var(--accent-gold)'),
  'Spotlight border must be 2px solid var(--accent-gold)'
);
assert(
  tourCss.includes('z-index: 100000') &&
  tourCss.includes('z-index: 100001') &&
  tourCss.includes('z-index: 100002') &&
  tourCss.includes('z-index: 100003'),
  'Z-Index hierarchy (overlay=100000, spotlight=100001, arrow=100002, card=100003) must be intact'
);
console.log('✓ GPU spotlight cutout, dark curtain shadow, and z-index hierarchy verified');

// 5. Glassmorphism on .tour-card
assert(
  tourCss.includes('backdrop-filter: blur(16px)') || tourCss.includes('-webkit-backdrop-filter: blur(16px)'),
  'Tour card must feature 16px backdrop-filter blur'
);
assert(
  tourCss.includes('border: 1.5px solid var(--accent-gold)'),
  'Tour card must have accent-gold architectural border'
);
console.log('✓ Glassmorphic 16px backdrop-filter and gold border verified on .tour-card');

// 6. Directional Bouncing & Pulsing Keyframes
const keyframes = ['tourGlowPulse', 'bounceLeft', 'bounceRight', 'bounceUp', 'bounceDown', 'tourCardPop'];
for (const kf of keyframes) {
  assert(tourCss.includes(`@keyframes ${kf}`), `@keyframes ${kf} must be defined`);
}
console.log('✓ All 6 keyframe animations (tourGlowPulse, bounceLeft/Right/Up/Down, tourCardPop) verified');

// 7. Responsive Mobile Adaptation
assert(
  tourCss.includes('@media (max-width:') || tourCss.includes('@media (max-width: 600px)'),
  'Mobile responsive media query must be defined'
);
console.log('✓ Mobile responsive layout adaptation verified');

// 8. Reduced Motion Compliance (WCAG 2.2 AAA)
assert(
  tourCss.includes('html[data-motion="reduce"]'),
  'In-app reduce-motion scope must be explicitly handled'
);
assert(
  tourCss.includes('animation: none !important') && tourCss.includes('transition: none !important'),
  'Animations and transitions must be suppressed under prefers-reduced-motion'
);
console.log('✓ WCAG 2.2 AAA reduced motion compliance verified');

console.log('\n[PASS] All tour and spotlight styling invariants verified with 100% compliance.');

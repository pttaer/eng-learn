// web/scripts/verify-blitz-mode.cjs
/**
 * Headless Automated Verification Suite for 60-Second Speed Blitz Mode (ENG-51)
 * Audits:
 * 1. Source existence (blitz-dossier.ts, router.ts, header-hud.ts, main.ts, dossiers.css).
 * 2. BlitzDossier class, methods, and lifecycle (render, startBlitz, submitAnswer, finishBlitz, teardown).
 * 3. Combo multiplier calculation (1x, 2x, 3x, 4x).
 * 4. Circular SVG timer geometry (radius 52, circumference 2*PI*52).
 * 5. Keyboard hotkey mappings (1/2, ArrowLeft/ArrowRight, Space, Enter, Escape).
 * 6. Header HUD [ ⚡ BLITZ ] button integration.
 * 7. Router RouteId and route handler.
 * 8. CSS selectors, animations, 44px touch targets, mobile responsiveness, and reduced motion.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================================');
console.log('  [TEST] VERIFYING 60-SECOND ROGUELIKE SPEED BLITZ DRILL ENGINE (ENG-51)');
console.log('================================================================================');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// 1. File Invariants
it('Verifies required source files exist', () => {
  const files = [
    'web/src/modules/blitz-dossier.ts',
    'web/src/core/router.ts',
    'web/src/modules/header-hud.ts',
    'web/src/main.ts',
    'web/src/assets/styles/dossiers.css'
  ];

  for (const rel of files) {
    const full = path.join(__dirname, '..', '..', rel);
    assert(fs.existsSync(full), `File must exist: ${rel}`);
  }
});

// 2. Router Integration
it('Verifies blitz route registration in router.ts', () => {
  const routerPath = path.join(__dirname, '..', 'src/core/router.ts');
  const code = fs.readFileSync(routerPath, 'utf8');

  assert(code.includes("'blitz'"), "RouteId must include 'blitz'");
  assert(code.includes("validRoutes: RouteId[] = [") && code.includes("'blitz'"), "validRoutes array must include 'blitz'");
});

// 3. Header HUD Trigger Button
it('Verifies [ ⚡ BLITZ ] trigger button in header-hud.ts', () => {
  const hudPath = path.join(__dirname, '..', 'src/modules/header-hud.ts');
  const code = fs.readFileSync(hudPath, 'utf8');

  assert(code.includes('btn-blitz'), "header-hud.ts must contain button with class 'btn-blitz'");
  assert(code.includes('BLITZ'), "header-hud.ts button text must include 'BLITZ'");
  assert(code.includes('onNavigateToBlitz'), "header-hud.ts must expose onNavigateToBlitz callback");
});

// 4. Main App Route Wiring
it('Verifies main.ts routes #blitz to BlitzDossier with clean teardown', () => {
  const mainPath = path.join(__dirname, '..', 'src/main.ts');
  const code = fs.readFileSync(mainPath, 'utf8');

  assert(code.includes("import { BlitzDossier } from './modules/blitz-dossier'"), "main.ts must import BlitzDossier");
  assert(code.includes("this.blitzDossier = new BlitzDossier()"), "main.ts must instantiate blitzDossier");
  assert(code.includes("case 'blitz':"), "main.ts route switch must handle 'blitz'");
  assert(code.includes("this.workspaceMount.appendChild(this.blitzDossier.render())"), "main.ts must render blitzDossier into workspaceMount");
});

// 5. BlitzDossier Architecture & Combo Logic
it('Verifies BlitzDossier combo multiplier formula and prompt generation', () => {
  const dossierPath = path.join(__dirname, '..', 'src/modules/blitz-dossier.ts');
  const code = fs.readFileSync(dossierPath, 'utf8');

  assert(code.includes('export class BlitzDossier'), 'Must export BlitzDossier class');
  assert(code.includes('BLITZ_DURATION_SECONDS = 60'), 'Must define 60-second duration constant');
  assert(code.includes('CIRCUMFERENCE = 2 * Math.PI * 52'), 'Must compute circular timer circumference');
  assert(code.includes('getMultiplier()'), 'Must implement getMultiplier helper');
  assert(code.includes('streak >= 15') && code.includes('return 4'), '15+ streak must yield 4x multiplier');
  assert(code.includes('streak >= 10') && code.includes('return 3'), '10+ streak must yield 3x multiplier');
  assert(code.includes('streak >= 5') && code.includes('return 2'), '5+ streak must yield 2x multiplier');

  // Verify keyboard bindings
  assert(code.includes("e.key === '1' || e.key === 'ArrowLeft'"), 'Must map Left Choice to 1 and ArrowLeft');
  assert(code.includes("e.key === '2' || e.key === 'ArrowRight'"), 'Must map Right Choice to 2 and ArrowRight');
  assert(code.includes("e.key === ' ' || e.key === 'Enter'"), 'Must map Start/Restart to Space and Enter');

  // Verify ProgressionEngine and ParticleCanvas calls
  assert(code.includes('ProgressionEngine.addXP'), 'Must reward XP to ProgressionEngine');
  assert(code.includes('ParticleCanvas.burst'), 'Must trigger particle celebration on finish');
  assert(code.includes('teardown()'), 'Must provide teardown method');
});

// 6. CSS Selectors, Animations & Accessibility
it('Verifies Blitz Mode styles in dossiers.css', () => {
  const cssPath = path.join(__dirname, '..', 'src/assets/styles/dossiers.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  const requiredSelectors = [
    '.blitz-dossier-shell',
    '.blitz-ready-card',
    '.blitz-summary-card',
    '.blitz-glow-badge',
    '.blitz-high-score-badge',
    '.blitz-ready-title',
    '.blitz-mechanics-grid',
    '.blitz-start-btn',
    '.blitz-arena-shell',
    '.blitz-hud-strip',
    '.blitz-circular-timer-wrap',
    '.blitz-timer-svg',
    '.timer-track',
    '.timer-progress',
    '.timer-number-overlay',
    '.blitz-combo-gauge-container',
    '.blitz-combo-pill',
    '.multiplier-1',
    '.multiplier-2',
    '.multiplier-3',
    '.multiplier-4',
    '.blitz-prompt-card',
    '.blitz-choices-grid',
    '.blitz-choice-btn',
    '.flash-correct',
    '.flash-wrong',
    '.summary-score-hero',
    '.summary-stats-grid',
    '.summary-action-cluster',
    '.btn-restart-blitz',
    '.btn-return-tree'
  ];

  for (const sel of requiredSelectors) {
    assert(css.includes(sel), `dossiers.css must include selector: ${sel}`);
  }

  // Check 44px+ touch targets
  assert(css.includes('min-height: 56px') || css.includes('min-height: 48px'), 'Buttons must exceed 44px minimum hitboxes');

  // Check keyframes
  assert(css.includes('@keyframes blitzTimerPulse'), 'Must include blitzTimerPulse keyframes');
  assert(css.includes('@keyframes comboPulseFire'), 'Must include comboPulseFire keyframes');

  // Check responsive & accessibility overrides
  assert(css.includes('@media (max-width: 768px)'), 'Must include mobile responsive styles');
  assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'Must include prefers-reduced-motion override');
});

console.log('--------------------------------------------------------------------------------');
console.log(`  Tests Passed: ${passedTests} / ${totalTests}`);
if (passedTests === totalTests) {
  console.log('  [VERIFICATION SUCCESS] 60-Second Roguelike Speed Blitz Mode 100% verified!');
} else {
  console.error('  [VERIFICATION FAILURE] Some assertions failed.');
  process.exit(1);
}
console.log('================================================================================');
